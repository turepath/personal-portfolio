import cv2
import numpy as np
from ultralytics import YOLO
import os
import time

# 设置环境变量以避免潜在的冲突
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

def main():
    # 加载训练好的模型
    model_path = 'D:\Programming file\P-document\\bocai_detection(yolov8)\\runs\detect\\train4\weights\\best.pt'
    print(f"加载模型: {model_path}")
    model = YOLO(model_path)
    print(model.names)
    print(model.task)
    model.predict(source="D:\dataset\images\\val\Azure-winged_Magpie\Azure-winged_Magpie_src1_0000_image_48.jpg",save=True, show=False)
    # model.predict(source=0, save=False, show=True)
    # # 打开摄像头 (0 通常是默认摄像头)
    # cap = cv2.VideoCapture(0)
    
    # # 检查摄像头是否成功打开
    # if not cap.isOpened():
    #     print("错误: 无法打开摄像头")
    #     return
    
    # # 初始化计时器，用于控制坐标更新频率
    # last_target_update_time = time.time()
    # last_no_target_update_time = time.time()
    # target_update_interval = 1.0  # 检测到目标时的更新间隔为1秒
    # no_target_update_interval = 4.0  # 未检测到目标时的更新间隔为4秒
    
    # try:
    #     while True:
    #         # 读取一帧图像
    #         ret, frame = cap.read()
            
    #         if not ret:
    #             print("无法获取图像帧")
    #             break
            
    #         # 使用模型进行预测，禁用详细日志输出
    #         results = model(frame, verbose=False)
            
    #         # 获取检测结果
    #         detections = results[0]
            
    #         # 获取当前时间
    #         current_time = time.time()
            
    #         # 检查是否有检测到的对象
    #         has_detections = len(detections.boxes) > 0
            
    #         # 检查是否需要更新坐标信息（检测到目标时每秒更新一次）
    #         should_update_target = has_detections and (current_time - last_target_update_time) >= target_update_interval
            
    #         # 检查是否需要输出未检测到信息（未检测到时每4秒更新一次）
    #         should_update_no_target = not has_detections and (current_time - last_no_target_update_time) >= no_target_update_interval
            
    #         # 如果未检测到目标且需要更新，输出提示信息
    #         if should_update_no_target:
    #             print("未检测到目标")
    #             last_no_target_update_time = current_time
            
    #         # 遍历所有检测到的对象
    #         for box in detections.boxes:
    #             # 获取边界框坐标
    #             x1, y1, x2, y2 = map(int, box.xyxy[0])
                
    #             # 获取置信度和类别
    #             conf = box.conf[0]
    #             cls_id = int(box.cls[0])
                
    #             # 获取类别名称
    #             class_name = detections.names[cls_id]
                
    #             # 在图像上绘制边界框
    #             cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                
    #             # 计算中心点坐标
    #             center_x, center_y = (x1 + x2) // 2, (y1 + y2) // 2
                
    #             # 显示类别、置信度和坐标信息
    #             label = f"{class_name} ({conf:.2f}): ({center_x}, {center_y})"
    #             cv2.putText(frame, label, (x1, y1 - 10), 
    #                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                
    #             # 只有在需要更新坐标时才输出到控制台
    #             if should_update_target:
    #                 print(f"检测到: {class_name}, 置信度: {conf:.2f}, "
    #                       f"坐标: 左上角({x1}, {y1}), 右下角({x2}, {y2}), 中心({center_x}, {center_y})")
            
    #         # 如果检测到目标且需要更新，重置目标更新计时器
    #         if should_update_target:
    #             last_target_update_time = current_time
            
    #         # 显示结果
    #         cv2.imshow('YOLOv8 实时目标检测', frame)
            
    #         # 等待键盘输入，按 'q' 键退出程序
    #         if cv2.waitKey(1) & 0xFF == ord('q'):
    #             break
    
    # finally:
    #     # 释放资源
    #     cap.release()
    #     cv2.destroyAllWindows()

if __name__ == "__main__":
    main()