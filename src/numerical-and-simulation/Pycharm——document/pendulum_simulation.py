import tkinter as tk
import math
import time

class PendulumSimulation:
    def __init__(self, root):
        # 设置主窗口
        self.root = root
        self.root.title("单摆物理实验模拟器")
        self.root.geometry("800x600")
        self.root.resizable(True, True)
        
        # 单摆物理参数
        self.length = 200  # 摆长
        self.gravity = 9.8  # 重力加速度
        self.angle = math.pi / 6  # 初始角度（30度）
        self.angle_velocity = 0  # 角速度
        self.angle_acceleration = 0  # 角加速度
        self.mass = 1.0  # 摆球质量
        self.damping = 0.995  # 阻尼系数
        
        # 模拟器状态
        self.running = False
        self.last_time = 0
        
        # 创建画布
        self.canvas_frame = tk.Frame(root)
        self.canvas_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        self.canvas = tk.Canvas(
            self.canvas_frame, 
            bg="white", 
            width=700, 
            height=400,
            highlightthickness=2,
            highlightbackground="#333333"
        )
        self.canvas.pack(fill=tk.BOTH, expand=True)
        
        # 绘制支点位置（画布中心顶部）
        self.pivot_x = 350
        self.pivot_y = 50
        
        # 创建控制面板
        self.control_frame = tk.Frame(root, bg="#f0f0f0", padx=10, pady=10)
        self.control_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # 参数调节滑块
        self.create_parameter_controls()
        
        # 按钮控制
        self.create_control_buttons()
        
        # 绘制初始单摆
        self.update_pendulum()
    
    def create_parameter_controls(self):
        # 摆长控制
        tk.Label(self.control_frame, text="摆长:", bg="#f0f0f0", font=("SimHei", 10)).grid(row=0, column=0, padx=5, pady=5)
        self.length_var = tk.DoubleVar(value=self.length)
        self.length_slider = tk.Scale(
            self.control_frame, 
            from_=50, 
            to=300, 
            orient=tk.HORIZONTAL, 
            variable=self.length_var,
            resolution=1,
            length=150,
            font=("SimHei", 9)
        )
        self.length_slider.grid(row=0, column=1, padx=5, pady=5)
        self.length_label = tk.Label(self.control_frame, text=f"{self.length:.1f}", bg="#f0f0f0", width=5)
        self.length_label.grid(row=0, column=2, padx=5, pady=5)
        self.length_var.trace_add("write", self.update_length_label)
        
        # 重力加速度控制
        tk.Label(self.control_frame, text="重力加速度:", bg="#f0f0f0", font=("SimHei", 10)).grid(row=0, column=3, padx=5, pady=5)
        self.gravity_var = tk.DoubleVar(value=self.gravity)
        self.gravity_slider = tk.Scale(
            self.control_frame, 
            from_=1.0, 
            to=20.0, 
            orient=tk.HORIZONTAL, 
            variable=self.gravity_var,
            resolution=0.1,
            length=150,
            font=("SimHei", 9)
        )
        self.gravity_slider.grid(row=0, column=4, padx=5, pady=5)
        self.gravity_label = tk.Label(self.control_frame, text=f"{self.gravity:.1f}", bg="#f0f0f0", width=5)
        self.gravity_label.grid(row=0, column=5, padx=5, pady=5)
        self.gravity_var.trace_add("write", self.update_gravity_label)
        
        # 阻尼系数控制
        tk.Label(self.control_frame, text="阻尼系数:", bg="#f0f0f0", font=("SimHei", 10)).grid(row=1, column=0, padx=5, pady=5)
        self.damping_var = tk.DoubleVar(value=self.damping)
        self.damping_slider = tk.Scale(
            self.control_frame, 
            from_=0.9, 
            to=0.999,
            orient=tk.HORIZONTAL, 
            variable=self.damping_var,
            resolution=0.001,
            length=150,
            font=("SimHei", 9)
        )
        self.damping_slider.grid(row=1, column=1, padx=5, pady=5)
        self.damping_label = tk.Label(self.control_frame, text=f"{self.damping:.3f}", bg="#f0f0f0", width=6)
        self.damping_label.grid(row=1, column=2, padx=5, pady=5)
        self.damping_var.trace_add("write", self.update_damping_label)
        
        # 初始角度控制
        tk.Label(self.control_frame, text="初始角度:", bg="#f0f0f0", font=("SimHei", 10)).grid(row=1, column=3, padx=5, pady=5)
        self.angle_deg_var = tk.DoubleVar(value=math.degrees(self.angle))
        self.angle_slider = tk.Scale(
            self.control_frame, 
            from_=-80, 
            to=80,
            orient=tk.HORIZONTAL, 
            variable=self.angle_deg_var,
            resolution=1,
            length=150,
            font=("SimHei", 9)
        )
        self.angle_slider.grid(row=1, column=4, padx=5, pady=5)
        self.angle_label = tk.Label(self.control_frame, text=f"{math.degrees(self.angle):.1f}°", bg="#f0f0f0", width=6)
        self.angle_label.grid(row=1, column=5, padx=5, pady=5)
        self.angle_deg_var.trace_add("write", self.update_angle_label)
    
    def create_control_buttons(self):
        # 创建按钮框架居中显示
        button_frame = tk.Frame(self.control_frame, bg="#f0f0f0")
        button_frame.grid(row=0, column=6, rowspan=2, padx=20, pady=5)
        
        # 开始按钮
        self.start_button = tk.Button(
            button_frame, 
            text="开始", 
            command=self.start_simulation,
            font=("SimHei", 12, "bold"),
            width=10,
            bg="#4CAF50",
            fg="white",
            relief=tk.RAISED
        )
        self.start_button.pack(side=tk.LEFT, padx=5, pady=5)
        
        # 暂停按钮
        self.pause_button = tk.Button(
            button_frame, 
            text="暂停", 
            command=self.pause_simulation,
            font=("SimHei", 12, "bold"),
            width=10,
            bg="#FF9800",
            fg="white",
            relief=tk.RAISED
        )
        self.pause_button.pack(side=tk.LEFT, padx=5, pady=5)
        
        # 重置按钮
        self.reset_button = tk.Button(
            button_frame, 
            text="重置", 
            command=self.reset_simulation,
            font=("SimHei", 12, "bold"),
            width=10,
            bg="#F44336",
            fg="white",
            relief=tk.RAISED
        )
        self.reset_button.pack(side=tk.LEFT, padx=5, pady=5)
    
    def update_length_label(self, *args):
        self.length = self.length_var.get()
        self.length_label.config(text=f"{self.length:.1f}")
        self.update_pendulum()
    
    def update_gravity_label(self, *args):
        self.gravity = self.gravity_var.get()
        self.gravity_label.config(text=f"{self.gravity:.1f}")
    
    def update_damping_label(self, *args):
        self.damping = self.damping_var.get()
        self.damping_label.config(text=f"{self.damping:.3f}")
    
    def update_angle_label(self, *args):
        self.angle = math.radians(self.angle_deg_var.get())
        self.angle_label.config(text=f"{self.angle_deg_var.get():.1f}°")
        # 仅在未运行时更新位置
        if not self.running:
            self.angle_velocity = 0
            self.update_pendulum()
    
    def update_pendulum(self):
        # 清除画布
        self.canvas.delete("all")
        
        # 绘制支点
        self.canvas.create_oval(
            self.pivot_x - 5, self.pivot_y - 5, 
            self.pivot_x + 5, self.pivot_y + 5, 
            fill="#333333"
        )
        
        # 计算摆球位置
        ball_x = self.pivot_x + self.length * math.sin(self.angle)
        ball_y = self.pivot_y + self.length * math.cos(self.angle)
        
        # 绘制摆线
        self.canvas.create_line(
            self.pivot_x, self.pivot_y, 
            ball_x, ball_y, 
            width=2,
            fill="#2196F3"
        )
        
        # 绘制摆球（大小与质量相关）
        ball_radius = 10 + int(self.mass * 5)
        self.canvas.create_oval(
            ball_x - ball_radius, ball_y - ball_radius, 
            ball_x + ball_radius, ball_y + ball_radius, 
            fill="#E91E63"
        )
        
        # 绘制刻度和信息
        self.draw_info()
    
    def draw_info(self):
        # 显示当前状态信息
        period = 2 * math.pi * math.sqrt(self.length / (self.gravity * 100))  # 周期（秒）
        
        info_text = (
            f"周期: {period:.2f}秒  |  "
            f"角度: {math.degrees(self.angle):.1f}°  |  "
            f"角速度: {self.angle_velocity:.2f} rad/s"
        )
        
        self.canvas.create_text(
            self.pivot_x, 
            self.pivot_y - 20, 
            text=info_text,
            font=("SimHei", 10),
            fill="#555555"
        )
        
        # 绘制垂直参考线
        self.canvas.create_line(
            self.pivot_x, self.pivot_y, 
            self.pivot_x, self.pivot_y + self.length + 30, 
            width=1,
            dash=(5, 5),
            fill="#999999"
        )
    
    def start_simulation(self):
        if not self.running:
            self.running = True
            self.last_time = time.time()
            self.simulate()
    
    def pause_simulation(self):
        self.running = False
    
    def reset_simulation(self):
        self.running = False
        self.angle = math.radians(self.angle_deg_var.get())
        self.angle_velocity = 0
        self.angle_acceleration = 0
        self.update_pendulum()
    
    def simulate(self):
        if not self.running:
            return
        
        # 计算时间差
        current_time = time.time()
        dt = current_time - self.last_time
        self.last_time = current_time
        
        # 限制时间步长以保持稳定性
        dt = min(dt, 0.05)
        
        # 使用小角度近似计算角加速度: α = -(g/L) * sin(θ)
        self.angle_acceleration = -(self.gravity * 100 / self.length) * math.sin(self.angle)
        
        # 更新角速度
        self.angle_velocity += self.angle_acceleration * dt
        
        # 应用阻尼
        self.angle_velocity *= self.damping
        
        # 更新角度
        self.angle += self.angle_velocity * dt
        
        # 更新单摆显示
        self.update_pendulum()
        
        # 继续模拟
        self.root.after(16, self.simulate)  # 约60fps

if __name__ == "__main__":
    root = tk.Tk()
    # 设置中文字体支持
    root.option_add("*Font", ("SimHei", 10))
    simulation = PendulumSimulation(root)
    root.mainloop()