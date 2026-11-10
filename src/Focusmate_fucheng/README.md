# Focusmate (Next.js + WebRTC)

## 本地运行

1) 启动统一后端（HTTP + WebSocket 同端口）

```bash
node server/index.js
```

默认端口 `:8080`：
- HTTP: `POST /login`, `GET /online`
- WebSocket: `/ws?userId=<id>&token=<token>`

2) 前端环境变量（创建 `.env.local`）

```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SIGNALING_URL=ws://localhost:8080/ws
```

3) 启动前端

```bash
npm run dev
```

打开两个浏览器窗口，用不同用户名登录，相互可见在线列表并可拨打视频通话。

## 公网部署

### 前端（Next.js）

```bash
npm run build
npm run start  # 监听 3000
```

用 Nginx 反代到 `127.0.0.1:3000` 并启用 HTTPS。

### 后端（Express + ws）

使用 `pm2` 守护：

```bash
pm2 start server/index.js --name focusmate-api
```

建议前后端分域名：

- 前端：`https://app.your-domain.com`
- 后端：`https://api.your-domain.com`

前端环境变量：

```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_SIGNALING_URL=wss://api.your-domain.com/ws
```

### Nginx 示例

后端（HTTP + WS 同端口）：

```
server {
  listen 443 ssl;
  server_name api.your-domain.com;

  ssl_certificate     /path/fullchain.pem;
  ssl_certificate_key /path/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location /ws {
    proxy_pass http://127.0.0.1:8080/ws;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }
}
```

前端（Next.js）：

```
server {
  listen 443 ssl;
  server_name app.your-domain.com;

  ssl_certificate     /path/fullchain.pem;
  ssl_certificate_key /path/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

### CORS 与安全 / JWT

- 生产建议限制 CORS 的允许域名（替换开发环境的 `origin: true`）。
- 登录已使用 JWT：`server/index.js` 内通过 `JWT_SECRET` 进行签发与校验；WS 握手校验 `token` 与 `userId` 一致。
- 增加 WS 心跳（ping/pong）与掉线清理，维护准确在线状态。
- 对登录与信令接口做输入校验与速率限制。

### TURN（推荐）

部署 coturn，并在前端配置环境变量以注入 `iceServers`（见 `src/hooks/useWebRTC.ts`）：

```
NEXT_PUBLIC_STUN_URL=stun:stun.l.google.com:19302
NEXT_PUBLIC_TURN_URL=turns:turn.your-domain.com:5349
NEXT_PUBLIC_TURN_USERNAME=user
NEXT_PUBLIC_TURN_PASSWORD=pass
```
