import ctypes
import sys
import pyautogui
import time
import keyboard  # 新增键盘监听库
import win32api
import win32con

# 设置安全模式（鼠标移到屏幕左上角会中断程序）
pyautogui.FAILSAFE = True

# 设置点击间隔时间（秒）
#interval = 2 #这玩意好像没用  
# 设置目标坐标（获取方式：把鼠标移到目标位置后运行pyautogui.position()）
target_x, target_y = 100, 200  

# 设置点击参数
# 修正后的参数设置（删除重复定义）
click_interval = 2.2 # 点击间隔改为2.2秒
coords = [
    (1560, 597),   # 第一个点击坐标
    (1820, 1303)   # 第二个点击坐标
]

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False
        
if not is_admin():
    ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, " ".join(sys.argv), None, 1)
    sys.exit()

def click(x, y):
    win32api.SetCursorPos((x, y))
    time.sleep(0.1)#缓冲看看有用没
    win32api.mouse_event(win32con.MOUSEEVENTF_LEFTDOWN, x, y, 0, 0)
    time.sleep(0.2)#延迟点击时间
    win32api.mouse_event(win32con.MOUSEEVENTF_LEFTUP, x, y, 0, 0)

try:
    print("程序已启动，按ESC键终止")
    while True:
        # 使用新的点击函数替换原有代码
        click(coords[0][0], coords[0][1])
        print(f"已点击坐标 {coords[0]}")
        
        time.sleep(1.4)
        
        click(coords[1][0], coords[1][1])
        print(f"已点击坐标 {coords[1]}")
        
        time.sleep(2)

        if keyboard.is_pressed('esc'):
            break
            
except Exception as e:
    print(f"发生错误: {str(e)}")
finally:
    print("程序已终止")

# 删除末尾重复的代码