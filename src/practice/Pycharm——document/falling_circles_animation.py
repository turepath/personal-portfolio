import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import random

# 设置动画参数
WINDOW_WIDTH = 300  # 修改为300像素宽度
WINDOW_HEIGHT = 600
FPS = 30
DURATION = 10  # 动画持续时间（秒）
MAX_CIRCLES = 50  # 最大同时存在的小球数量
FALL_SPEED = 3  # 统一的下落速度（像素/帧）
CIRCLE_RADIUS = 5  # 小圆圈半径
SPAWN_RATE = 0.1  # 每帧生成新小球的概率

# 初始化小圆圈的位置、颜色和大小
circles = []
# 初始生成少量小球
for _ in range(10):
    # 初始位置：x随机在窗口宽度内，y在窗口顶部外
    x = random.randint(0, WINDOW_WIDTH)
    y = random.randint(-50, 0)  # 从窗口顶部外开始
    
    # 随机颜色：从红色到黄色的渐变（R:255, G:0-255, B:0）
    r = 255
    g = random.randint(0, 255)
    b = 0
    color = (r/255, g/255, b/255)  # 转换为matplotlib的颜色范围(0-1)
    
    # 随机大小（±20%）
    size = CIRCLE_RADIUS * random.uniform(0.8, 1.2)
    
    circles.append({
        'x': x,
        'y': y,
        'color': color,
        'size': size
    })

# 创建图形和坐标轴
fig, ax = plt.subplots(figsize=(WINDOW_WIDTH/100, WINDOW_HEIGHT/100), dpi=100)
ax.set_xlim(0, WINDOW_WIDTH)
ax.set_ylim(0, WINDOW_HEIGHT)
ax.set_aspect('equal')
ax.axis('off')  # 隐藏坐标轴

# 在动画1/2处画一条浅细的绿线
mid_line = ax.axhline(y=WINDOW_HEIGHT/2, color='lightgreen', linewidth=1)

# 初始化小圆圈对象
scat = ax.scatter(
    [circle['x'] for circle in circles],
    [circle['y'] for circle in circles],
    s=[circle['size']**2 for circle in circles],  # scatter的size参数是面积
    c=[circle['color'] for circle in circles],
    alpha=0.8
)

# 更新函数：每一帧更新小圆圈的位置
def update(frame):
    global circles
    
    # 随机生成新的小球（如果当前小球数量未达到最大值）
    if len(circles) < MAX_CIRCLES and random.random() < SPAWN_RATE:
        # 新小球的初始位置：x随机在窗口宽度内，y在窗口顶部外
        x = random.randint(0, WINDOW_WIDTH)
        y = random.randint(-50, -10)  # 从窗口顶部外开始
        
        # 随机颜色：从红色到黄色的渐变（R:255, G:0-255, B:0）
        r = 255
        g = random.randint(0, 255)
        b = 0
        color = (r/255, g/255, b/255)
        
        # 随机大小（±20%）
        size = CIRCLE_RADIUS * random.uniform(0.8, 1.2)
        
        circles.append({
            'x': x,
            'y': y,
            'color': color,
            'size': size
        })
    
    # 更新每个小圆圈的位置
    for circle in circles:
        # 使用统一的下落速度
        circle['y'] += FALL_SPEED
    
    # 移除超出窗口底部的小球
    circles = [circle for circle in circles if circle['y'] < WINDOW_HEIGHT + CIRCLE_RADIUS]
    
    # 更新scatter对象的位置和颜色
    scat.set_offsets([[circle['x'], circle['y']] for circle in circles])
    scat.set_sizes([circle['size']**2 for circle in circles])
    scat.set_color([circle['color'] for circle in circles])
    
    return scat, mid_line

# 创建动画
ani = animation.FuncAnimation(
    fig=fig,
    func=update,
    frames=FPS*DURATION,
    interval=1000/FPS,
    blit=True
)

# 设置标题
plt.title('随机颜色小圆圈下落动画', fontproperties='SimHei')
plt.tight_layout()

# 保存动画（可选）
# ani.save('falling_circles.mp4', writer='ffmpeg', fps=FPS)

# 显示动画
plt.show()

print(f"动画最大同时显示{MAX_CIRCLES}个随机颜色的小圆圈")
print(f"小圆圈以{FPS} FPS的帧率下落，统一速度为{FALL_SPEED}像素/帧")
print(f"窗口大小：{WINDOW_WIDTH}x{WINDOW_HEIGHT}像素")
print(f"动画持续时间：{DURATION}秒")
