import tkinter as tk

class ToyotaLogoApp:
    def __init__(self, root):
        self.root = root
        self.root.title("丰田车标绘制")
        self.root.geometry("500x500")
        
        # 创建白色底色画布
        self.canvas = tk.Canvas(root, width=400, height=400, bg="white")
        self.canvas.pack(pady=20)
        
        # 绘制丰田车标 - 使用三个红色椭圆
        self.draw_toyota_logo()
    
    def draw_toyota_logo(self):
        # 中心坐标
        center_x = 200
        center_y = 200
        
        # 按照用户步骤绘制丰田车标
        
        # 步骤1: 绘制第一个椭圆环（外围大椭圆）
        # 1.1 先画红色实心椭圆作为外环
        self.canvas.create_oval(
            center_x - 120, center_y - 80,  # 左上点
            center_x + 120, center_y + 80,  # 右下点
             outline="red", width=6
        )
        # 1.2 用略小一点的白色椭圆填充，形成椭圆环效果
        # self.canvas.create_oval(
        #     center_x - 100, center_y - 70,   # 左上点
        #     center_x + 100, center_y + 70,   # 右下点
        #     fill="white", outline="white", width=0
        # )
        
        # 步骤2: 绘制第二个椭圆环（竖直椭圆）
        # 2.1 先画红色实心椭圆
        self.canvas.create_oval(
            center_x - 35, center_y - 77,  # 左上点
            center_x + 35, center_y + 77,  # 右下点
             outline="red", width=6
        )
        # 2.2 用略小一点的白色椭圆填充，形成椭圆环效果
        # self.canvas.create_oval(
        #     center_x - 30, center_y - 65,   # 左上点
        #     center_x + 30, center_y + 65,   # 右下点
        #     fill="white", outline="white", width=0
        # )


        # # 步骤3: 绘制第三个椭圆环（衔接于第一个椭圆的椭圆）
        # # 3.1 先画红色实心椭圆
        self.canvas.create_oval(
            120, center_y - 80,  # 左上点
            280, center_y-10 ,  # 右下点
             outline="red", width=6
        )
        # # 3.2 用略小一点的白色椭圆填充，形成椭圆环效果
        # self.canvas.create_oval(
        #     140, center_y - 70,   # 左上点
        #     260, center_y -10,   # 右下点
        #     fill="white", outline="white", width=0
        # )
        
if __name__ == "__main__":
    root = tk.Tk()
    app = ToyotaLogoApp(root)
    root.mainloop()