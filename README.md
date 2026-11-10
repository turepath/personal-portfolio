# 摄像头手势识别小作品

[返回个人作品集](https://github.com/turepath/personal-portfolio/tree/main) · [project/hand-gesture分支](https://github.com/turepath/personal-portfolio/tree/project/hand-gesture)

## 项目背景

摄像头手部关键点识别与数字手势交互。

## 我的工作

源码包含相机读取、手部跟踪、手势分类、绘图、配置和诊断脚本。

## 完成情况

仅加入作品集，不补入简历；本次没有重新打开摄像头验证识别效果。

## 技术与工具

Python；MediaPipe Tasks；OpenCV；hand_landmarker.task。

## 文件入口

- [src/](src/)：源文件，保留原有名称与相对目录。
- [docs/file-index.md](docs/file-index.md)：重点文件及完整清单入口。
- [docs/整理说明.md](docs/整理说明.md)：来源、排除项及复现边界。

## 来源与使用边界

保留源码与模型，排除项目虚拟环境和缓存。运行入口及参数需以当前main.py为准。

本仓库为私有个人作品集，未对第三方或企业文件授予新的开源许可。文件存在不表示本次已重新运行程序、打开CAD装配或验证硬件效果。

## 本地运行线索

入口为`src/main.py`，环境参考`src/environment.yml`和`src/requirements.txt`，模型为`src/models/hand_landmarker.task`。先检查依赖和相机设备，再按入口帮助运行；本次未执行相机测试。
