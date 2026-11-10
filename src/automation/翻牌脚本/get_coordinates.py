import pyautogui
import time

print("鼠标坐标实时获取程序已启动 (按Ctrl+C终止)")
print("将鼠标移动到需要获取的位置，程序会持续输出坐标")

try:
    while True:
        # 获取当前鼠标坐标
        x, y = pyautogui.position()
        
        # 格式化输出坐标信息
        position_str = f"当前坐标：X={x:<4} Y={y:<4}"
        
        # 添加终端颜色控制（Windows 10+ 支持）
        print("\033[92m" + position_str + "\033[0m", end='\r')  # 绿色显示
        
        time.sleep(0.1)  # 降低CPU占用

except KeyboardInterrupt:
    print("\n\033[91m程序已终止\033[0m")
    # 最终坐标保留显示
    x_final, y_final = pyautogui.position()
    print(f"最终捕获坐标：X={x_final}, Y={y_final}")