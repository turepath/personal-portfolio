import sensor, lcd
import time
import image


# 初始化LCD显示屏和摄像头sensor
lcd.init()
sensor.reset()

# 摄像头设置
sensor.set_pixformat(sensor.RGB565)
#sensor.set_framesize(sensor.QVGA)#VGA(640*480)、QVGA(320*240)、QQVGA(160*120)
sensor.set_framesize(sensor.VGA)
sensor.run(1)
sensor.skip_frames(10)

# 照片计数器和保存路径
photo_count = 155#程序中断后需要更改参数
save_path="/sd/picture/"
#e_path ="D:\湖南农业大学\机创大赛（菠菜组）\视觉\图库"
# 注意：K210无法直接访问Windows的D盘，需要先保存到SD卡，然后复制到电脑

# 创建时钟对象
clock = time.clock()
last_capture_time = time.ticks_ms()  # 记录上次拍摄时间

print("开始运行，每5秒自动拍摄一张照片...")

while True:
    clock.tick()

    # 获取摄像头图像
    img = sensor.snapshot()
    #display_img = img.copy()

    # 计算帧率并显示
    #fps = clock.fps()
    #img.draw_string(0, 0, "%2.1ffps" % fps, color=(0, 0, 255), scale=2.0)
    #display_img.draw_string(0, 0, "%2.1ffps" % fps, color=(0, 0, 255), scale=2.0)

    # 显示当前照片计数和状态
    #img.draw_string(0, 30, "Photos: %d" % (photo_count-1), color=(255, 0, 0), scale=2.0)#会随照片一起被保存
    #display_img.draw_string(0, 30, "Photos: %d" % (photo_count-1), color=(255, 0, 0), scale=2.0)#不会随图像被保存

    # 检查是否到达5秒间隔
    current_time = time.ticks_ms()
    if time.ticks_diff(current_time, last_capture_time) >=5000:  # 5秒 = 5000毫秒

        # 生成文件名
        filename = "bc-%d.jpg" % photo_count
        full_path = save_path + filename

        try:
            # 保存图片到SD卡
            img.save(full_path, quality=95)
            #img.sensor.snapshot(full_path, quality=95)错误用法
            print("已保存: %s" % filename)

            # 在图像上显示保存状态
            img.draw_string(0, 60, "Saved: %s" % filename, color=(0, 255, 0), scale=2.0)

            # 更新计数器和时间
            photo_count += 1
            last_capture_time = current_time

        except Exception as e:
            print("保存失败: ", e)
            img.draw_string(0, 60, "Save Failed!", color=(255, 0, 0), scale=2.0)

    # 显示倒计时（可选）
    time_remaining = 5 - (time.ticks_diff(current_time, last_capture_time) // 1000)
    if time_remaining > 0:
        img.draw_string(0, 90, "Next: %ds" % time_remaining, color=(255, 255, 0), scale=2.0)

    # 显示在LCD屏幕上
    lcd.display(img)
    #lcd.clear()
