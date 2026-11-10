/* Unified Express + ws server with JWT auth and presence push */
const express = require("express");
const cors = require("cors");
const http = require("http");
const { WebSocketServer, WebSocket } = require("ws");
const jwt = require("jsonwebtoken");

const PORT = Number(process.env.PORT || 8080);
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

const app = express();
app.use(cors({ origin: true, credentials: false }));
app.use(express.json());

// in-memory stores (demo)
const users = new Map(); // username -> { id, displayName, password }
users.set("user1", { id: "user1", displayName: "user1", password: "password" });
users.set("user2", { id: "user2", displayName: "user2", password: "password" });
users.set("user3", { id: "user3", displayName: "user3", password: "password" });
users.set("user4", { id: "user4", displayName: "user4", password: "password" });
users.set("user5", { id: "user5", displayName: "user5", password: "password" });
const userToSocket = new Map(); // userId -> ws

function signToken(user) {
  return jwt.sign({ sub: user.id, name: user.displayName }, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

function broadcastPresence() {
  const list = Array.from(userToSocket.keys()).map((id) => ({ id, displayName: id }));
  const payload = JSON.stringify({ type: "presence", users: list });
  for (const ws of userToSocket.values()) {
    if (ws.readyState === WebSocket.OPEN) ws.send(payload);
  }
}

// routes
app.post("/register", (req, res) => {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");
  if (!username || !password) return res.status(400).json({ error: "username & password required" });
  if (users.has(username)) return res.status(409).json({ error: "user exists" });
  const user = { id: username, displayName: username, password };
  users.set(username, user);
  console.log(`[HTTP] register user=${username}`);
  const token = signToken(user);
  res.json({ token, user: { id: user.id, displayName: user.displayName } });
});

app.post("/login", (req, res) => {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");
  const user = users.get(username);
  if (!user || user.password !== password) return res.status(401).json({ error: "invalid credentials" });
  console.log(`[HTTP] login user=${username}`);
  const token = signToken(user);
  res.json({ token, user: { id: user.id, displayName: user.displayName } });
});

app.get("/online", (req, res) => {
  const auth = req.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: "unauthorized" });
  const list = Array.from(userToSocket.keys()).map((id) => ({ id, displayName: id }));
  res.json(list);
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("close", () => console.log("[WS] server closed"));

function setupHeartbeat(ws) {
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });
}

wss.on("connection", (ws, req) => {
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const userId = url.searchParams.get("userId");
  const token = url.searchParams.get("token");
  const decoded = token ? verifyToken(token) : null;
  
  if (!userId || !decoded || decoded.sub !== userId) {
    console.log(`[WS] reject connection userId=${userId}, token valid=${!!decoded}`);
    ws.close(1008, "Authentication failed");
    return;
  }
  
  setupHeartbeat(ws);
  userToSocket.set(userId, ws);
  console.log(`[WS] connected userId=${userId}, online=${userToSocket.size}`);
  broadcastPresence();
  
  ws.on("message", (data) => {
    try {
      // 解析事件
      const evt = JSON.parse(String(data));
      console.log(`[WS] event type=${evt?.type} from=${evt?.fromUserId} to=${evt?.toUserId}`);
      
      if (evt && evt.toUserId) {
        // 转发事件到目标用户
        const peer = userToSocket.get(evt.toUserId);
        if (peer && peer.readyState === WebSocket.OPEN) {
          peer.send(JSON.stringify(evt));
          console.log(`[WS] forwarded ${evt.type} to ${evt.toUserId}`);
        } else {
          console.log(`[WS] target user ${evt.toUserId} not found or not connected`);
        }
      } else {
        console.log(`[WS] invalid event format:`, evt);
      }
    } catch (e) {
      console.log(`[WS] parse error:`, e.message);
    }
  });
  
  ws.on("error", (error) => {
    console.log(`[WS] error for userId=${userId}:`, error.message);
  });
  
  ws.on("close", (code, reason) => {
    if (userToSocket.get(userId) === ws) userToSocket.delete(userId);
    console.log(`[WS] disconnected userId=${userId}, code=${code}, reason=${reason}, online=${userToSocket.size}`);
    broadcastPresence();
  });
});

// ping clients
const interval = setInterval(() => {
  for (const [uid, ws] of userToSocket.entries()) {
    if (ws.isAlive === false) {
      try { ws.terminate(); } catch {}
      userToSocket.delete(uid);
      console.log(`[WS] terminated stale userId=${uid}`);
      broadcastPresence();
      continue;
    }
    ws.isAlive = false;
    try { ws.ping(); } catch {}
  }
}, 30000);

wss.on("close", () => clearInterval(interval));

server.listen(PORT, () => console.log(`Unified server listening on :${PORT}`));


