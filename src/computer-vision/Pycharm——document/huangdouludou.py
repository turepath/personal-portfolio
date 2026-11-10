import tkinter as tk
from tkinter import ttk
import random
import time
import threading
import math

# 全局配置
WINDOW_WIDTH = 1000
WINDOW_HEIGHT = 600
BEAN_SIZE_RANGE = {"red": (8, 12), "yellow": (10, 14)}  # 豆子尺寸范围（像素）
FALL_SPEED_BASE = 5  # 基础下落速度
ANIMATION_INTERVAL = 20  # 动画刷新间隔（ms）

class BeanSorter:
    def __init__(self, root):
        self.root = root
        self.root.title("红豆黄豆筛选机")
        self.root.geometry(f"{WINDOW_WIDTH}x{WINDOW_HEIGHT}")
        self.root.resizable(False, False)

        # 筛选机状态
        self.is_running = False
        self.feed_speed = tk.DoubleVar(value=5.0)  # 进料速度（1-10）
        self.sort_threshold = tk.DoubleVar(value=0.5)  # 筛选阈值（0.1-1.0）
        self.red_beans_count = 0
        self.yellow_beans_count = 0
        self.total_beans = 0

        # 豆子列表（存储当前下落的豆子）
        self.beans = []
        self.bean_id_counter = 0

        # 创建UI
        self.create_ui()

        # 动画循环
        self.animation_loop()

    def create_ui(self):
        # 1. 控制面板
        control_frame = ttk.Frame(self.root, padding="10")
        control_frame.pack(fill=tk.X)

        # 进料速度调节
        ttk.Label(control_frame, text="进料速度:").grid(row=0, column=0, padx=5)
        speed_scale = ttk.Scale(
            control_frame, from_=1, to=10, variable=self.feed_speed,
            orient=tk.HORIZONTAL, length=200, command=self.on_speed_change
        )
        speed_scale.grid(row=0, column=1, padx=5)
        self.speed_label = ttk.Label(control_frame, text=f"{self.feed_speed.get():.1f}")
        self.speed_label.grid(row=0, column=2, padx=5)

        # 筛选阈值调节
        ttk.Label(control_frame, text="筛选阈值:").grid(row=0, column=3, padx=5)
        threshold_scale = ttk.Scale(
            control_frame, from_=0.1, to=1.0, variable=self.sort_threshold,
            orient=tk.HORIZONTAL, length=200, command=self.on_threshold_change
        )
        threshold_scale.grid(row=0, column=4, padx=5)
        self.threshold_label = ttk.Label(control_frame, text=f"{self.sort_threshold.get():.1f}")
        self.threshold_label.grid(row=0, column=5, padx=5)

        # 启动/停止按钮
        self.start_btn = ttk.Button(control_frame, text="启动筛选", command=self.start_sorter)
        self.start_btn.grid(row=0, column=6, padx=10)
        self.stop_btn = ttk.Button(control_frame, text="停止筛选", command=self.stop_sorter, state=tk.DISABLED)
        self.stop_btn.grid(row=0, column=7, padx=10)

        # 2. 动画画布
        self.canvas = tk.Canvas(
            self.root, width=WINDOW_WIDTH, height=WINDOW_HEIGHT-150,
            bg="#f0f0f0", highlightthickness=0
        )
        self.canvas.pack(fill=tk.BOTH, expand=True, pady=10)

        # 绘制筛选机结构
        self.draw_sorter_structure()

        # 3. 统计面板
        stats_frame = ttk.Frame(self.root, padding="10")
        stats_frame.pack(fill=tk.X)

        ttk.Label(stats_frame, text="红豆数量:").grid(row=0, column=0, padx=20)
        self.red_count_label = ttk.Label(stats_frame, text="0", font=("Arial", 14, "bold"), foreground="#dc3545")
        self.red_count_label.grid(row=0, column=1, padx=5)

        ttk.Label(stats_frame, text="黄豆数量:").grid(row=0, column=2, padx=20)
        self.yellow_count_label = ttk.Label(stats_frame, text="0", font=("Arial", 14, "bold"), foreground="#ffc107")
        self.yellow_count_label.grid(row=0, column=3, padx=5)

        ttk.Label(stats_frame, text="总物料数:").grid(row=0, column=4, padx=20)
        self.total_count_label = ttk.Label(stats_frame, text="0", font=("Arial", 14, "bold"), foreground="#007bff")
        self.total_count_label.grid(row=0, column=5, padx=5)

    def draw_sorter_structure(self):
        """绘制筛选机静态结构"""
        # 进料口
        inlet_x = WINDOW_WIDTH // 2
        self.canvas.create_rectangle(
            inlet_x-50, 20, inlet_x+50, 70,
            fill="#6c757d", outline="", tags="inlet"
        )

        # 筛选网格
        grid_x1 = WINDOW_WIDTH//2 - 300
        grid_x2 = WINDOW_WIDTH//2 + 300
        grid_y1 = 120
        grid_y2 = 320
        self.canvas.create_rectangle(
            grid_x1, grid_y1, grid_x2, grid_y2,
            fill="", outline="#adb5bd", width=2, tags="grid"
        )
        # 绘制网格线
        for x in range(grid_x1, grid_x2+1, 20):
            self.canvas.create_line(x, grid_y1, x, grid_y2, fill="#ced4da", width=1, tags="grid")
        for y in range(grid_y1, grid_y2+1, 20):
            self.canvas.create_line(grid_x1, y, grid_x2, y, fill="#ced4da", width=1, tags="grid")

        # 收集区
        zone_width = 200
        zone_height = 100
        zone_y = WINDOW_HEIGHT - 200

        # 红豆收集区（移除alpha参数）
        self.red_zone = self.canvas.create_rectangle(
            WINDOW_WIDTH//2 - 300, zone_y,
            WINDOW_WIDTH//2 - 300 + zone_width, zone_y + zone_height,
            fill="#dc3545", outline="", tags="zones"
        )
        self.canvas.create_text(
            WINDOW_WIDTH//2 - 200, zone_y + 50,
            text="红豆收集区", fill="white", tags="zones"
        )

        # 黄豆收集区（移除alpha参数）
        self.yellow_zone = self.canvas.create_rectangle(
            WINDOW_WIDTH//2 - 100, zone_y,
            WINDOW_WIDTH//2 - 100 + zone_width, zone_y + zone_height,
            fill="#ffc107", outline="", tags="zones"
        )
        self.canvas.create_text(
            WINDOW_WIDTH//2, zone_y + 50,
            text="黄豆收集区", fill="black", tags="zones"
        )

        # 未通过区（移除alpha参数）
        self.reject_zone = self.canvas.create_rectangle(
            WINDOW_WIDTH//2 + 100, zone_y,
            WINDOW_WIDTH//2 + 100 + zone_width, zone_y + zone_height,
            fill="#6c757d", outline="", tags="zones"
        )
        self.canvas.create_text(
            WINDOW_WIDTH//2 + 200, zone_y + 50,
            text="未通过区", fill="white", tags="zones"
        )

    def generate_bean(self):
        """生成单个豆子（随机类型和尺寸）"""
        bean_type = "red" if random.random() > 0.3 else "yellow"
        # 红豆尺寸略小，黄豆略大
        size = random.uniform(*BEAN_SIZE_RANGE[bean_type])
        pixel_size = int(size * 1)  # 转换为像素尺寸

        # 初始位置（进料口）
        x = WINDOW_WIDTH//2 + random.randint(-40, 40)
        y = 20

        # 筛选结果
        critical_size = self.sort_threshold.get() * 12  # 临界尺寸（像素）
        if bean_type == "red" and pixel_size < critical_size:
            sort_result = "red"
        elif bean_type == "yellow" and pixel_size >= critical_size:
            sort_result = "yellow"
        else:
            sort_result = "reject"

        # 创建豆子图形
        color = "#c71585" if bean_type == "red" else "#ffd700"
        bean_id = f"bean_{self.bean_id_counter}"
        self.bean_id_counter += 1

        bean = self.canvas.create_oval(
            x - pixel_size//2, y - pixel_size//2,
            x + pixel_size//2, y + pixel_size//2,
            fill=color, outline="", tags=(bean_id, "beans")
        )

        # 豆子数据
        return {
            "id": bean_id,
            "graphic": bean,
            "type": bean_type,
            "size": pixel_size,
            "x": x,
            "y": y,
            "speed": FALL_SPEED_BASE * (self.feed_speed.get() / 5),  # 下落速度与进料速度关联
            "sort_result": sort_result,
            "target_x": self.get_target_x(sort_result)
        }

    def get_target_x(self, sort_result):
        """获取收集区目标X坐标"""
        if sort_result == "red":
            return WINDOW_WIDTH//2 - 200
        elif sort_result == "yellow":
            return WINDOW_WIDTH//2
        else:
            return WINDOW_WIDTH//2 + 200

    def update_beans(self):
        """更新豆子位置（下落动画）"""
        if not self.is_running:
            return

        # 生成新豆子（数量与进料速度相关）
        bean_count = int(self.feed_speed.get() * 0.5)
        for _ in range(bean_count):
            bean = self.generate_bean()
            self.beans.append(bean)
            self.total_beans += 1
            self.update_stats()

        # 更新现有豆子位置
        to_remove = []
        for bean in self.beans:
            # 下落运动
            bean["y"] += bean["speed"]
            # 水平向目标收集区移动（经过筛选网格后开始）
            if bean["y"] > 200:
                dx = bean["target_x"] - bean["x"]
                bean["x"] += dx * 0.05  # 缓动效果

            # 更新图形位置
            self.canvas.coords(
                bean["graphic"],
                bean["x"] - bean["size"]//2,
                bean["y"] - bean["size"]//2,
                bean["x"] + bean["size"]//2,
                bean["y"] + bean["size"]//2
            )

            # 到达收集区后移除
            if bean["y"] > WINDOW_HEIGHT - 220:
                to_remove.append(bean)
                # 更新计数
                if bean["sort_result"] == "red":
                    self.red_beans_count += 1
                elif bean["sort_result"] == "yellow":
                    self.yellow_beans_count += 1
                self.update_stats()

        # 移除到达收集区的豆子
        for bean in to_remove:
            self.canvas.delete(bean["graphic"])
            self.beans.remove(bean)

    def animation_loop(self):
        """动画主循环"""
        self.update_beans()
        self.root.after(ANIMATION_INTERVAL, self.animation_loop)

    def start_sorter(self):
        """启动筛选机"""
        self.is_running = True
        self.start_btn.config(state=tk.DISABLED)
        self.stop_btn.config(state=tk.NORMAL)
        # 重置计数
        self.red_beans_count = 0
        self.yellow_beans_count = 0
        self.total_beans = 0
        self.update_stats()

    def stop_sorter(self):
        """停止筛选机"""
        self.is_running = False
        self.start_btn.config(state=tk.NORMAL)
        self.stop_btn.config(state=tk.DISABLED)

    def on_speed_change(self, value):
        """进料速度变化回调"""
        self.speed_label.config(text=f"{float(value):.1f}")

    def on_threshold_change(self, value):
        """筛选阈值变化回调"""
        self.threshold_label.config(text=f"{float(value):.1f}")

    def update_stats(self):
        """更新统计数据"""
        self.red_count_label.config(text=str(self.red_beans_count))
        self.yellow_count_label.config(text=str(self.yellow_beans_count))
        self.total_count_label.config(text=str(self.total_beans))

if __name__ == "__main__":
    root = tk.Tk()
    app = BeanSorter(root)
    root.mainloop()