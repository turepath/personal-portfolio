# 三子棋视觉机械臂协同系统

[返回个人作品集](https://github.com/turepath/personal-portfolio/tree/main) · [project/tic-tac-toe分支](https://github.com/turepath/personal-portfolio/tree/project/tic-tac-toe)

## 项目背景

视觉组预备阶段的模拟电赛项目，通过识别棋盘和棋子输出机械臂落子坐标。

## 我的工作

使用Python、OpenCV、YOLO及轮廓特征处理图像；完成坐标标定、函数封装，尝试穷举、概率和规则落子策略并加入拦截逻辑。

## 完成情况

本人负责视觉与决策，参与识别、坐标输出和落子联调；源文件中的嵌入式脚本需匹配对应MaxCam硬件固件。

## 技术与工具

Python；OpenCV；YOLO；MaxCam；坐标标定。

## 文件入口

- [src/](src/)：源文件，保留原有名称与相对目录。
- [docs/file-index.md](docs/file-index.md)：重点文件及完整清单入口。
- [docs/整理说明.md](docs/整理说明.md)：来源、排除项及复现边界。

## 来源与使用边界

只收录Robot目录下的三子棋电赛模拟子目录，不混入其他RoboCon或视频编辑项目。

本仓库为私有个人作品集，未对第三方或企业文件授予新的开源许可。文件存在不表示本次已重新运行程序、打开CAD装配或验证硬件效果。
