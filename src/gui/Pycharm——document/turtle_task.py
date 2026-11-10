import turtle
import math

# 设置画布
wn = turtle.Screen()
wn.title("球弹跳动画")
wn.setup(800, 600)
wn.bgcolor("white")
wn.tracer(0)  # 关闭自动刷新

# 创建球
ball = turtle.Turtle()
ball.shape("circle")
ball.color("red")
ball.penup()
ball.goto(-350, 200)  # 起始位置

# 初始参数 (缩小1000倍，原5/15 → 0.5/1.5 → 0.005/0.015，水平速度进一步降低)
ball_speed = 0.001  # 水平移动速度
bounce_height = 0.15  # 弹跳高度 
jump_speed = 0.0003  # 弹跳速度

# 滑动条参数
slider_min = -200
slider_max = 200
slider_height_speed = -220
slider_height_bounce = -260
slider_length = 400

# 创建滑动条函数
class Slider:
    def __init__(self, x, y, length, min_val, max_val, initial_val, label, color="blue"):
        self.x = x
        self.y = y
        self.length = length
        self.min_val = min_val
        self.max_val = max_val
        self.value = initial_val
        self.label = label
        self.color = color
        
        # 创建滑动条轨道
        self.track = turtle.Turtle()
        self.track.speed(0)
        self.track.penup()
        self.track.goto(x, y)
        self.track.shape("square")
        self.track.color("lightgray")
        self.track.shapesize(stretch_wid=0.5, stretch_len=length/20)
        
        # 创建滑动条滑块
        self.handle = turtle.Turtle()
        self.handle.speed(0)
        self.handle.penup()
        self.handle.goto(self._value_to_position(initial_val), y)
        self.handle.shape("square")
        self.handle.color(color)
        self.handle.shapesize(stretch_wid=0.8, stretch_len=0.8)
        
        # 创建标签
        self.label_turtle = turtle.Turtle()
        self.label_turtle.speed(0)
        self.label_turtle.penup()
        self.label_turtle.hideturtle()
        self.label_turtle.goto(x - length/2 - 80, y)
        self.label_turtle.write(label, align="right", font=("Arial", 12, "normal"))
        
        # 创建值显示
        self.value_turtle = turtle.Turtle()
        self.value_turtle.speed(0)
        self.value_turtle.penup()
        self.value_turtle.hideturtle()
        self.value_turtle.goto(x + length/2 + 20, y)
        
        # 更新值显示
        self.update_value_display()
    
    def _value_to_position(self, value):
        # 将值转换为滑块位置
        ratio = (value - self.min_val) / (self.max_val - self.min_val)
        return self.x - self.length/2 + ratio * self.length
    
    def _position_to_value(self, x_pos):
        # 将位置转换为值
        ratio = max(0, min(1, (x_pos - (self.x - self.length/2)) / self.length))
        return self.min_val + ratio * (self.max_val - self.min_val)
    
    def update_value(self, x_pos):
        # 更新滑块值
        self.value = self._position_to_value(x_pos)
        # 更新滑块位置
        self.handle.goto(self._value_to_position(self.value), self.y)
        # 更新值显示
        self.update_value_display()
    
    def update_value_display(self):
        # 更新值显示文本
        self.value_turtle.clear()
        self.value_turtle.write(f"{self.value:.1f}", align="left", font=("Arial", 12, "normal"))

# 创建速度和弹跳强度的滑动条（调整范围适应更小的值）
speed_slider = Slider(0, slider_height_speed, slider_length, 0.0001, 0.01, ball_speed, "移动速度:", "blue")
bounce_slider = Slider(0, slider_height_bounce, slider_length, 0.0001, 0.02, jump_speed, "弹跳强度:", "red")

# 滑动条点击处理函数
def handle_slider_click(x, y):
    global ball_speed, jump_speed
    # 检查点击是否在速度滑动条区域
    if abs(y - slider_height_speed) < 20 and abs(x) <= slider_length/2:
        speed_slider.update_value(x)
        ball_speed = speed_slider.value
    # 检查点击是否在弹跳滑动条区域
    elif abs(y - slider_height_bounce) < 20 and abs(x) <= slider_length/2:
        bounce_slider.update_value(x)
        jump_speed = bounce_slider.value

# 绑定点击事件
wn.onclick(handle_slider_click)

# 物理参数 - 修改为固定弹跳高度
y_pos = 200
max_height = 200  # 最大弹跳高度
bounce_period = 1500  # 弹跳周期（帧数）- 增加5倍以减慢弹跳频率（约1秒0.4次）
current_frame = 0

# 动画主循环
while True:
    wn.update()
    
    # 水平移动
    x = ball.xcor() + ball_speed
    if x > 400:
        x = -400  # 循环回到左边
    
    # 使用正弦函数实现固定高度的弹跳
    # 正弦函数确保每次弹跳高度一致，形成完美的周期性弹跳
    current_frame += 1
    if current_frame >= bounce_period:
        current_frame = 0
    
    # 计算当前帧的弹跳高度（使用正弦函数的绝对值确保球在地面上方）
    # 调整频率以适应jump_speed参数
    bounce_factor = 0.5 * (1 - math.cos(2 * math.pi * current_frame / bounce_period))
    # 根据jump_speed调整弹跳的强度
    y_pos = -200 + (max_height + 200) * bounce_factor * (jump_speed * 100)  # 放大jump_speed的影响
    
    # 确保y_pos不会超出范围
    y_pos = max(-200, min(y_pos, max_height))
    
    # 更新球的位置
    ball.goto(x, y_pos)

# 保持窗口打开
turtle.mainloop()