import numpy as np
import matplotlib.pyplot as plt
from matplotlib.image import imread
import os
from scipy import ndimage
from matplotlib.widgets import Slider

# 导入生成随机红色色块的函数
try:
    from random_red_blocks import generate_random_red_blocks
except ImportError:
    # 如果无法导入，直接在文件中定义该函数
    import random
    def generate_random_red_blocks(width=300, height=300, num_blocks=100):
        """
        生成包含随机红色色块的图像
        
        参数:
        width: 图像宽度
        height: 图像高度
        num_blocks: 红色色块数量
        
        返回:
        image: 生成的numpy图像数组
        """
        # 创建白色背景图像
        image = np.full((height, width, 3), 255, dtype=np.uint8)
        
        # 生成随机红色色块
        for _ in range(num_blocks):
            # 随机色块大小 (10-30像素)
            block_width = random.randint(10, 30)
            block_height = random.randint(10, 30)
            
            # 随机位置 (确保色块完全在图像内)
            x = random.randint(0, width - block_width)
            y = random.randint(0, height - block_height)
            
            # 随机红色调 (R: 150-255, G: 0-50, B: 0-50)
            r = random.randint(150, 255)
            g = random.randint(0, 50)
            b = random.randint(0, 50)
            
            # 在图像上绘制色块
            image[y:y+block_height, x:x+block_width] = [r, g, b]
        
        return image

# 读取图像文件
def load_image(image_path):
    """加载图像并转换为numpy数组，确保返回0~255范围"""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"图像文件不存在: {image_path}")
    
    image = imread(image_path)
    # 如果是RGBA格式，转换为RGB
    if image.shape[-1] == 4:
        image = image[..., :3]
    
    # 确保图像数据在0~255范围
    if image.max() <= 1:
        image = (image * 255).astype(np.uint8)
    
    return image

def segment_colors(image):
    """使用numpy区分图像中的红色和黄色区块，并进行去噪处理"""
    # 获取图像尺寸
    height, width, channels = image.shape
    
    # 将图像归一化到[0, 1]范围用于处理
    norm_image = image / 255.0
    
    # 定义RGB颜色阈值（归一化后的值）
    # 红色区域：R > G 且 R > B 且 R > 0.5 且 G < 0.5
    red_mask = (norm_image[:, :, 0] > norm_image[:, :, 1]) & \
               (norm_image[:, :, 0] > norm_image[:, :, 2]) & \
               (norm_image[:, :, 0] > 0.5) & \
               (norm_image[:, :, 1] < 0.5)
    
    # 黄色区域：R > 0.5, G > 0.5, B < 0.5 且 R ≈ G 且 不在红色区域内
    yellow_mask = (norm_image[:, :, 0] > 0.5) & \
                  (norm_image[:, :, 1] > 0.5) & \
                  (norm_image[:, :, 2] < 0.5) & \
                  (np.abs(norm_image[:, :, 0] - norm_image[:, :, 1]) < 0.3) & \
                  (~red_mask)
    
    # 去噪处理：使用形态学操作去除小噪点
    # 定义结构元素
    structure = np.ones((3, 3))
    
    # 对红色区域进行去噪
    red_mask = ndimage.binary_opening(red_mask, structure=structure)
    red_mask = ndimage.binary_closing(red_mask, structure=structure)
    
    # 对黄色区域进行去噪
    yellow_mask = ndimage.binary_opening(yellow_mask, structure=structure)
    yellow_mask = ndimage.binary_closing(yellow_mask, structure=structure)
    
    # 创建结果图像（255范围）
    result = np.zeros((height, width, 3), dtype=np.uint8)
    
    # 标记红色区域为红色
    result[red_mask] = [255, 0, 0]
    
    # 标记黄色区域为黄色
    result[yellow_mask] = [255, 255, 0]
    
    # 计算统计信息
    red_area = np.sum(red_mask)
    yellow_area = np.sum(yellow_mask)
    total_pixels = height * width
    
    return result, red_mask, yellow_mask, red_area, yellow_area, total_pixels

def separate_channels(image):
    """分离RGB通道，保持0~255范围"""
    # 分离RGB通道
    r_channel = image[:, :, 0]
    g_channel = image[:, :, 1]
    b_channel = image[:, :, 2]
    
    return r_channel, g_channel, b_channel

def create_channel_images(r_channel, g_channel, b_channel):
    """创建单通道彩色图像（255范围）"""
    height, width = r_channel.shape
    
    # 创建红色通道图像
    r_image = np.zeros((height, width, 3), dtype=np.uint8)
    r_image[:, :, 0] = r_channel
    
    # 创建绿色通道图像
    g_image = np.zeros((height, width, 3), dtype=np.uint8)
    g_image[:, :, 1] = g_channel
    
    # 创建蓝色通道图像
    b_image = np.zeros((height, width, 3), dtype=np.uint8)
    b_image[:, :, 2] = b_channel
    
    return r_image, g_image, b_image

def display_combined_results(original_image, segmented_image, r_channel, g_channel, b_channel):
    """在一个页面中显示所有结果，包括颜色分割、RGB通道和红色阈值调节"""
    plt.rcParams['font.sans-serif'] = ['SimHei']  # 使用黑体
    plt.rcParams['axes.unicode_minus'] = False  # 解决负号显示问题
    
    # 创建主图形
    fig = plt.figure(figsize=(18, 12))
    
    # 原始图像
    ax1 = fig.add_axes([0.05, 0.65, 0.3, 0.3])
    ax1.imshow(original_image)
    ax1.set_title('原始图像')
    ax1.axis('off')
    
    # 颜色分割结果
    ax2 = fig.add_axes([0.38, 0.65, 0.3, 0.3])
    ax2.imshow(segmented_image)
    ax2.set_title('颜色分割结果')
    ax2.axis('off')
    
    # 红色通道
    ax3 = fig.add_axes([0.71, 0.65, 0.25, 0.3])
    r_img = ax3.imshow(r_channel, cmap='Reds')
    ax3.set_title('红色通道 (R)')
    ax3.axis('off')
    fig.colorbar(r_img, ax=ax3, shrink=0.8, ticks=[0, 64, 128, 192, 255])
    
    # 绿色通道
    ax4 = fig.add_axes([0.05, 0.32, 0.25, 0.3])
    g_img = ax4.imshow(g_channel, cmap='Greens')
    ax4.set_title('绿色通道 (G)')
    ax4.axis('off')
    fig.colorbar(g_img, ax=ax4, shrink=0.8, ticks=[0, 64, 128, 192, 255])
    
    # 蓝色通道
    ax5 = fig.add_axes([0.35, 0.32, 0.25, 0.3])
    b_img = ax5.imshow(b_channel, cmap='Blues')
    ax5.set_title('蓝色通道 (B)')
    ax5.axis('off')
    fig.colorbar(b_img, ax=ax5, shrink=0.8, ticks=[0, 64, 128, 192, 255])
    
    # 红色阈值调节
    ax6 = fig.add_axes([0.65, 0.32, 0.3, 0.3])
    ax7 = fig.add_axes([0.1, 0.05, 0.8, 0.05])
    
    # 创建滑块，范围从0到255，初始值设为平均值
    red_threshold = Slider(
        ax=ax7, 
        label='红色通道阈值 (0-255)', 
        valmin=0, 
        valmax=255, 
        valinit=r_channel.mean(),
        valstep=1
    )
    
    # 获取图像尺寸
    height, width = r_channel.shape
    
    # 创建阈值筛选结果图像
    thresholded_image = np.zeros((height, width, 3), dtype=np.uint8)
    threshold_img = ax6.imshow(thresholded_image)
    ax6.set_title('红色阈值筛选结果')
    ax6.axis('off')
    
    # 创建信息显示区域
    ax_info = fig.add_axes([0.05, 0.01, 0.8, 0.03])
    ax_info.axis('off')
    
    # 更新函数
    def update(val):
        threshold = red_threshold.val
        
        # 创建阈值掩码（红色通道值大于等于阈值的区域）
        mask = r_channel >= threshold
        
        # 创建阈值筛选后的图像
        thresholded = np.zeros((height, width, 3), dtype=np.uint8)
        thresholded[mask] = original_image[mask]
        
        # 更新图像
        threshold_img.set_data(thresholded)
        
        # 计算统计信息
        total_pixels = height * width
        red_pixels = np.sum(mask)
        red_ratio = (red_pixels / total_pixels) * 100
        
        # 更新信息文本
        ax_info.clear()
        ax_info.axis('off')
        info_text = f"红色通道阈值: {int(threshold)} | 红色像素: {red_pixels:,} | 占比: {red_ratio:.2f}% | 阈值以上平均值: {r_channel[mask].mean():.1f}"
        ax_info.text(0.05, 0.5, info_text, fontsize=12, verticalalignment='center')
        
        fig.canvas.draw_idle()
    
    # 连接滑块事件
    red_threshold.on_changed(update)
    
    # 初始更新
    update(r_channel.mean())
    
    plt.tight_layout()
    plt.show()

def main():
    try:
        # 设置matplotlib支持中文显示
        plt.rcParams['font.sans-serif'] = ['SimHei']  # 使用黑体
        plt.rcParams['axes.unicode_minus'] = False  # 解决负号显示问题
        
        # 生成300x300随机红色色块图像（100个色块，每个大小10-30像素）
        print("正在生成300x300随机红色色块图像...")
        original_image = generate_random_red_blocks(width=300, height=300, num_blocks=100)
        
        # 获取图像尺寸
        height, width, channels = original_image.shape
        print(f"图像尺寸: {height} × {width} 像素")
        
        # 颜色分割
        print("正在进行颜色分割和去噪...")
        segmented_image, red_mask, yellow_mask, red_area, yellow_area, total_pixels = segment_colors(original_image)
        
        # 分离RGB通道（0~255范围）
        print("正在分离RGB通道...")
        r_channel, g_channel, b_channel = separate_channels(original_image)
        
        # 显示所有结果
        print("正在显示综合结果...")
        display_combined_results(original_image, segmented_image, r_channel, g_channel, b_channel)
        
        # 输出统计信息
        print("\n=== 图像统计信息 ===")
        print("颜色分割结果：")
        print(f"  红色区域像素数: {red_area:,} | 占比: {red_area / total_pixels * 100:.2f}%")
        print(f"  黄色区域像素数: {yellow_area:,} | 占比: {yellow_area / total_pixels * 100:.2f}%")
        print(f"  重叠区域像素数: {np.sum(np.logical_and(red_mask, yellow_mask))}")
        
        print("\nRGB通道统计（0~255范围）：")
        print(f"  红色通道 - 最小值: {r_channel.min()}, 最大值: {r_channel.max()}, 平均值: {r_channel.mean():.1f}")
        print(f"  绿色通道 - 最小值: {g_channel.min()}, 最大值: {g_channel.max()}, 平均值: {g_channel.mean():.1f}")
        print(f"  蓝色通道 - 最小值: {b_channel.min()}, 最大值: {b_channel.max()}, 平均值: {b_channel.mean():.1f}")
        
    except Exception as e:
        print(f"处理过程中发生错误: {e}")

if __name__ == "__main__":
    main()