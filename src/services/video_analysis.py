import cv2
import asyncio
import random
from collections import defaultdict, deque
from datetime import datetime
from fastapi.concurrency import run_in_threadpool
from pathlib import Path
from ultralytics import YOLO
from models.bird_species import DetectionRecord
import torch

class VideoAnalyzer:
    def __init__(self):
        # 动态参数配置
        self.min_frame_interval = 1  # 最小处理间隔
        self.conf_threshold = 0.6    # 基础置信度阈值
        self.adaptive_threshold = True  # 启用动态阈值
        self.max_track_age = 300  # 最大未更新帧数（约10秒，30fps）
        self.min_track_length = 5  # 最小有效轨迹长度
        self.class_mapping = {}  # 物种ID到中文名的映射
        
        # 批量写入配置
        self.batch_size = 50  # 每50条记录批量写入一次
        self.batch_buffer = deque(maxlen=200)  # 缓冲区，最大200条
        self.batch_lock = asyncio.Lock()  # 异步锁
        
        # 设备选择
        self.device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
        
        # 模型加载 - 使用绝对路径
        model_path = Path(__file__).parent / 'trainmodel/yolov8n_bird.onnx'
        self.model = YOLO(str(model_path), task='detect')
        
        # 跟踪器数据结构
        self.tracker = defaultdict(lambda: {
            'last_counted': 0,  # 最后计数帧号
            'trajectory': [],
            'positions': [],
            'stable_count': 0,
            'counted': False,  # 防重标志
            'last_updated': 0  # 最后更新时间
        })
        
        self.frame_queue = asyncio.Queue(maxsize=30)  # 异步帧队列
        self.current_frame = 0  # 当前帧计数器

    async def process_video(self, video_url: str):
        """异步视频处理入口"""
        try:
            # 启动后台批量刷新任务
            batch_flush_task = asyncio.create_task(self._periodic_flush())
            
            # 在独立线程中运行视频读取
            await run_in_threadpool(self._video_reader, video_url)
            
            # 异步处理帧队列
            while True:
                frame, frame_num = await self.frame_queue.get()
                self.current_frame = frame_num
                
                if frame is None:  # 终止信号
                    break
                
                if self._should_process_frame(frame_num):
                    await self._analyze_frame(frame, frame_num, video_url)
                    
        except Exception as e:
            print(f"视频处理错误: {str(e)}")
            raise
        finally:
            batch_flush_task.cancel()
            try:
                await batch_flush_task
            except asyncio.CancelledError:
                pass
                
            await self._cleanup_tracks()
            # 确保刷新所有剩余记录
            await self._flush_buffer(force=True)

    def _video_reader(self, video_url: str):
        """同步视频读取线程"""
        try:
            cap = cv2.VideoCapture(video_url)
            if not cap.isOpened():
                raise ConnectionError(f"无法打开视频: {video_url}")
                
            frame_num = 0
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # 异步放入队列（防止阻塞）
                asyncio.run_coroutine_threadsafe(
                    self._safe_put_frame(frame, frame_num),
                    asyncio.get_running_loop()
                )
                
                frame_num += 1
                
        except Exception as e:
            print(f"视频读取错误: {str(e)}")
        finally:
            if 'cap' in locals() and cap.isOpened():
                cap.release()
            # 发送结束信号
            asyncio.run_coroutine_threadsafe(
                self.frame_queue.put((None, None)),
                asyncio.get_running_loop()
            )

    async def _safe_put_frame(self, frame, frame_num):
        """安全放入帧队列（带流量控制）"""
        while self.frame_queue.full():
            await asyncio.sleep(0.01)  # 短暂等待
        await self.frame_queue.put((frame, frame_num))

    async def _analyze_frame(self, frame, frame_num, video_url):
        """单帧分析逻辑"""
        try:
            # 动态置信度调整（带下限）
            conf = max(0.3, self.conf_threshold * (0.98 ** (frame_num // 100)))
            
            # 模型推理
            results = self.model.track(
                frame,
                persist=True,
                classes=[14, 15, 16],
                conf=conf,
                device=self.device,  # 使用自动选择的设备
                verbose=False
            )
            
            # 处理检测结果
            if results and results[0].boxes.id is not None:
                boxes = results[0].boxes.xywh.cpu()
                track_ids = results[0].boxes.id.int().cpu().tolist()
                clss = results[0].boxes.cls.cpu().tolist()
                centers = [(box[0].item(), box[1].item()) for box in boxes]
                
                await self._update_tracking(track_ids, clss, centers, video_url, frame_num)
                
        except Exception as e:
            print(f"帧分析错误: {str(e)}")

    async def _update_tracking(self, track_ids, class_ids, centers, video_url, frame_num):
        """更新追踪状态"""
        for track_id, class_id, center in zip(track_ids, class_ids, centers):
            track_data = self.tracker[track_id]
            track_data['last_updated'] = frame_num
            
            # 重置计数条件：当超过间隔帧数且目标重新出现
            if (frame_num - track_data['last_counted']) > self.count_interval:
                track_data['counted'] = False

            # 记录轨迹
            track_data['positions'].append(center)
            track_data['trajectory'].append(class_id)
            
            # 清理旧数据（保留最近5个点）
            if len(track_data['trajectory']) > 10:
                track_data['trajectory'] = track_data['trajectory'][-5:]
                track_data['positions'] = track_data['positions'][-5:]
            
            # 稳定性检查：需要至少5帧历史
            if len(track_data['trajectory']) >= 5 and not track_data['counted']:
                if self._is_stable_track(track_data):
                    await self._record_detection(
                        class_id=class_id,
                        video_url=video_url,
                        frame_num=frame_num
                    )
                    track_data.update({
                        'last_counted': frame_num,
                        'counted': True,
                        'stable_count': track_data.get('stable_count', 0) + 1
                    })

    def _should_process_frame(self, frame_num):
        """动态帧处理决策"""
        # 基础处理频率 + 队列负载感知
        base_interval = frame_num % self.min_frame_interval == 0
        random_sample = random.random() < 0.3
        
        # 队列负载高时降低处理频率
        if self.frame_queue.qsize() > 20:
            return random.random() < 0.1
        
        return base_interval or random_sample

    async def _cleanup_tracks(self):
        """清理过期追踪数据"""
        current_frame = self.current_frame
        expired_ids = []
        
        for track_id, data in list(self.tracker.items()):
            # 超时检查（超过max_track_age未更新）
            if current_frame - data['last_updated'] > self.max_track_age:
                expired_ids.append(track_id)
                
        # 清理过期跟踪器
        for track_id in expired_ids:
            del self.tracker[track_id]
        
        print(f"已清理 {len(expired_ids)} 个追踪器，剩余 {len(self.tracker)} 个活动跟踪器")

    def _is_stable_track(self, track_data):
        """轨迹稳定性检查"""
        # 1. 类型一致性：最近5帧分类结果一致
        if len(track_data['trajectory']) < 5:
            return False
            
        type_consistency = len(set(track_data['trajectory'][-5:])) == 1
        
        # 2. 位置稳定性：平均移动速度阈值
        position_stable = False
        if len(track_data['positions']) >= 5:
            total_distance = 0.0
            position_count = min(5, len(track_data['positions']))
            
            # 计算最近5帧的总移动距离
            for i in range(1, position_count):
                p1 = track_data['positions'][-i]
                p2 = track_data['positions'][-i-1]
                dx = p1[0] - p2[0]
                dy = p1[1] - p2[1]
                total_distance += (dx**2 + dy**2)**0.5
                
            # 计算平均速度（像素/帧）
            avg_speed = total_distance / (position_count - 1)
            position_stable = avg_speed < 5.0  # 5像素/帧
        
        return type_consistency and position_stable

    async def _record_detection(self, class_id, video_url, frame_num):
        """添加到批量缓冲区"""
        record_data = {
            "video_url": video_url,
            "frame_number": frame_num,
            "species_id": int(class_id),# 对应 BirdSpecies.id
            "confidence": float(self.conf_threshold),
            "timestamp": datetime.now()
        }
        
        async with self.batch_lock:
            self.batch_buffer.append(record_data)
            
        # 检查是否达到批量大小
        if len(self.batch_buffer) >= self.batch_size:
            await self._flush_buffer()

    async def _periodic_flush(self, interval=5):
        """定期刷新缓冲区（即使未达到批量大小）"""
        while True:
            await asyncio.sleep(interval)
            await self._flush_buffer()

    async def _flush_buffer(self, force=False):
        """执行批量写入操作"""
        async with self.batch_lock:
            if not self.batch_buffer:
                return
                
            if force or len(self.batch_buffer) >= self.batch_size:
                try:
                    # 创建ORM对象列表
                    records = [DetectionRecord(**data) for data in self.batch_buffer]
                    
                    # 批量创建（假设ORM支持bulk_create）
                    await DetectionRecord.bulk_create(records)
                    
                    print(f"成功批量写入 {len(records)} 条检测记录")
                    self.batch_buffer.clear()
                    
                except Exception as e:
                    print(f"批量写入失败: {str(e)}")
                    # 添加重试机制
                    if not hasattr(self, '_retry_count'):
                        self._retry_count = 0
                    if self._retry_count < 3:
                        self._retry_count += 1
                        await asyncio.sleep(2 ** self._retry_count)
                        await self._flush_buffer(force=True)

    async def _load_species_mapping(self):
        """从数据库加载物种ID与中文名映射"""
        from models.bird_species import BirdSpecies
        species = await BirdSpecies.all()
        self.class_mapping = {species.id: species.chinese_name for species in species}
        
        # 添加兜底逻辑（如果数据库无数据时）
        if not self.class_mapping:
            self.class_mapping = {14: '未知物种'}  # 临时默认值
            print("[警告] 数据库物种表为空，使用默认映射")