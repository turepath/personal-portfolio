import tkinter as tk

# 定义计数器
counter = 0

def add_one():
    global counter
    counter += 1
    label.config(text=f"当前计数: {counter}")

def add_two():
    global counter
    counter += 2
    label.config(text=f"当前计数: {counter}")

def other_action():
    label.config(text="你点击了其它按钮")

# 创建主窗口
root = tk.Tk()
root.title("简单 UI 界面")
root.geometry("400x300")

# 创建一个框架用于布局
frame = tk.Frame(root)
frame.pack(expand=True)

# 创建按钮
button1 = tk.Button(frame, text="+1", command=add_one)
button1.pack(side=tk.LEFT, padx=10)

button2 = tk.Button(frame, text="+2", command=add_two)
button2.pack(side=tk.LEFT, padx=10)

button3 = tk.Button(frame, text="其它", command=other_action)
button3.pack(side=tk.LEFT, padx=10)

# 创建标签用于显示信息
label = tk.Label(root, text=f"当前计数: {counter}")
label.pack(pady=20)

# 运行主循环
root.mainloop()