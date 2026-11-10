import cv2

'''
#任务一
img=cv2.imread("bird.jpg",0)#输出为Mat类型文件
cv2.namedWindow("img",0)
cv2.resizeWindow("img",2560,1920)#只有在namedWindow中flags为0(未使用WINDOW_AUTOSIZE)才会生效
cv2.imshow("img",img)
key=cv2.waitKey(0)
if key &0xFF == ord("q"):
    cv2.destroyWindow("img")
    exit()
elif key &0xFF == ord("s"):
    cv2.imwrite("bird_1.png",img)
'''

#视频采集及录制
cv2.namedWindow("video",0)
cap=cv2.VideoCapture(0)
#cv2.resizeWindow("video",2480,1280)
fourcc=cv2.VideoWriter_fourcc(*"mp4v")#创建VideoWriter为写多媒体文件
vw=cv2.VideoWriter("./out.mp4",fourcc,25,(640,480))
while True:
    a,b=cap.read()
    cv2.imshow("video",b)
    vw.write(b)#写数据到多媒体文件

    key = cv2.waitKey(1)#如果设置为0则一直在等待，不会跳出循环
    if key == ord("q"):
        #quit()
        break
cap.release()
cv2.destroyWindow("video")
vw.release()