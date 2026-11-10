import pygame
import random
import math

# 初始化Pygame
pygame.init()

# 设置窗口大小和标题
width, height = 800, 600
screen = pygame.display.set_mode((width, height))
pygame.display.set_caption("生日快乐")

# 加载字体
font = pygame.font.Font(None, 48)

# 创建文本对象
text = font.render("生日快乐", True, (255, 255, 255))
text_rect = text.get_rect(center=(width // 2, height // 4))

# 创建蛋糕
cake = pygame.Surface((200, 100))
cake.fill((255, 215, 0))  # 黄色
cake_rect = cake.get_rect(center=(width // 2, height // 2 + 50))

# 创建烟花
class Firework:
    def __init__(self):
        self.x = random.randint(0, width)
        self.y = random.randint(height // 2, height)
        self.radius = random.randint(5, 10)
        self.color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
        self.time = random.randint(0, 360)

    def update(self):
        self.time += 1
        self.x += math.cos(math.radians(self.time)) * 2
        self.y += math.sin(math.radians(self.time)) * 2

    def draw(self, screen):
        pygame.draw.circle(screen, self.color, (int(self.x), int(self.y)), self.radius)

# 创建烟花列表
fireworks = [Firework() for _ in range(50)]

# 设置时钟
clock = pygame.time.Clock()

# 主循环
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # 更新屏幕为黑色背景
    screen.fill((0, 0, 0))

    # 更新和绘制烟花
    for firework in fireworks:
        firework.update()
        firework.draw(screen)

    # 绘制蛋糕
    screen.blit(cake, cake_rect)

    # 绘制文本
    screen.blit(text, text_rect)

    # 更新屏幕显示
    pygame.display.flip()

    # 控制帧率
    clock.tick(60)

# 退出Pygame
pygame.quit()
