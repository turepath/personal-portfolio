# Focus 项目启动手册

## 环境要求

- Python 3.9+
- Node.js 16+
- MySQL 8.0+
- Redis 6.0+

## 后端启动

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 环境配置

在 `backend/.env` 文件中配置：

```
# 数据库配置
DATABASE_URL=mysql+pymysql://root:CHANGE_ME@localhost:3306/focus?charset=utf8mb4

# Redis 配置
REDIS_URL=redis://localhost:6379/0

# JWT 配置
JWT_SECRET_KEY=your_jwt_secret_key_here

# Flask 配置
FLASK_ENV=development

# CORS 配置
CORS_ORIGINS=http://localhost:5173
```

### 3. 数据库初始化

```bash
# 初始化数据库迁移环境
flask db init

# 创建迁移脚本
flask db migrate -m "Initial migration"

# 应用迁移
flask db upgrade
```

### 4. 启动服务

```bash
python run.py
```

后端服务将在 `http://localhost:5000` 上运行。

## 前端启动

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

前端应用将在 `http://localhost:5173` 上运行。

## 生产环境部署

### 后端部署

```bash
# 安装依赖
pip install -r requirements.txt

# 运行数据库迁移
python migrate.py

# 启动服务
gunicorn -w 4 -b 0.0.0.0:5000 wsgi:app
```

### 前端部署

```bash
# 构建生产版本
npm run build

# 将 dist 目录部署到静态文件服务器
```

## 常见问题

### 数据库连接错误
- 确保 MySQL 服务已启动
- 检查数据库连接配置是否正确
- 确保数据库用户有足够的权限

### 前端白屏问题
- 检查 Vite 代理配置
- 清除浏览器缓存
- 检查前端代码中是否存在语法错误

### WebSocket 连接问题
- 确保后端服务正常运行
- 检查 JWT 令牌是否有效
- 检查网络连接稳定性

## 验证启动成功

- 后端启动成功：控制台显示 "Running on http://127.0.0.1:5000"
- 前端启动成功：控制台显示 "VITE v6.4.1 ready in X ms"
- 浏览器访问前端地址可正常加载页面

---

**更新日期**：2026-02-02