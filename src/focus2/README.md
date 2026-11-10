# Focus2 项目技术文档

## 1. 项目概述

Focus2 是一个基于 Flask-React 全栈框架开发的专注协作平台，旨在为用户提供沉浸式的专注环境和社区互动功能。项目采用前后端分离架构，前端使用 React + TypeScript 构建，后端使用 Flask 提供 API 服务。

### 核心功能

- **专注房间**：支持个人和多人协作专注模式
- **社区互动**：论坛、消息、好友系统
- **AI 助手**：集成 Gemini AI 提供智能辅助
- **用户系统**：注册、登录、个人设置
- **实时通信**：WebSocket 实现实时聊天和通知

## 2. 项目结构

### 2.1 整体架构

```
focus2/
├── backend/        # Flask 后端
├── frontend/       # React 前端
└── README.md       # 项目文档
```

### 2.2 后端结构 (Flask)

```
backend/
├── models/         # 数据模型层 - 定义数据库表结构和数据操作
│   ├── user.py     # 用户模型 - 处理用户信息、认证状态和个人设置
│   ├── post.py     # 帖子模型 - 处理社区帖子、内容和作者关联
│   ├── room.py     # 房间模型 - 处理专注房间、设置和成员关联
│   ├── comment.py  # 评论模型 - 处理帖子评论和回复
│   ├── friendship.py # 好友关系模型 - 处理用户间好友关系
│   ├── message.py  # 消息模型 - 处理用户消息和聊天记录
│   ├── like_save.py # 点赞收藏模型 - 处理用户对帖子的互动
│   └── setting.py  # 设置模型 - 处理用户偏好设置
├── routes/         # 路由层 - 处理 HTTP 请求和 WebSocket 连接
│   ├── api.py      # API 路由 - 处理常规业务数据请求
│   ├── auth.py     # 认证路由 - 处理用户注册、登录和令牌管理
│   └── websocket.py # WebSocket 路由 - 处理实时通信和事件
├── services/       # 业务逻辑层 - 封装核心业务逻辑
│   ├── auth_service.py # 认证服务 - 处理用户认证相关业务
│   ├── community_service.py # 社区服务 - 处理社区互动业务
│   ├── room_service.py # 房间服务 - 处理专注房间业务
│   └── ai_service.py # AI 服务 - 处理 Gemini AI 集成业务
├── utils/          # 工具函数层 - 提供通用功能
│   ├── password.py # 密码工具 - 处理密码加密和验证
│   ├── token.py    # 令牌工具 - 处理 JWT 令牌生成和验证
│   ├── validator.py # 验证工具 - 处理数据验证
│   └── response.py # 响应工具 - 处理 API 响应格式化
├── app.py          # 应用实例 - Flask 应用初始化和配置
├── run.py          # 运行入口 - 启动应用服务器
├── config.py       # 配置文件 - 管理应用配置和环境变量
└── requirements.txt # 依赖管理 - 记录项目依赖包
```

### 2.3 前端结构 (React)

```
frontend/
├── src/
│   ├── components/  # 组件层 - 构建 UI 界面和处理用户交互
│   │   ├── community/ # 社区组件 - 处理社区相关界面
│   │   │   ├── PostList.tsx # 帖子列表组件
│   │   │   ├── PostCard.tsx # 帖子卡片组件
│   │   │   ├── CommentSection.tsx # 评论区组件
│   │   │   └── MessageList.tsx # 消息列表组件
│   │   ├── rooms/     # 房间组件 - 处理专注房间界面
│   │   │   ├── RoomLayout.tsx # 房间布局组件
│   │   │   ├── FocusTimer.tsx # 专注计时器组件
│   │   │   ├── VideoGrid.tsx # 视频网格组件
│   │   │   └── RoomControls.tsx # 房间控制组件
│   │   ├── settings/  # 设置组件 - 处理用户设置界面
│   │   │   ├── ProfileSettings.tsx # 个人资料设置组件
│   │   │   ├── AccountSettings.tsx # 账户安全设置组件
│   │   │   └── NotificationSettings.tsx # 通知偏好设置组件
│   │   └── common/    # 通用组件 - 可复用的基础组件
│   │       ├── Header.tsx # 头部导航组件
│   │       ├── Footer.tsx # 页脚组件
│   │       ├── Button.tsx # 按钮组件
│   │       └── Modal.tsx # 模态框组件
│   ├── pages/       # 页面层 - 组合组件构建完整页面
│   │   ├── AuthPage.tsx # 认证页面 - 登录/注册
│   │   ├── HomePage.tsx # 主页 - 仪表盘和概览
│   │   ├── CommunityPage.tsx # 社区页面 - 论坛和消息
│   │   ├── RoomPage.tsx # 房间页面 - 专注房间
│   │   └── SettingsPage.tsx # 设置页面 - 用户设置
│   ├── services/    # 服务层 - 封装 API 调用和数据传输
│   │   ├── api.ts    # API 服务 - 处理 HTTP 请求
│   │   ├── auth.ts   # 认证服务 - 处理用户认证
│   │   ├── socket.ts # WebSocket 服务 - 处理实时通信
│   │   └── ai.ts     # AI 服务 - 处理 Gemini AI 集成
│   ├── hooks/       # 自定义钩子 - 封装可复用的 React 逻辑
│   │   ├── useAuth.ts # 认证钩子 - 管理认证状态
│   │   ├── useRooms.ts # 房间钩子 - 管理房间状态
│   │   ├── useCommunity.ts # 社区钩子 - 管理社区状态
│   │   └── useSocket.ts # WebSocket 钩子 - 管理 WebSocket 连接
│   ├── context/     # 上下文 - 管理全局状态和组件间数据共享
│   │   ├── AuthContext.tsx # 认证上下文 - 管理用户认证状态
│   │   ├── ThemeContext.tsx # 主题上下文 - 管理应用主题
│   │   └── NotificationContext.tsx # 通知上下文 - 管理系统通知
│   ├── utils/       # 工具函数 - 提供通用功能
│   │   ├── formatters.ts # 格式化工具 - 处理数据格式化
│   │   ├── validators.ts # 验证工具 - 处理表单验证
│   │   ├── storage.ts # 存储工具 - 处理本地存储
│   │   └── animations.ts # 动画工具 - 处理 UI 动画
│   ├── types/       # 类型定义 - 管理 TypeScript 类型
│   │   ├── user.ts  # 用户类型定义
│   │   ├── post.ts  # 帖子类型定义
│   │   ├── room.ts  # 房间类型定义
│   │   └── common.ts # 通用类型定义
│   └── assets/      # 静态资源 - 管理图片、图标等
│       ├── images/  # 图片资源
│       └── icons/   # 图标资源
├── public/          # 公共目录 - 存放静态文件
├── package.json     # 依赖管理 - 记录前端依赖包
├── vite.config.ts   # Vite 配置 - 构建工具配置
├── tsconfig.json    # TypeScript 配置 - 类型系统配置
└── tailwind.config.js # Tailwind CSS 配置 - 样式框架配置
```

## 3. 技术框架

### 3.1 前端技术栈

| 技术/库                       | 版本   | 用途             |
| ----------------------------- | ------ | ---------------- |
| React                         | 19.2.3 | 前端框架         |
| TypeScript                    | 5.6.2  | 类型系统         |
| Vite                          | 6.0.3  | 构建工具         |
| Tailwind CSS                  | 3.4.16 | CSS 框架         |
| React Router                  | 7.12.0 | 路由管理         |
| Axios                         | 1.5.0  | HTTP 客户端      |
| Socket.io-client              | 4.8.3  | WebSocket 客户端 |
| @google/genai                 | 1.38.0 | Gemini AI 集成   |
| @fortawesome/fontawesome-free | 7.1.0  | 图标库           |

### 3.2 后端技术栈

| 技术/库            | 用途           |
| ------------------ | -------------- |
| Flask              | Web 框架       |
| Flask-SQLAlchemy   | ORM 数据库工具 |
| Flask-Migrate      | 数据库迁移     |
| Flask-JWT-Extended | JWT 认证       |
| Flask-SocketIO     | WebSocket 支持 |
| Flask-CORS         | 跨域资源共享   |
| python-dotenv      | 环境变量管理   |
| mysqlclient        | MySQL 驱动     |
| gunicorn           | WSGI 服务器    |

## 4. 核心功能模块

### 4.1 专注房间系统

- 支持多种布局模式：双人模式、群组网格、群组环形
- 实时视频和音频通信
- 专注时间控制和统计
- 进入权限管理

### 4.2 社区系统

- 论坛帖子发布和互动
- 好友关系管理
- 实时消息系统
- 点赞和收藏功能

### 4.3 AI 助手

- Gemini AI 集成
- 实时聊天和辅助
- 智能建议和提醒

### 4.4 用户系统

- 注册和登录
- 个人资料编辑
- 账户安全设置
- 通知偏好设置

## 5. API 架构

### 5.1 认证 API

- `/api/auth/register` - 用户注册
- `/api/auth/login` - 用户登录
- `/api/auth/logout` - 用户登出
- `/api/auth/refresh` - 刷新令牌

### 5.2 社区 API

- `/api/community/posts` - 帖子管理
- `/api/community/comments` - 评论管理
- `/api/community/friends` - 好友管理
- `/api/community/messages` - 消息管理

### 5.3 房间 API

- `/api/rooms` - 房间管理
- `/api/rooms/members` - 房间成员管理
- `/api/rooms/settings` - 房间设置

### 5.4 WebSocket 事件

- `message` - 消息事件
- `notification` - 通知事件
- `room:join` - 加入房间事件
- `room:leave` - 离开房间事件

## 6. 数据库设计

### 6.1 核心数据表

- `users` - 用户信息
- `posts` - 社区帖子
- `comments` - 评论
- `rooms` - 专注房间
- `room_members` - 房间成员
- `friendships` - 好友关系
- `messages` - 消息记录
- `likes_saves` - 点赞和收藏
- `settings` - 用户设置

## 7. 前后端调试指南

### 7.1 前端调试

1. **安装依赖**

   ```bash
   cd frontend
   npm install
   ```

2. **启动开发服务器**

   ```bash
   npm run dev
   ```

   访问地址: `http://localhost:5173`

3. **代码检查**
   ```bash
   npm run build
   ```

### 7.2 后端调试

1. **安装依赖**

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **配置环境变量**
   创建 `.env` 文件，配置数据库连接等信息

3. **启动开发服务器**

   ```bash
   python run.py
   ```

   访问地址: `http://localhost:5000`

4. **API 测试**
   使用 Postman 或浏览器测试 API 端点

## 8. 部署指南

### 8.1 前端部署

1. **构建生产版本**

   ```bash
   cd frontend
   npm run build
   ```

2. **部署到静态文件服务器**
   将 `dist` 目录部署到 Nginx、Apache 或云存储服务

### 8.2 后端部署

1. **配置生产环境**
   - 设置 `FLASK_ENV=production`
   - 配置数据库连接
   - 设置 JWT 密钥

2. **使用 Gunicorn 启动**

   ```bash
   cd backend
   gunicorn -w 4 -b 0.0.0.0:5000 run:app
   ```

3. **配置 Nginx 反向代理**

   ```nginx
   server {
       listen 80;
       server_name example.com;

       location /api/ {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       location / {
           root /path/to/frontend/dist;
           index index.html;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

## 9. 技术栈选择理由

### 9.1 前端选择

- **React + TypeScript**：提供类型安全和组件化开发体验
- **Vite**：快速的开发服务器和构建工具
- **Tailwind CSS**：实用优先的 CSS 框架，提高开发效率
- **Socket.io**：可靠的实时通信解决方案
- **@google/genai**：集成 Google Gemini AI 能力

### 9.2 后端选择

- **Flask**：轻量级 Web 框架，适合构建 API 服务
- **Flask-SQLAlchemy**：ORM 工具，简化数据库操作
- **Flask-JWT-Extended**：安全的认证解决方案
- **Flask-SocketIO**：WebSocket 支持，实现实时通信
- **MySQL**：可靠的关系型数据库，适合存储结构化数据

## 10. 项目亮点

1. **全栈 TypeScript**：前端使用 TypeScript，提供类型安全
2. **实时通信**：WebSocket 实现实时互动功能
3. **AI 集成**：集成 Gemini AI 提供智能辅助
4. **模块化设计**：前后端均采用模块化架构，易于维护和扩展
5. **响应式布局**：适配不同设备屏幕
6. **安全认证**：JWT 令牌认证，保障用户数据安全

## 11. 快速开始

### 11.1 环境要求

- **Node.js**：v18.0+
- **Python**：v3.8+
- **MySQL**：v8.0+

### 11.2 启动步骤

1. **克隆项目**

   ```bash
   git clone <repository-url>
   cd focus2
   ```

2. **启动后端**

   ```bash
   cd backend
   pip install -r requirements.txt
   python run.py
   ```

3. **启动前端**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **访问应用**
   打开浏览器访问：`http://localhost:5173`

---

**注意**：本项目为开发版本，生产环境部署前请确保配置好相应的安全措施和环境变量。
