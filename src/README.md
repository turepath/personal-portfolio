# BirdSystem - 智能观鸟系统

本项目是一个基于 **AI 视觉识别** 的全栈观鸟管理系统，集成了视频上传、实时鸟类检测、轨迹追踪及多维度数据可视化分析功能。

---

## 🏗️ 系统架构

### 后端 (Backend)

- **核心框架**: [FastAPI](./) - 高性能异步 Web 框架。
- **数据库**: MySQL + [Tortoise ORM](./) - 异步数据库交互。
- **对象存储**: MinIO - 用于存储原始视频与分析结果。
- **认证机制**: JWT (JSON Web Token) - 安全的用户权限管理。

### 前端 (Frontend)

- **核心框架**: Vue 3 (Composition API) + Vite。
- **UI & 样式**: Tailwind CSS - 现代化自适应界面。
- **可视化**: ECharts & Vue-Data-UI - 动态统计图表。
- **播放器**: Video.js - 兼容多种流媒体格式。

### AI 引擎 (AI Engine)

- **检测模型**: [YOLOv8](./) - 实时物种检测与追踪。
- **核心服务**: [VideoAnalyzer](./) - 处理动态帧决策与轨迹稳定性校验。

---

## ✨ 核心功能

- **物种自动识别**: 自动提取视频中的鸟类特征并进行分类。
- **智能轨迹追踪**: 支持运动目标追踪，有效避免同一只鸟在同一视频中被重复计数。
- **可视化大屏**: 提供物种分布、时间动态、KPI 指标等全方位数据展示。
- **视频流处理**: 支持本地视频上传分析及远程摄像头视频流接入。

---

## 🚀 快速启动

### 1. 环境准备

- **Python**: 3.10+
- **Node.js**: 18+
- **数据库**: MySQL 8.0+
- **存储**: MinIO (需创建存储桶 `video-analysis`)

### 2. 后端部署 (Port: 8000)

1. **安装 Python 依赖**:
   ```bash
   pip install -r requirements.txt
   ```
2. **环境配置**:
   修改根目录下的 [.env](./) 文件，确保数据库和 MinIO 的连接信息正确。
3. **初始化数据库**:
   ```bash
   aerich init -t config.TORTOISE_ORM
   aerich init-db
   ```
4. **运行服务**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### 3. 前端部署 (Port: 5173)

1. **进入前端目录**:
   ```bash
   cd frontend
   ```
2. **安装 Node 依赖**:
   ```bash
   npm install
   ```
3. **启动开发服务器**:
   ```bash
   npm run dev
   ```

---

## 📂 项目结构概览

- [main.py](./): 系统入口及中间件配置。
- [models/](./): 数据表模型定义。
- [routers/](./): API 路由定义。
- [services/](./): 核心业务逻辑，包括视频分析与文件存储服务。
- [frontend/src/](./): Vue 前端组件及状态管理。
- [trainmodel/](./): YOLOv8 模型权重文件。

---

## 🛠️ 技术细节说明

- **轨迹校验**: 系统在 [VideoAnalyzer](./) 中实现了基于位置偏移和类别一致性的稳定性检查，确保检测记录的准确性。
- **异步批处理**: 检测结果通过异步队列缓冲并批量写入数据库，优化了高并发场景下的 IO 性能。
