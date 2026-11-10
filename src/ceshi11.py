import cv2

for i in range(0,3):
    cap = cv2.VideoCapture(i, cv2.CAP_MSMF)
    if cap.isOpened():
        print(f"摄像头{i} 可以打开（MSMF后端）")
        cap.release()
    else:
        print(f"摄像头{i} 不可用")
