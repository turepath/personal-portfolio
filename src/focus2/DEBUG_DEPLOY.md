# Focus2 前后端调试与部署指南

## 一、快速调试指南

### 1. 前端调试

#### 1.1 环境准备
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install
```

#### 1.2 启动开发服务器
```bash
# 启动 Vite 开发服务器
npm run dev
```

**访问地址**: `http://localhost:5173`

#### 1.3 调试工具
- **浏览器控制台**: 查看日志和错误
- **React DevTools**: 检查组件状态
- **Network 面板**: 监控 API 请求

#### 1.4 常见问题
- **依赖安装失败**: 尝试清除 npm 缓存 `npm cache clean --force`
- **端口占用**: 修改 `vite.config.ts` 中的端口配置
- **TypeScript 错误**: 检查类型定义和导入路径

### 2. 后端调试

#### 2.1 环境准备
```bash
# 进入后端目录
cd backend

# 安装依赖
pip install -r requirements.txt
```

#### 2.2 配置环境变量
创建 `.env` 文件:
```
# 数据库连接
DATABASE_URL="mysql://username:CHANGE_ME@localhost:3306/focus2"

# JWT 密钥
SECRET_KEY="CHANGE_ME"

# 环境
FLASK_ENV="development"

# 端口
FLASK_RUN_PORT=5000
```

#### 2.3 启动开发服务器
```bash
# 启动 Flask 开发服务器
python run.py
```

**访问地址**: `http://localhost:5000`

#### 2.4 调试工具
- **Flask 调试模式**: 自动重载和错误显示
- **Postman**: 测试 API 端点
- **SQLAlchemy 日志**: 查看数据库操作

#### 2.5 常见问题
- **数据库连接失败**: 检查 MySQL 服务是否运行，用户名密码是否正确
- **模块导入错误**: 检查 Python 路径和依赖版本
- **端口占用**: 修改 `.env` 文件中的端口配置

### 3. 前后端联调

#### 3.1 确保服务运行
- 前端: `http://localhost:5173`
- 后端: `http://localhost:5000`

#### 3.2 测试 API 连接
1. 打开浏览器控制台
2. 检查网络请求
3. 验证响应状态

#### 3.3 WebSocket 测试
- 进入社区页面
- 检查控制台是否有 WebSocket 连接成功的日志
- 测试消息发送功能

## 二、快速部署指南

### 1. 前端部署

#### 1.1 构建生产版本
```bash
# 进入前端目录
cd frontend

# 构建生产版本
npm run build
```

构建产物会生成在 `dist` 目录。

#### 1.2 部署选项

##### 1.2.1 Nginx 部署
```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        root /path/to/focus2/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

##### 1.2.2 云服务部署
- **Vercel**: 直接导入前端目录
- **Netlify**: 连接 GitHub 仓库
- **AWS S3 + CloudFront**: 静态网站托管

### 2. 后端部署

#### 2.1 环境准备
```bash
# 进入后端目录
cd backend

# 安装生产依赖
pip install -r requirements.txt
```

#### 2.2 配置生产环境变量
创建 `.env` 文件:
```
# 数据库连接
DATABASE_URL="mysql://username:CHANGE_ME@localhost:3306/focus2"

# JWT 密钥
SECRET_KEY="CHANGE_ME"

# 环境
FLASK_ENV="production"

# 端口
FLASK_RUN_PORT=5000
```

#### 2.3 使用 Gunicorn 启动
```bash
# 安装 Gunicorn
pip install gunicorn

# 启动服务
# -w 4: 4 个工作进程
# -b 0.0.0.0:5000: 绑定地址和端口
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

#### 2.4 Nginx 反向代理
```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. 完整部署架构

#### 3.1 生产环境架构
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Nginx      │────>│  Gunicorn   │────>│  MySQL      │
│  (静态文件)  │     │  (Flask)    │     │  (数据库)   │
└─────────────┘     └─────────────┘     └─────────────┘
```

#### 3.2 环境变量配置

| 变量名 | 描述 | 示例值 |
|-------|------|-------|
| DATABASE_URL | 数据库连接字符串 | mysql://user:CHANGE_ME@localhost:3306/focus2 |
| SECRET_KEY | JWT 密钥 | your-secret-key |
| FLASK_ENV | 运行环境 | production |
| FLASK_RUN_PORT | Flask 端口 | 5000 |

## 三、常见问题排查

### 1. 前端问题

| 问题 | 可能原因 | 解决方案 |
|------|---------|--------|
| 页面空白 | 编译错误 | 检查控制台错误信息 |
| API 请求失败 | 跨域问题 | 检查后端 CORS 配置 |
| WebSocket 连接失败 | 地址配置错误 | 检查 WebSocket 服务地址 |

### 2. 后端问题

| 问题 | 可能原因 | 解决方案 |
|------|---------|--------|
| 服务启动失败 | 端口占用 | 修改端口配置 |
| 数据库连接失败 | 配置错误 | 检查数据库连接字符串 |
| 500 错误 | 代码异常 | 检查服务器日志 |

### 3. 部署问题

| 问题 | 可能原因 | 解决方案 |
|------|---------|--------|
| 404 错误 | 路径配置错误 | 检查 Nginx 配置 |
| 502 错误 | 后端服务未运行 | 启动 Gunicorn 服务 |
| 静态文件加载失败 | 路径错误 | 检查 Nginx root 配置 |

## 四、快速命令参考

### 前端命令
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 后端命令
```bash
# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
python run.py

# 启动生产服务器
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

### 数据库命令
```bash
# 启动 MySQL 服务 (Ubuntu)
sudo systemctl start mysql

# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE focus2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户并授权
CREATE USER 'focus2'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON focus2.* TO 'focus2'@'localhost';
FLUSH PRIVILEGES;
```

---

**注意**: 生产环境部署时，请确保：
1. 使用强密码和密钥
2. 配置 HTTPS
3. 限制服务器访问权限
4. 定期备份数据库
5. 监控服务状态

---

## 五、快速开始

### 开发环境
1. 启动 MySQL 服务
2. 创建数据库和用户
3. 配置 `.env` 文件
4. 启动后端服务: `python run.py`
5. 启动前端服务: `npm run dev`
6. 访问: `http://localhost:5173`

### 生产环境
1. 构建前端: `npm run build`
2. 配置 Nginx 静态文件服务
3. 启动后端 Gunicorn 服务
4. 配置 Nginx 反向代理
5. 访问生产域名

---

**文档版本**: v1.0.0
**最后更新**: 2026-02-05