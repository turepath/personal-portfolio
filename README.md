# 鸟类智能观测与识别平台

[返回个人作品集](https://github.com/turepath/personal-portfolio/tree/main) · [project/bird-observation分支](https://github.com/turepath/personal-portfolio/tree/project/bird-observation)

## 项目背景

将鸟类图像/视频识别结果接入数据库，再在网页中查看。

## 我的工作

负责前后端开发，结合YOLO进行鸟类识别，使用FastAPI接口、数据库和Vue 3展示观测数据。

## 完成情况

本人确认实现过采集、识别、保存和展示流程；本次只静态整理源码，未启动数据库、摄像头或训练任务。

## 技术与工具

FastAPI；Vue 3；YOLO；Tortoise ORM；MySQL；MinIO。

## 文件入口

- [src/](src/)：源文件，保留原有名称与相对目录。
- [docs/file-index.md](docs/file-index.md)：重点文件及完整清单入口。
- [docs/整理说明.md](docs/整理说明.md)：来源、排除项及复现边界。

## 来源与使用边界

本地README、配置与源码显示存在数据库、对象存储和JWT组件。生产配置、.env、日志和个人上传数据不入库；模型是否齐全以文件清单为准。

本仓库为私有个人作品集，未对第三方或企业文件授予新的开源许可。文件存在不表示本次已重新运行程序、打开CAD装配或验证硬件效果。

## 本地运行线索

后端入口为`src/main.py`，依赖见`src/requirements.txt`和`src/pyproject.toml`；前端在`src/frontend/`。配置需在本地填写数据库、MinIO和JWT信息；训练模型若未随目录提供，需要另行补齐。
