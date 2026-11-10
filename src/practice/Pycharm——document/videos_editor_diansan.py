import cv2
import os

def process_videos_to_frames(source_folder, target_fps=10, target_size=(640, 480)):
    """
    读取文件夹下的mp4文件，按指定FPS抽帧，调整为指定分辨率(640x480)，
    并连续编号保存在新建子文件夹中。
    """
    
    # 1. 定义输出文件夹路径
    output_folder = os.path.join(source_folder, "extracted_frames_640x480")
    # 如果输出文件夹不存在，则创建
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        print(f"已创建输出文件夹: {output_folder}")
    else:
        print(f"输出文件夹已存在: {output_folder}")

    # 2. 获取所有MP4文件并排序
    video_files = [f for f in os.listdir(source_folder) if f.lower().endswith('.mp4')]
    video_files.sort() # 按文件名排序，保证处理顺序

    if not video_files:
        print("未在指定路径找到MP4文件。")
        return
    print(f"找到 {len(video_files)} 个视频文件，目标分辨率: {target_size}，准备开始处理...")
    # 全局帧序号计数器 (从1开始)
    global_frame_count = 1
    # 3. 遍历处理每个视频
    for video_file in video_files:
        video_path = os.path.join(source_folder, video_file)
        print(f"正在处理: {video_file} ...")
        cap = cv2.VideoCapture(video_path)        
        if not cap.isOpened():
            print(f"无法打开文件: {video_file}")
            continue
        # 获取视频原始FPS
        original_fps = cap.get(cv2.CAP_PROP_FPS)
        # 计算抽帧间隔
        if original_fps > 0:
            frame_interval = int(round(original_fps / target_fps))
        else:
            frame_interval = 1             
        if frame_interval < 1:
            frame_interval = 1
        current_frame_idx = 0 
        while True:
            ret, frame = cap.read()
            # 如果读不到帧（视频结束），跳出循环
            if not ret:
                break
            # 判断当前帧是否需要保存
            if current_frame_idx % frame_interval == 0:
                # ==========================================
                # 修改点：调整图片分辨率到 640x480
                # cv2.resize 参数顺序是 (宽, 高)
                # ==========================================
                resized_frame = cv2.resize(frame, target_size)
                output_filename = os.path.join(output_folder, f"{global_frame_count}.jpg")
                # 保存调整大小后的图片
                cv2.imwrite(output_filename, resized_frame)
                global_frame_count += 1
            current_frame_idx += 1
        cap.release()
        print(f"  - {video_file} 处理完成。")

    print("="*30)
    print(f"所有视频处理完毕！")
    print(f"总计生成图片: {global_frame_count - 1} 张")
    print(f"保存路径: {output_folder}")

if __name__ == "__main__":
    # 你的目标路径
    folder_path = r"D:\Hunan Agricultural University\Robot\video_editor1"
    # 执行函数 (target_size=(宽, 高))
    if os.path.exists(folder_path):
        process_videos_to_frames(folder_path, target_fps=10, target_size=(640, 480))
    else:
        print(f"错误: 找不到路径 {folder_path}")