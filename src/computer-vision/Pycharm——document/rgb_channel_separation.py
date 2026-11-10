import numpy as np
import matplotlib.pyplot as plt
from matplotlib.image import imread
from matplotlib.widgets import Slider
import os

def load_and_resize_image(image_path, target_height=324, target_width=300):
    """
    加载图像并调整尺寸
    
    参数:
    image_path: 图像文件路径
    target_height: 目标高度
    target_width: 目标宽度
    
    返回:
    resized_image: 调整后的图像numpy数组
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"图像文件不存在: {image_path}")
    
    # 加载图像
    image = imread(image_path)
    
    # 如果是RGBA格式，转换为RGB
    if image.shape[-1] == 4:
        image = image[..., :3]
    
    # 归一化到[0, 1]范围
    if image.max() > 1:
        image = image / 255.0
    
    # 调整图像尺寸（使用简单的重采样方法）
    # 获取原始尺寸
    orig_height, orig_width, orig_channels = image.shape
    
    # 创建目标图像
    resized_image = np.zeros((target_height, target_width, orig_channels))
    
    # 计算缩放因子
    height_scale = orig_height / target_height
    width_scale = orig_width / target_width
    
    # 重采样（简单的最近邻插值）
    for i in range(target_height):
        for j in range(target_width):
            # 计算原始图像中的对应位置
            orig_i = int(i * height_scale)
            orig_j = int(j * width_scale)
            
            # 确保不超出边界
            orig_i = min(orig_i, orig_height - 1)
            orig_j = min(orig_j, orig_width - 1)
            
            # 复制像素值
            resized_image[i, j] = image[orig_i, orig_j]
    
    return resized_image

def separate_channels(image):
    """
    分离RGB通道
    
    参数:
    image: 原始图像numpy数组
    
    返回:
    r_channel: 红色通道
    g_channel: 绿色通道
    b_channel: 蓝色通道
    """
    # 分离通道
    r_channel = image[:, :, 0]
    g_channel = image[:, :, 1]
    b_channel = image[:, :, 2]
    
    return r_channel, g_channel, b_channel

def display_channels(original_image, r_channel, g_channel, b_channel):
    """
    使用matplotlib显示原始图像和分离的RGB通道
    """
    plt.rcParams['font.sans-serif'] = ['SimHei']  # 使用黑体
    plt.rcParams['axes.unicode_minus'] = False  # 解决负号显示问题
    
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    
    # 显示原始图像
    axes[0, 0].imshow(original_image)
    axes[0, 0].set_title('原始图像')
    axes[0, 0].axis('off')
    
    # 显示红色通道
    axes[0, 1].imshow(r_channel, cmap='Reds')
    axes[0, 1].set_title('红色通道 (R)')
    axes[0, 1].axis('off')
    
    # 显示绿色通道
    axes[1, 0].imshow(g_channel, cmap='Greens')
    axes[1, 0].set_title('绿色通道 (G)')
    axes[1, 0].axis('off')
    
    # 显示蓝色通道
    axes[1, 1].imshow(b_channel, cmap='Blues')
    axes[1, 1].set_title('蓝色通道 (B)')
    axes[1, 1].axis('off')
    
    plt.tight_layout()
    plt.show()

def create_channel_images(r_channel, g_channel, b_channel):
    """
    创建单通道彩色图像
    
    参数:
    r_channel: 红色通道
    g_channel: 绿色通道
    b_channel: 蓝色通道
    
    返回:
    r_image: 红色通道彩色图像
    g_image: 绿色通道彩色图像
    b_image: 蓝色通道彩色图像
    """
    height, width = r_channel.shape
    
    # 创建红色通道图像
    r_image = np.zeros((height, width, 3))
    r_image[:, :, 0] = r_channel
    
    # 创建绿色通道图像
    g_image = np.zeros((height, width, 3))
    g_image[:, :, 1] = g_channel
    
    # 创建蓝色通道图像
    b_image = np.zeros((height, width, 3))
    b_image[:, :, 2] = b_channel
    
    return r_image, g_image, b_image

def display_channel_images(original_image, r_image, g_image, b_image):
    """
    使用matplotlib显示原始图像和单通道彩色图像
    """
    plt.rcParams['font.sans-serif'] = ['SimHei']  # 使用黑体
    plt.rcParams['axes.unicode_minus'] = False  # 解决负号显示问题
    
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    
    # 显示原始图像
    axes[0, 0].imshow(original_image)
    axes[0, 0].set_title('原始图像')
    axes[0, 0].axis('off')
    
    # 显示红色通道图像
    axes[0, 1].imshow(r_image)
    axes[0, 1].set_title('红色通道彩色图像')
    axes[0, 1].axis('off')
    
    # 显示绿色通道图像
    axes[1, 0].imshow(g_image)
    axes[1, 0].set_title('绿色通道彩色图像')
    axes[1, 0].axis('off')
    
    # 显示蓝色通道图像
    axes[1, 1].imshow(b_image)
    axes[1, 1].set_title('蓝色通道彩色图像')
    axes[1, 1].axis('off')
    
    plt.tight_layout()
    plt.show()

def display_red_threshold_interactive(original_image, r_channel, g_channel, b_channel):
    """
    创建交互式界面，用于调节红色通道的阈值并显示筛选结果
    
    参数:
    original_image: 原始图像
    r_channel: 红色通道
    g_channel: 绿色通道
    b_channel: 蓝色通道
    """
    plt.rcParams['font.sans-serif'] = ['SimHei']  # 使用黑体
    plt.rcParams['axes.unicode_minus'] = False  # 解决负号显示问题
    
    # 创建图形
    fig = plt.figure(figsize=(12, 10))
    
    # 创建主图像区域
    ax1 = fig.add_axes([0.1, 0.2, 0.7, 0.7])
    ax2 = fig.add_axes([0.85, 0.2, 0.1, 0.7])
    
    # 创建滑块区域
    ax_slider = fig.add_axes([0.1, 0.1, 0.7, 0.05])
    
    # 创建滑块，范围从0到1，初始值设为平均值
    red_threshold = Slider(
        ax=ax_slider, 
        label='红色通道阈值', 
        valmin=0.0, 
        valmax=1.0, 
        valinit=r_channel.mean(),
        valstep=0.01
    )
    
    # 获取图像尺寸
    height, width = r_channel.shape
    
    # 创建原始红色通道图像用于对比
    original_red_image = np.zeros((height, width, 3))
    original_red_image[:, :, 0] = r_channel
    
    # 初始化阈值筛选结果
    thresholded_mask = np.zeros((height, width, 3))
    thresholded_image = np.zeros((height, width, 3))
    
    # 绘制初始图像
    original_img = ax1.imshow(original_image)
    thresholded_img = ax2.imshow(thresholded_mask)
    
    # 添加标题
    ax1.set_title('原始图像')
    ax2.set_title('红色通道阈值筛选结果')
    
    # 隐藏坐标轴
    ax1.axis('off')
    ax2.axis('off')
    
    # 创建文本区域显示阈值和统计信息
    ax_info = fig.add_axes([0.1, 0.85, 0.8, 0.1])
    ax_info.axis('off')
    
    # 更新函数
    def update(val):
        threshold = red_threshold.val
        
        # 创建阈值掩码（红色通道值大于等于阈值的区域）
        mask = r_channel >= threshold
        
        # 创建阈值筛选后的红色通道图像
        thresholded_red = np.zeros((height, width, 3))
        thresholded_red[:, :, 0] = r_channel * mask
        
        # 创建原始图像中红色通道超过阈值的区域
        thresholded_original = original_image.copy()
        # 将红色通道不满足阈值的区域设为黑色
        thresholded_original[~mask] = [0, 0, 0]
        
        # 更新图像
        thresholded_img.set_data(thresholded_original)
        
        # 计算统计信息
        total_pixels = height * width
        red_pixels = np.sum(mask)
        red_ratio = (red_pixels / total_pixels) * 100
        
        # 更新信息文本
        ax_info.clear()
        ax_info.axis('off')
        info_text = f"红色通道阈值: {threshold:.2f}\n"
        info_text += f"红色像素数量: {red_pixels}\n"
        info_text += f"红色像素比例: {red_ratio:.2f}%\n"
        info_text += f"阈值以上红色通道平均值: {r_channel[mask].mean():.3f} (如果有红色像素)"
        ax_info.text(0.05, 0.5, info_text, fontsize=12, verticalalignment='center')
        
        fig.canvas.draw_idle()
    
    # 连接滑块事件
    red_threshold.on_changed(update)
    
    # 初始更新
    update(r_channel.mean())
    
    plt.show()

def main():
    # 图像文件路径
    image_files = ["bird.jpg", "bird_1.png"]
    image_path = None
    
    # 找到第一个存在的图像文件
    for file in image_files:
        full_path = os.path.join("d:\\Programming file\\P-document\\Pycharm——document", file)
        if os.path.exists(full_path):
            image_path = full_path
            break
    
    if image_path is None:
        print("没有找到可用的图像文件！")
        return
    
    try:
        # 加载并调整图像尺寸
        print(f"正在加载并调整图像尺寸: {os.path.basename(image_path)}...")
        resized_image = load_and_resize_image(image_path, target_height=324, target_width=300)
        
        # 获取图像尺寸
        height, width, channels = resized_image.shape
        print(f"调整后图像尺寸: {height} × {width} 像素")
        
        # 分离RGB通道
        print("正在分离RGB通道...")
        r_channel, g_channel, b_channel = separate_channels(resized_image)
        
        # 显示灰度通道
        print("正在显示RGB灰度通道...")
        display_channels(resized_image, r_channel, g_channel, b_channel)
        
        # 创建并显示单通道彩色图像
        print("正在创建单通道彩色图像...")
        r_image, g_image, b_image = create_channel_images(r_channel, g_channel, b_channel)
        
        print("正在显示单通道彩色图像...")
        display_channel_images(resized_image, r_image, g_image, b_image)
        
        # 显示红色通道阈值调节界面
        print("正在创建红色通道阈值调节界面...")
        display_red_threshold_interactive(resized_image, r_channel, g_channel, b_channel)
        
        # 输出通道统计信息
        print("\n=== 通道统计信息 ===")
        print(f"红色通道 - 最小值: {r_channel.min():.3f}, 最大值: {r_channel.max():.3f}, 平均值: {r_channel.mean():.3f}")
        print(f"绿色通道 - 最小值: {g_channel.min():.3f}, 最大值: {g_channel.max():.3f}, 平均值: {g_channel.mean():.3f}")
        print(f"蓝色通道 - 最小值: {b_channel.min():.3f}, 最大值: {b_channel.max():.3f}, 平均值: {b_channel.mean():.3f}")
        
    except Exception as e:
        print(f"处理过程中发生错误: {e}")

if __name__ == "__main__":
    main()