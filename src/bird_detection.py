import cv2
from ultralytics import YOLO
from pathlib import Path
import torch
import datetime

# 设置路径
video_path = "./videos/input_video.mp4"  # 输入视频路径
output_path = "./output_frames/detected_bird5.mp4"  # 输出视频路径
model_path = "./trainmodel/best.pt"  # YOLOv8 模型路径
stats_path = "./output_frames/detection_results5.txt"  # 统计结果文件路径

# 加载训练好的 YOLOv8 模型
model = YOLO(model_path)

# 打开视频文件
cap = cv2.VideoCapture(video_path)
if not cap.isOpened():
    print(f"错误: 无法打开视频文件 {video_path}")
    exit()

# 获取视频属性
frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
duration = total_frames / fps

# 创建视频写入对象
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width, frame_height))

# 初始化统计数据收集
class_counts = {}
frame_count = 0
detection_count = 0
start_time = datetime.datetime.now()

print(f"开始处理视频: {Path(video_path).name}")
print(f"视频参数: {frame_width}x{frame_height} @ {fps:.2f} FPS, 总帧数: {total_frames}")

# 处理视频帧
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    
    frame_count += 1
    if frame_count % 10 == 0:  # 每10帧打印一次进度
        print(f"处理进度: {frame_count}/{total_frames} ({frame_count/total_frames*100:.1f}%)")
    
    # 使用YOLOv8模型进行推理
    results = model.predict(
        source=frame,
        conf=0.7,  # 置信度阈值
        iou=0.45,  # IOU阈值
        imgsz=640,  # 推理尺寸
        device='cuda:0' if torch.cuda.is_available() else 'cpu',  # 自动选择设备
        verbose=False  # 关闭详细输出
    )
    
    # 绘制检测结果
    annotated_frame = results[0].plot(
        line_width=2,  # 边界框线宽
        font_size=1.0,  # 字体大小
        labels=True,  # 显示标签
        conf=True  # 显示置信度
    )
    
    # 显示处理后的帧
    cv2.imshow('鸟类识别 - YOLOv8', annotated_frame)
    
    # 写入输出视频
    out.write(annotated_frame)
    
    # 收集检测结果统计
    boxes = results[0].boxes
    if boxes is not None:
        for box in boxes:
            class_id = int(box.cls)
            class_name = model.names[class_id]
            confidence = float(box.conf)
            
            # 更新类别计数
            class_counts[class_name] = class_counts.get(class_name, 0) + 1
            detection_count += 1
    
    # 按'q'退出
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# 计算处理时间
end_time = datetime.datetime.now()
processing_time = end_time - start_time
avg_fps = frame_count / processing_time.total_seconds()

# 释放资源
cap.release()
out.release()
cv2.destroyAllWindows()

# 保存检测结果统计
with open(stats_path, "w") as f:
    # 基本信息
    f.write(f"鸟类检测结果统计报告\n")
    f.write(f"生成时间: {end_time.strftime('%Y-%m-%d %H:%M:%S')}\n")
    f.write(f"视频文件: {Path(video_path).name}\n")
    f.write(f"模型文件: {Path(model_path).name}\n")
    f.write(f"视频时长: {duration:.2f} 秒\n")
    f.write(f"视频帧数: {total_frames} 帧\n")
    f.write(f"分辨率: {frame_width}x{frame_height}\n")
    f.write(f"处理时间: {processing_time}\n")
    f.write(f"平均帧率: {avg_fps:.2f} FPS\n\n")
    
    # 检测摘要
    f.write(f"检测摘要:\n")
    f.write(f"处理帧数: {frame_count}\n")
    f.write(f"总检测次数: {detection_count}\n")
    f.write(f"检测到鸟类种类: {len(class_counts)} 种\n\n")
    
    # 详细类别统计
    f.write("鸟类类别统计:\n")
    f.write("----------------------------------------\n")
    f.write("类别名称\t检测次数\t占比\n")
    f.write("----------------------------------------\n")
    
    for class_name, count in sorted(class_counts.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / detection_count) * 100
        f.write(f"{class_name}\t{count}\t{percentage:.2f}%\n")
    
    f.write("----------------------------------------\n")

print(f"\n视频处理完成! 结果视频已保存至: {output_path}")
print(f"检测统计已保存至: {stats_path}")