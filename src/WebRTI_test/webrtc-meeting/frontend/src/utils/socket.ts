import { io } from "socket.io-client";

// 创建socket实例，直接连接到后端服务器
const socket = io("http://localhost:5000", {
  path: "/socket.io",
  transports: ["polling", "websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// 监听连接事件
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

// 监听错误事件
socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

export default socket;
