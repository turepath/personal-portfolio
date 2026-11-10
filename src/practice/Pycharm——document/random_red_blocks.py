import numpy as np
import matplotlib.pyplot as plt
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
    # 创建黑色背景图像
    image = np.zeros((height, width, 3), dtype=np.uint8)
    
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

def display_image(image):
    """
    使用matplotlib显示图像
    """
    plt.figure(figsize=(6, 6))
    plt.imshow(image)
    plt.title('300x300随机红色色块图像')
    plt.axis('off')  # 隐藏坐标轴
    plt.tight_layout()
    plt.show()

def main():
    # 生成图像
    print("正在生成300x300随机红色色块图像...")
    image = generate_random_red_blocks(width=300, height=300, num_blocks=100)
    
    # 显示图像
    print("正在显示图像...")
    display_image(image)
    
    # 保存图像（可选）
    # plt.imsave('random_red_blocks.png', image)
    # print("图像已保存为random_red_blocks.png")

if __name__ == "__main__":
    main()