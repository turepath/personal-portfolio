import sensor, lcd
import time
import image
import gc

# 初始化LCD显示屏和摄像头sensor
lcd.init()
sensor.reset()

# 初始设置为QVGA分辨率用于显示
sensor.set_pixformat(sensor.RGB565)
sensor.set_framesize(sensor.QVGA)  # 320x240
sensor.run(1)
sensor.skip_frames(20)  # 增加初始跳帧数

# 照片计数器和保存路径
photo_count = 1
save_path = "/sd/picture/"

# 创建时钟对象
clock = time.clock()
last_capture_time = time.ticks_ms()

print("开始运行，每5秒自动拍摄一张高分辨率照片...")

# 改进的高分辨率照片捕获函数
def capture_high_res_photo():
    # 先清除之前的帧缓冲
    for i in range(5):
        sensor.snapshot()

    # 切换到高分辨率
    sensor.set_framesize(sensor.VGA)  # 640x480

    # 增加跳帧数，确保传感器稳定
    sensor.skip_frames(10)

    # 捕获图像
    img = sensor.snapshot()

    # 切换回低分辨率用于显示
    sensor.set_framesize(sensor.QVGA)

    # 增加跳帧数，确保显示稳定
    sensor.skip_frames(5)

    return img

# 主循环
while True:
    gc.collect()
    clock.tick()

    # 获取当前时间
    current_time = time.ticks_ms()

    # 获取摄像头图像（低分辨率用于显示）
    img = sensor.snapshot()

    # 创建显示图像
    display_img = img.copy()

    # 计算帧率并显示
    fps = clock.fps()
    display_img.draw_string(0, 0, "FPS:%2.1f" % fps, color=(0, 0, 255), scale=2.0)
    display_img.draw_string(0, 30, "Photos: %d" % (photo_count-1), color=(255, 0, 0), scale=2.0)

    # 检查是否到达5秒间隔
    if time.ticks_diff(current_time, last_capture_time) >= 5000:
        try:
            # 临时切换到高分辨率拍照
            high_res_img = capture_high_res_photo()

            # 生成文件名
            filename = "bc-%d.jpg" % photo_count
            full_path = save_path + filename

            # 保存高分辨率图片
            high_res_img.save(full_path, quality=90)
            print("已保存高分辨率照片: %s" % filename)

            # 在显示图像上添加保存状态
            display_img.draw_string(0, 60, "Saved: %s" % filename, color=(0, 255, 0), scale=2.0)

            # 更新计数器和时间
            photo_count += 1
            last_capture_time = current_time

            # 及时释放高分辨率图像内存
            del high_res_img

        except Exception as e:
            print("保存失败: ", e)
            display_img.draw_string(0, 60, "Save Failed!", color=(255, 0, 0), scale=2.0)

        # 强制垃圾回收
        gc.collect()

    # 显示倒计时
    time_remaining = 5 - (time.ticks_diff(current_time, last_capture_time) // 1000)
    if time_remaining > 0:
        display_img.draw_string(0, 90, "Next: %ds" % time_remaining, color=(255, 255, 0), scale=2.0)

    # 显示在LCD屏幕上
    lcd.display(display_img)

    # 及时删除显示图像以释放内存
    del display_img

    # 短暂延时，减少CPU负载
    time.sleep_ms(50)
