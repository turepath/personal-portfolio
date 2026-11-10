import tkinter as tk
from tkinter import simpledialog, font
import numpy as np
import itertools

# ---------- 参数输入 ----------
root = tk.Tk()
root.withdraw()          # 隐藏主窗口，只保留对话框
text = simpledialog.askstring('Input', '请输入要跳动的文字：', parent=root)
param = simpledialog.askstring(
    'Input',
    '画布宽 高 字体大小 列容器宽 周期系数 k（空格分隔）：',
    parent=root
)
root.destroy()

# 解析参数
w, h, fz, col_w, k = map(float, param.strip().split())
w, h, fz, col_w, k = int(w), int(h), int(fz), int(col_w), float(k)

# ---------- 主窗口 ----------
main = tk.Tk()
main.title('Font Jump')
canvas = tk.Canvas(main, width=w, height=h, bg='white')
canvas.pack()

# 字体对象
fnt = font.Font(family='Helvetica', size=fz, weight='bold')

# 预生成 sin|2πt| 轨迹表（1000 点，周期 1）
TRAJECTORY_PTS = 1000
traj = np.abs(np.sin(2 * np.pi * np.linspace(0, 1, TRAJECTORY_PTS)))

# 计算每个字符的横向基准 x
char_ids = []          # 保存 canvas.create_text 返回的 id
base_x = []
offset = (w - len(text) * col_w) // 2   # 居中
for idx, ch in enumerate(text):
    x = offset + idx * col_w + col_w // 2
    base_x.append(x)
    cid = canvas.create_text(x, h // 2, text=ch, font=fnt, anchor='center')
    char_ids.append(cid)

# 动画控制
running = False
idx_cycle = itertools.cycle(range(len(text)))   # 0 1 2 ... 0 1 2 ...
curr_idx = next(idx_cycle)
ticker = 0              # 轨迹表指针

def animate():
    global ticker, curr_idx
    if not running:
        return
    # 计算当前纵向偏移
    dy = int(traj[ticker] * 30)          # 30 像素为最大跳动幅度
    canvas.coords(char_ids[curr_idx], base_x[curr_idx], h // 2 - dy)

    ticker = (ticker + 1) % TRAJECTORY_PTS
    if ticker == 0:                      # 一个周期结束，换下一个字符
        curr_idx = next(idx_cycle)
    main.after(int(k * 10), animate)     # k 越大越慢

def toggle():
    global running
    running = not running
    btn.config(text='Stop' if running else 'Start')
    if running:
        animate()

btn = tk.Button(main, text='Start', command=toggle)
btn.pack()

main.mainloop()