#原版
'''
import cmath
import gc
import time

import image
import lcd
import sensor
from maix import KPU

lcd.init()  # Init lcd display
lcd.clear(lcd.RED)  # Clear lcd screen.

# sensor.reset(dual_buff=True)      # improve fps
sensor.reset()  # Reset and initialize the sensor.
sensor.set_pixformat(sensor.RGB565)  # Set pixel format to RGB565 (or GRAYSCALE)
sensor.set_framesize(sensor.QVGA)  # Set frame size to QVGA (320x240)
sensor.set_vflip(True)  # 翻转摄像头
sensor.set_hmirror(True)  # 镜像摄像头
sensor.skip_frames(time=1000)  # Wait for settings take effect.
clock = time.clock()  # Create a clock object to track the FPS.

print("ready load model")

labels = ["黄叶烂叶"]  # 类名称，按照label.txt顺序填写
anchor = (
    7.40, 1.35, 5.70, 2.20, 6.94, 2.75, 5.67, 3.79, 7.55, 4.52
)  # anchors,使用anchor.txt中第二行的值

kpu = KPU()
# 从sd或flash加载模型
kpu.load_kmodel('/sd/KPU/train_model_and_use/det.kmodel')
#kpu.load_kmodel(0x300000, 584744)
kpu.init_yolo2(
    anchor,
    anchor_num=(int)(len(anchor) / 2),
    img_w=320,
    img_h=240,
    net_w=320,
    net_h=240,
    layer_w=10,
    layer_h=8,
    threshold=0.6,
    nms_value=0.3,
    classes=len(labels),
)

while True:
    gc.collect()

    clock.tick()
    img = sensor.snapshot()

    kpu.run_with_output(img)
    dect = kpu.regionlayer_yolo2()

    fps = clock.fps()

    if len(dect) > 0:
        for l in dect:
            a = img.draw_rectangle(l[0], l[1], l[2], l[3], color=(0, 255, 0))

            info = "%s %.3f" % (labels[l[4]], l[5])
            a = img.draw_string(l[0], l[1], info, color=(255, 0, 0), scale=2.0)
            print(info)
            del info

    a = img.draw_string(0, 0, "%2.1ffps" % (fps), color=(0, 60, 255), scale=2.0)
    lcd.display(img)
'''

#修改版
import gc
import time
import image
import lcd
import sensor
from maix import KPU

lcd.init()
lcd.clear(lcd.RED)

sensor.reset()
sensor.set_pixformat(sensor.RGB565)
sensor.set_framesize(sensor.QVGA)

# 摄像头方向设置 - 请根据实际显示效果调整
sensor.set_vflip(False)  # 垂直翻转
sensor.set_hmirror(False)  # 水平镜像

sensor.skip_frames(time=1000)
clock = time.clock()

print("准备加载模型...")

labels = ["黄叶烂叶"]
anchor = (7.40, 1.35, 5.70, 2.20, 6.94, 2.75, 5.67, 3.79, 7.55, 4.52)

kpu = KPU()

try:
    kpu.load_kmodel('/sd/KPU/train_model_and_use/det.kmodel')
    print("模型加载成功")
except Exception as e:
    print("模型加载失败:", e)
    while True:
        img = sensor.snapshot()
        img.draw_string(10, 100, "模型加载失败!", color=(255, 0, 0), scale=2.0)
        lcd.display(img)
        time.sleep(1)

kpu.init_yolo2(
    anchor,
    anchor_num=(int)(len(anchor) / 2),
    img_w=320,
    img_h=240,
    net_w=320,
    net_h=240,
    layer_w=10,
    layer_h=8,
    threshold=0.6,
    nms_value=0.3,
    classes=len(labels)
)

print("开始检测...")

while True:
    gc.collect()
    clock.tick()
    img = sensor.snapshot()

    kpu.run_with_output(img)
    dect = kpu.regionlayer_yolo2()
    fps = clock.fps()

    if len(dect) > 0:
        for i, l in enumerate(dect):
            x, y, w, h, class_id, confidence = l

            # 计算标注框的中心位置
            center_x = x + w // 2
            center_y = y + h // 2

            # 绘制检测框
            img.draw_rectangle(x, y, w, h, color=(0, 255, 0), thickness=2)

            # 绘制中心点
            img.draw_circle(center_x, center_y, 3, color=(255, 0, 0), fill=True)

            # 绘制中心坐标
            center_info = "(%d,%d)" % (center_x, center_y)
            img.draw_string(center_x-20, center_y+5, center_info, color=(255, 255, 0), scale=1.2)

            # 绘制标签和置信度
            info = "%s %.2f" % (labels[class_id], confidence)
            img.draw_string(x, y-20, info, color=(255, 0, 0), scale=1.5)

            # 打印检测信息到串口
            detection_info = "目标%d: %s 置信度:%.2f 位置:(%d,%d) 大小:%dx%d" % (i+1, labels[class_id], confidence, center_x, center_y, w, h)
            print(detection_info)

    # 显示帧率和检测数量
    img.draw_string(0, 0, "FPS:%.1f" % fps, color=(0, 60, 255), scale=1.5)
    img.draw_string(0, 20, "检测数量:%d" % len(dect), color=(0, 255, 0), scale=1.5)

    # 显示在LCD上
    lcd.display(img)
