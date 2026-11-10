# Focus 项目文档

## 1. 项目概述

Focus 是一个基于 Flask 和 React 的全栈应用，用于帮助用户提高工作效率和专注力。本项目包含完整的前端和后端实现，支持用户认证、实时通信、房间管理和消息系统等核心功能。

## 2. 技术栈

### 后端技术栈

- **Flask**: 轻量级 Python Web 框架
- **Flask-SQLAlchemy**: ORM 工具，用于数据库操作
- **Flask-Migrate**: 数据库迁移工具
- **Flask-JWT-Extended**: JWT 认证扩展
- **Flask-SocketIO**: WebSocket 支持，用于实时通信
- **Flask-CORS**: 跨域资源共享支持
- **MySQL**: 关系型数据库
- **Redis**: 缓存和实时数据存储

### 前端技术栈

- **React 18**: 前端框架
- **TypeScript**: 类型安全的 JavaScript 超集
- **Vite**: 现代化前端构建工具
- **React Router**: 前端路由管理
- **Socket.IO Client**: WebSocket 客户端
- **WebRTC**: 实时通信技术，用于视频通话

## 3. 核心功能

### 3.1 用户认证系统

- 用户注册和登录
- JWT 令牌认证
- 密码哈希存储
- 受保护路由访问控制

### 3.2 房间管理系统

- 1:1 房间（一对一视频通话）
- 1:many 房间（一对多视频通话）
- 1:pro 房间（专业版房间）
- 虚拟形象（Virtual）模式
- 房间创建、加入、退出、删除
- 参与者管理和通知
- 房间状态管理（live/idle/scheduled）

### 3.3 实时通信系统

- WebSocket 连接管理
- 事件驱动的消息传递
- 房间内聊天功能
- 视频流管理
- 屏幕共享功能
- 异常断开重连机制

### 3.4 消息系统

- 好友关系管理
- 私信功能
- 消息历史记录
- 消息状态管理（已读/未读）
- 用户搜索和匹配

## 4. 项目结构

### 4.1 后端结构

```
backend/
├── models/               # 数据库模型定义
│   ├── community.py      # 社区相关模型
│   ├── post.py           # 帖子相关模型
│   ├── room.py           # 房间相关模型
│   ├── settings.py       # 设置相关模型
│   └── user.py           # 用户相关模型
├── routes/               # API 路由定义
│   ├── api.py            # 通用 API 路由
│   ├── auth.py           # 认证相关路由
│   └── websocket.py      # WebSocket 路由
├── services/             # 业务逻辑服务
│   ├── auth_service.py   # 认证服务
│   └── db_service.py     # 数据库服务
├── tests/                # 测试代码
├── utils/                # 工具函数
├── .env                  # 环境变量配置
├── app.py                # Flask 应用入口
├── config.py             # 应用配置
├── requirements.txt      # 后端依赖列表
└── run.py                # 后端启动脚本
```

### 4.2 前端结构

```
frontend/
├── api/                  # API 服务调用
├── components/           # React 组件
│   ├── community/        # 社区相关组件
│   ├── rooms/            # 房间相关组件
│   ├── settings/         # 设置相关组件
│   ├── AICompanion.tsx   # AI 助手组件
│   ├── Common.tsx        # 通用组件
│   └── RoomCard.tsx      # 房间卡片组件
├── context/              # React Context
│   └── AuthContext.tsx   # 认证上下文
├── hooks/                # 自定义 React Hooks
├── layouts/              # 布局组件
├── pages/                # 页面组件
│   ├── Community.tsx     # 社区页面
│   ├── Rooms.tsx         # 房间列表页面
│   ├── RoomPage.tsx      # 房间详情页面
│   ├── Messages.tsx      # 消息页面
│   └── Settings.tsx      # 设置页面
├── styles/               # 样式文件
├── App.tsx               # React 应用入口
├── index.tsx             # React 渲染入口
├── package.json          # 前端依赖配置
├── tsconfig.json         # TypeScript 配置
└── vite.config.ts        # Vite 配置
```

## 5. API 端点

| 端点                             | 方法   | 描述                     | 认证要求 |
| -------------------------------- | ------ | ------------------------ | -------- |
| `/api/health`                    | GET    | 后端健康检查             | 否       |
| `/api/auth/register`             | POST   | 用户注册                 | 否       |
| `/api/auth/login`                | POST   | 用户登录                 | 否       |
| `/api/auth/me`                   | GET    | 获取当前用户信息         | 是       |
| `/api/auth/me`                   | PUT    | 更新当前用户信息         | 是       |
| `/api/rooms`                     | GET    | 获取房间列表             | 是       |
| `/api/rooms`                     | POST   | 创建房间                 | 是       |
| `/api/rooms/:id`                 | GET    | 获取房间详情             | 是       |
| `/api/rooms/:id`                 | PUT    | 更新房间                 | 是       |
| `/api/rooms/:id`                 | DELETE | 删除房间                 | 是       |
| `/api/rooms/:id/join`            | POST   | 加入房间                 | 是       |
| `/api/rooms/:id/leave`           | POST   | 离开房间                 | 是       |
| `/api/settings`                  | GET    | 获取用户设置             | 是       |
| `/api/settings`                  | PUT    | 更新用户设置             | 是       |
| `/api/posts`                     | GET    | 获取帖子列表             | 是       |
| `/api/posts`                     | POST   | 创建帖子                 | 是       |
| `/api/posts/:id`                 | GET    | 获取帖子详情             | 是       |
| `/api/posts/:id`                 | PUT    | 更新帖子                 | 是       |
| `/api/posts/:id`                 | DELETE | 删除帖子                 | 是       |
| `/api/users/search`              | GET    | 搜索用户                 | 是       |
| `/api/users/match/random`        | POST   | 随机匹配用户             | 是       |
| `/api/friends`                   | GET    | 获取好友列表             | 是       |
| `/api/friends/{user_id}/request` | POST   | 发送好友请求             | 是       |
| `/api/friends/{user_id}/accept`  | PUT    | 接受好友请求             | 是       |
| `/api/friends/{user_id}`         | DELETE | 删除好友                 | 是       |
| `/api/messages/{user_id}`        | GET    | 获取与指定用户的消息历史 | 是       |
| `/api/messages/{message_id}`     | DELETE | 删除指定消息             | 是       |
| `/api/messages/{user_id}/read`   | PUT    | 标记消息为已读           | 是       |

## 6. WebSocket 事件

### 6.1 连接管理

| 事件名       | 方向          | 描述                |
| ------------ | ------------- | ------------------- |
| `connect`    | 双向          | 建立 WebSocket 连接 |
| `disconnect` | 双向          | 断开 WebSocket 连接 |
| `join_room`  | 客户端→服务器 | 加入房间            |
| `leave_room` | 客户端→服务器 | 离开房间            |

### 6.2 房间事件

| 事件名             | 方向          | 描述                           |
| ------------------ | ------------- | ------------------------------ |
| `room_initialized` | 服务器→客户端 | 房间初始化，返回房间参与者信息 |
| `user_joined`      | 服务器→客户端 | 用户加入房间通知               |
| `user_left`        | 服务器→客户端 | 用户离开房间通知               |
| `host_changed`     | 服务器→客户端 | 房间主机变更通知               |
| `room_ended`       | 服务器→客户端 | 房间结束通知                   |

### 6.3 视频相关事件

| 事件名                   | 方向          | 描述              |
| ------------------------ | ------------- | ----------------- |
| `video_stream_available` | 服务器→客户端 | 视频流可用        |
| `audio_muted`            | 服务器→客户端 | 用户静音/取消静音 |
| `camera_toggled`         | 服务器→客户端 | 用户开关摄像头    |
| `screen_share_started`   | 服务器→客户端 | 用户开始屏幕共享  |
| `screen_share_stopped`   | 服务器→客户端 | 用户停止屏幕共享  |

### 6.4 消息事件

| 事件名                    | 方向          | 描述           |
| ------------------------- | ------------- | -------------- |
| `private_message`         | 客户端→服务器 | 发送私聊消息   |
| `new_private_message`     | 服务器→客户端 | 接收私聊消息   |
| `friend_request`          | 客户端→服务器 | 发送好友请求   |
| `new_friend_request`      | 服务器→客户端 | 接收好友请求   |
| `friend_request_accepted` | 服务器→客户端 | 好友请求被接受 |

## 7. 数据库设计

### 7.1 数据库名称

数据库名称：`focus`

### 7.2 字符集和排序规则

- 数据库字符集：`utf8mb4`
- 数据库排序规则：`utf8mb4_unicode_ci`

### 7.3 主要表结构

#### user 表

| 字段名        | 数据类型     | 约束                        | 描述          |
| ------------- | ------------ | --------------------------- | ------------- |
| id            | INT          | PRIMARY KEY, AUTO_INCREMENT | 用户 ID       |
| username      | VARCHAR(64)  | UNIQUE, NOT NULL            | 用户名        |
| password_hash | VARCHAR(256) | NOT NULL                    | 哈希后的密码  |
| created_at    | DATETIME     | DEFAULT CURRENT_TIMESTAMP   | 创建时间      |
| accountID     | VARCHAR(8)   | UNIQUE, NOT NULL            | 8位固定账户ID |
| name          | VARCHAR(64)  | NOT NULL                    | 用户昵称      |
| avatar        | VARCHAR(256) | NOT NULL                    | 头像URL       |
| isPro         | BOOLEAN      | DEFAULT FALSE               | 是否为Pro用户 |
| points        | INT          | DEFAULT 0                   | 积分          |
| bio           | TEXT         | NULL                        | 个人简介      |
| birthDate     | DATE         | NULL                        | 出生日期      |

#### room 表

| 字段名           | 数据类型     | 约束                        | 描述             |
| ---------------- | ------------ | --------------------------- | ---------------- |
| id               | INT          | PRIMARY KEY, AUTO_INCREMENT | 房间 ID          |
| name             | VARCHAR(128) | NOT NULL                    | 房间名称         |
| owner_id         | INT          | FOREIGN KEY                 | 房间所有者ID     |
| type             | VARCHAR(20)  | NOT NULL, DEFAULT '1:1'     | 房间类型         |
| participants     | INT          | DEFAULT 0                   | 参与者数量       |
| max_participants | INT          | DEFAULT 2                   | 最大参与者数量   |
| virtual_allowed  | BOOLEAN      | DEFAULT TRUE                | 是否允许虚拟形象 |
| is_paid          | BOOLEAN      | DEFAULT FALSE               | 是否为付费房间   |
| status           | VARCHAR(20)  | DEFAULT 'idle'              | 房间状态         |
| created_at       | DATETIME     | DEFAULT CURRENT_TIMESTAMP   | 创建时间         |
| updated_at       | DATETIME     | DEFAULT CURRENT_TIMESTAMP   | 更新时间         |

#### friendship 表

| 字段名     | 数据类型    | 约束                                                  | 描述                                             |
| ---------- | ----------- | ----------------------------------------------------- | ------------------------------------------------ |
| id         | INT         | PRIMARY KEY, AUTO_INCREMENT                           | 关系ID                                           |
| user_id    | INT         | FOREIGN KEY (user.id)                                 | 用户ID                                           |
| friend_id  | INT         | FOREIGN KEY (user.id)                                 | 好友ID                                           |
| status     | VARCHAR(20) | NOT NULL                                              | 关系状态：pending_sent, pending_received, friend |
| created_at | DATETIME    | DEFAULT CURRENT_TIMESTAMP                             | 创建时间                                         |
| updated_at | DATETIME    | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间                                         |

#### message 表

| 字段名       | 数据类型     | 约束                        | 描述                                                  |
| ------------ | ------------ | --------------------------- | ----------------------------------------------------- |
| id           | INT          | PRIMARY KEY, AUTO_INCREMENT | 消息ID                                                |
| sender_id    | INT          | FOREIGN KEY (user.id)       | 发送者ID                                              |
| recipient_id | INT          | FOREIGN KEY (user.id)       | 接收者ID                                              |
| content      | TEXT         | NOT NULL                    | 消息内容                                              |
| type         | VARCHAR(20)  | NOT NULL                    | 消息类型：text, file, friend_request, friend_accepted |
| file_url     | VARCHAR(256) | NULL                        | 文件URL（如果是文件消息）                             |
| file_name    | VARCHAR(256) | NULL                        | 文件名（如果是文件消息）                              |
| room_id      | VARCHAR(64)  | NULL                        | 关联的房间ID                                          |
| is_read      | BOOLEAN      | DEFAULT FALSE               | 是否已读                                              |
| created_at   | DATETIME     | DEFAULT CURRENT_TIMESTAMP   | 创建时间                                              |

#### session 表

| 字段名       | 数据类型    | 约束                                                  | 描述                  |
| ------------ | ----------- | ----------------------------------------------------- | --------------------- |
| id           | VARCHAR(64) | PRIMARY KEY                                           | 会话ID                |
| user_id      | INT         | FOREIGN KEY (user.id)                                 | 用户ID                |
| socket_id    | VARCHAR(64) | NOT NULL                                              | WebSocket连接ID       |
| ip_address   | VARCHAR(45) | NOT NULL                                              | 用户IP地址            |
| connected_at | DATETIME    | DEFAULT CURRENT_TIMESTAMP                             | 连接时间              |
| last_active  | DATETIME    | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 最后活跃时间          |
| status       | VARCHAR(20) | NOT NULL                                              | 状态：online, offline |

## 8. 启动流程

### 8.1 环境要求

- Python 3.9+
- Node.js 16+
- MySQL 8.0+
- Redis 6.0+

### 8.2 后端安装和启动

#### 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

#### 数据库迁移

```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

#### 启动后端服务

```bash
python run.py
```

后端服务将在 `http://localhost:5000` 上运行。

### 8.3 前端安装和启动

#### 安装依赖

```bash
cd frontend
npm install
```

#### 启动前端开发服务器

```bash
npm run dev
```

前端应用将在 `http://localhost:5173` 上运行。

## 9. 部署说明

### 9.1 后端部署

1. 安装依赖：`pip install -r requirements.txt`
2. 运行数据库迁移：`python migrate.py`
3. 启动服务：`gunicorn -w 4 -b 0.0.0.0:5000 wsgi:app`

### 9.2 前端部署

1. 构建生产版本：`npm run build`
2. 将 `dist` 目录部署到静态文件服务器

## 10. 常见问题和解决方案

### 10.1 前端白屏问题

**问题**：前端页面显示白屏，控制台报错。

**解决方案**：

- 检查 Vite 代理配置，确保 `.ts` 文件不会被代理到后端
- 检查前端代码中是否存在语法错误
- 清除浏览器缓存，重新加载页面

### 10.2 API 404 错误

**问题**：前端请求 API 时返回 404 错误。

**解决方案**：

- 检查 API 端点是否正确，确保使用了 `/api` 前缀
- 检查后端路由配置，确保蓝图注册正确
- 检查后端服务是否正常运行

### 10.3 数据库连接错误

**问题**：后端无法连接到数据库。

**解决方案**：

- 检查数据库服务是否正常运行
- 检查数据库连接配置是否正确
- 确保数据库用户有足够的权限

### 10.4 WebSocket 连接问题

**问题**：WebSocket 连接失败或频繁断开。

**解决方案**：

- 检查 WebSocket 服务是否正常运行
- 确保 JWT 令牌有效
- 检查网络连接稳定性
- 检查防火墙设置

## 11. 安全措施

### 11.1 认证与授权

- **JWT认证**：所有API请求和WebSocket连接都需要JWT令牌
- **权限验证**：确保用户只能访问自己的消息和好友关系
- **输入验证**：对所有用户输入进行严格验证，防止注入攻击

### 11.2 数据保护

- **消息加密**：敏感消息内容可以加密存储
- **密码哈希**：用户密码使用bcrypt进行哈希存储
- **数据脱敏**：API返回数据时，隐藏敏感字段

### 11.3 网络安全

- **CSRF保护**：对所有POST请求添加CSRF令牌
- **XSS防护**：对用户输入进行HTML转义
- **速率限制**：限制API请求频率，防止DDoS攻击
- **安全头部**：设置适当的HTTP安全头部

## 12. 性能优化

### 12.1 数据库优化

- **索引**：在常用查询字段上创建索引
- **分页查询**：消息历史和好友列表实现分页加载
- **连接池**：使用数据库连接池管理连接

### 12.2 缓存机制

- **Redis缓存**：缓存用户信息、好友列表和频繁访问的消息
- **本地缓存**：前端实现本地缓存，减少网络请求
- **消息队列**：使用Redis消息队列处理高并发消息

### 12.3 连接管理

- **连接池**：优化WebSocket连接池配置
- **心跳检测**：实现WebSocket心跳检测，及时清理无效连接
- **自动重连**：客户端实现自动重连机制，提高连接可靠性

### 12.4 前端优化

- **虚拟滚动**：长列表使用虚拟滚动，优化渲染性能
- **延迟加载**：非关键资源延迟加载
- **代码分割**：实现代码分割，减少初始加载时间

## 13. 技术流程解释

### 13.1 认证流程

1. **用户注册**：
   - 用户在前端输入注册信息
   - 前端发送 POST 请求到 `/api/auth/register`
   - 后端验证信息，创建用户，返回 JWT 令牌
   - 前端存储令牌，更新认证状态

2. **用户登录**：
   - 用户在前端输入登录信息
   - 前端发送 POST 请求到 `/api/auth/login`
   - 后端验证信息，生成 JWT 令牌，返回给前端
   - 前端存储令牌，更新认证状态

3. **受保护路由访问**：
   - 前端请求携带 JWT 令牌
   - 后端验证令牌有效性
   - 验证通过则返回请求数据，否则返回 401 错误

### 13.2 实时通信流程

1. 前端通过 Socket.IO 连接到后端
2. 用户发送实时消息
3. 后端接收消息，处理并广播给相关用户
4. 前端接收广播消息，更新界面

### 13.3 房间模块技术实现

1. **视频通信**：
   - 使用 **WebRTC** 实现点对点视频通话
   - 使用 **Socket.IO** 作为信令服务器，传递 ICE 候选、Offer/Answer 等信令消息
   - 支持摄像头和麦克风权限管理
   - 实现了本地和远程媒体流的管理

2. **房间类型**：
   - 1:1 房间（一对一视频通话）
   - 1:many 房间（一对多视频通话）
   - 1:pro 房间（专业版房间）
   - 支持虚拟形象（Virtual）模式

3. **房间功能**：
   - 参与者管理（加入/离开通知）
   - 主机变更机制
   - 视频流管理（添加/移除远程流）
   - 权限控制和设置保存

### 13.4 消息模块技术实现

1. **实时通信**：
   - 使用 **Socket.IO** 实现实时聊天功能
   - 支持房间内聊天和社区聊天
   - 实现了消息的实时传递和广播

2. **前端实现**：
   - 包含 ChatWindow、MessagesPanel 等组件
   - 支持消息历史记录和实时更新
   - 实现了聊天状态管理

## 14. 联系方式

如有问题或建议，请联系项目维护人员。

---

**更新日期**：2026-02-02
**版本**：1.0.1 | DEFAULT TRUE | 是否允许虚拟形象 |
| is_paid | BOOLEAN | DEFAULT FALSE | 是否为付费房间 |
| status | VARCHAR(20) | DEFAULT 'idle' | 房间状态 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

#### friendship 表

| 字段名     | 数据类型    | 约束                                                  | 描述                                             |
| ---------- | ----------- | ----------------------------------------------------- | ------------------------------------------------ |
| id         | INT         | PRIMARY KEY, AUTO_INCREMENT                           | 关系ID                                           |
| user_id    | INT         | FOREIGN KEY (user.id)                                 | 用户ID                                           |
| friend_id  | INT         | FOREIGN KEY (user.id)                                 | 好友ID                                           |
| status     | VARCHAR(20) | NOT NULL                                              | 关系状态：pending_sent, pending_received, friend |
| created_at | DATETIME    | DEFAULT CURRENT_TIMESTAMP                             | 创建时间                                         |
| updated_at | DATETIME    | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间                                         |

#### message 表

| 字段名       | 数据类型     | 约束                        | 描述                                                  |
| ------------ | ------------ | --------------------------- | ----------------------------------------------------- |
| id           | INT          | PRIMARY KEY, AUTO_INCREMENT | 消息ID                                                |
| sender_id    | INT          | FOREIGN KEY (user.id)       | 发送者ID                                              |
| recipient_id | INT          | FOREIGN KEY (user.id)       | 接收者ID                                              |
| content      | TEXT         | NOT NULL                    | 消息内容                                              |
| type         | VARCHAR(20)  | NOT NULL                    | 消息类型：text, file, friend_request, friend_accepted |
| file_url     | VARCHAR(256) | NULL                        | 文件URL（如果是文件消息）                             |
| file_name    | VARCHAR(256) | NULL                        | 文件名（如果是文件消息）                              |
| room_id      | VARCHAR(64)  | NULL                        | 关联的房间ID                                          |
| is_read      | BOOLEAN      | DEFAULT FALSE               | 是否已读                                              |
| created_at   | DATETIME     | DEFAULT CURRENT_TIMESTAMP   | 创建时间                                              |

#### session 表

| 字段名       | 数据类型    | 约束                                                  | 描述                  |
| ------------ | ----------- | ----------------------------------------------------- | --------------------- |
| id           | VARCHAR(64) | PRIMARY KEY                                           | 会话ID                |
| user_id      | INT         | FOREIGN KEY (user.id)                                 | 用户ID                |
| socket_id    | VARCHAR(64) | NOT NULL                                              | WebSocket连接ID       |
| ip_address   | VARCHAR(45) | NOT NULL                                              | 用户IP地址            |
| connected_at | DATETIME    | DEFAULT CURRENT_TIMESTAMP                             | 连接时间              |
| last_active  | DATETIME    | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 最后活跃时间          |
| status       | VARCHAR(20) | NOT NULL                                              | 状态：online, offline |

## 8. 启动流程

### 8.1 环境要求

- Python 3.9+
- Node.js 16+
- MySQL 8.0+
- Redis 6.0+

### 8.2 后端安装和启动

#### 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

#### 数据库迁移

```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

#### 启动后端服务

```bash
python run.py
```

后端服务将在 `http://localhost:5000` 上运行。

### 8.3 前端安装和启动

#### 安装依赖

```bash
cd frontend
npm install
```

#### 启动前端开发服务器

```bash
npm run dev
```

前端应用将在 `http://localhost:5173` 上运行。

## 9. 部署说明

### 9.1 后端部署

1. 安装依赖：`pip install -r requirements.txt`
2. 运行数据库迁移：`python migrate.py`
3. 启动服务：`gunicorn -w 4 -b 0.0.0.0:5000 wsgi:app`

### 9.2 前端部署

1. 构建生产版本：`npm run build`
2. 将 `dist` 目录部署到静态文件服务器

## 10. 常见问题和解决方案

### 10.1 前端白屏问题

**问题**：前端页面显示白屏，控制台报错。

**解决方案**：

- 检查 Vite 代理配置，确保 `.ts` 文件不会被代理到后端
- 检查前端代码中是否存在语法错误
- 清除浏览器缓存，重新加载页面

### 10.2 API 404 错误

**问题**：前端请求 API 时返回 404 错误。

**解决方案**：

- 检查 API 端点是否正确，确保使用了 `/api` 前缀
- 检查后端路由配置，确保蓝图注册正确
- 检查后端服务是否正常运行

### 10.3 数据库连接错误

**问题**：后端无法连接到数据库。

**解决方案**：

- 检查数据库服务是否正常运行
- 检查数据库连接配置是否正确
- 确保数据库用户有足够的权限

### 10.4 WebSocket 连接问题

**问题**：WebSocket 连接失败或频繁断开。

**解决方案**：

- 检查 WebSocket 服务是否正常运行
- 确保 JWT 令牌有效
- 检查网络连接稳定性
- 检查防火墙设置

## 11. 安全措施

### 11.1 认证与授权

- **JWT认证**：所有API请求和WebSocket连接都需要JWT令牌
- **权限验证**：确保用户只能访问自己的消息和好友关系
- **输入验证**：对所有用户输入进行严格验证，防止注入攻击

### 11.2 数据保护

- **消息加密**：敏感消息内容可以加密存储
- **密码哈希**：用户密码使用bcrypt进行哈希存储
- **数据脱敏**：API返回数据时，隐藏敏感字段

### 11.3 网络安全

- **CSRF保护**：对所有POST请求添加CSRF令牌
- **XSS防护**：对用户输入进行HTML转义
- **速率限制**：限制API请求频率，防止DDoS攻击
- **安全头部**：设置适当的HTTP安全头部

## 12. 性能优化

### 12.1 数据库优化

- **索引**：在常用查询字段上创建索引
- **分页查询**：消息历史和好友列表实现分页加载
- **连接池**：使用数据库连接池管理连接

### 12.2 缓存机制

- **Redis缓存**：缓存用户信息、好友列表和频繁访问的消息
- **本地缓存**：前端实现本地缓存，减少网络请求
- **消息队列**：使用Redis消息队列处理高并发消息

### 12.3 连接管理

- **连接池**：优化WebSocket连接池配置
- **心跳检测**：实现WebSocket心跳检测，及时清理无效连接
- **自动重连**：客户端实现自动重连机制，提高连接可靠性

### 12.4 前端优化

- **虚拟滚动**：长列表使用虚拟滚动，优化渲染性能
- **延迟加载**：非关键资源延迟加载
- **代码分割**：实现代码分割，减少初始加载时间

## 13. 技术流程解释

### 13.1 认证流程

1. **用户注册**：
   - 用户在前端输入注册信息
   - 前端发送 POST 请求到 `/api/auth/register`
   - 后端验证信息，创建用户，返回 JWT 令牌
   - 前端存储令牌，更新认证状态

2. **用户登录**：
   - 用户在前端输入登录信息
   - 前端发送 POST 请求到 `/api/auth/login`
   - 后端验证信息，生成 JWT 令牌，返回给前端
   - 前端存储令牌，更新认证状态

3. **受保护路由访问**：
   - 前端请求携带 JWT 令牌
   - 后端验证令牌有效性
   - 验证通过则返回请求数据，否则返回 401 错误

### 13.2 实时通信流程

1. 前端通过 Socket.IO 连接到后端
2. 用户发送实时消息
3. 后端接收消息，处理并广播给相关用户
4. 前端接收广播消息，更新界面

### 13.3 房间模块技术实现

1. **视频通信**：
   - 使用 **WebRTC** 实现点对点视频通话
   - 使用 **Socket.IO** 作为信令服务器，传递 ICE 候选、Offer/Answer 等信令消息
   - 支持摄像头和麦克风权限管理
   - 实现了本地和远程媒体流的管理

2. **房间类型**：
   - 1:1 房间（一对一视频通话）
   - 1:many 房间（一对多视频通话）
   - 1:pro 房间（专业版房间）
   - 支持虚拟形象（Virtual）模式

3. **房间功能**：
   - 参与者管理（加入/离开通知）
   - 主机变更机制
   - 视频流管理（添加/移除远程流）
   - 权限控制和设置保存

### 13.4 消息模块技术实现

1. **实时通信**：
   - 使用 **Socket.IO** 实现实时聊天功能
   - 支持房间内聊天和社区聊天
   - 实现了消息的实时传递和广播

2. **前端实现**：
   - 包含 ChatWindow、MessagesPanel 等组件
   - 支持消息历史记录和实时更新
   - 实现了聊天状态管理

## 14. 联系方式

如有问题或建议，请联系项目维护人员。

---

**更新日期**：2026-02-02
**版本**：1.0.1
