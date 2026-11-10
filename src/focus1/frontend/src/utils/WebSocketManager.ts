import { io, Socket } from "socket.io-client";
import { getToken } from "../services/api/auth";

interface RoomSettings {
  videoEnabled: boolean;
  audioEnabled: boolean;
  chatEnabled: boolean;
  screenShareEnabled: boolean;
}

interface RoomState {
  id: string;
  name: string;
  ownerId: string;
  status: "waiting" | "live" | "ended" | "idle";
  participants: {
    userId: string;
    name: string;
    avatar: string;
    isHost: boolean;
    isMuted: boolean;
    isCameraOn: boolean;
    joinedAt: Date;
  }[];
  settings: RoomSettings;
  createdAt: Date;
}

class WebSocketManager {
  private _socket: Socket | null = null;
  private token: string | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private roomState: RoomState | null = null;
  private currentRoomId: string | null = null;
  private isInitializing: boolean = false;
  private reconnectionAttempts: number = 0;
  private maxReconnectionDelay: number = 32000;
  private _isRoomInitialized: boolean = false;

  // 获取socket实例
  get socket(): Socket | null {
    return this._socket;
  }

  connect(roomId?: string) {
    this.token = getToken();
    if (!this.token) return;

    this.currentRoomId = roomId || null;

    // 如果已经存在连接，先断开
    if (this._socket && this._socket.connected) {
      console.log(
        "Disconnecting existing WebSocket connection before reconnecting",
      );
      this._socket.disconnect();
      this._socket = null;
    }

    // 构建查询参数，只在有roomId时添加room_id
    const query: { token: string; room_id?: string } = { token: this.token };
    if (roomId) {
      query.room_id = roomId;
    }

    console.log("Connecting to WebSocket with roomId:", roomId);
    this._socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      auth: { token: this.token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: this.maxReconnectionDelay,
      randomizationFactor: 0.5,
      query,
      transports: ["websocket", "polling"], // 支持WebSocket和polling
      timeout: 20000, // 20秒连接超时
    });

    this.setupEventListeners();
  }

  // 安全地加入房间，确保房间存在
  safeJoinRoom(roomId: string) {
    if (!roomId) {
      console.error("Invalid room ID");
      return;
    }

    this.currentRoomId = roomId;

    // 确保WebSocket连接稳定后再加入房间
    if (this._socket?.connected) {
      console.log("WebSocket connected, joining room immediately:", roomId);
      this._socket.emit("join_room", { room_id: roomId });
    } else {
      console.log(
        "WebSocket not connected, waiting for connection before joining room:",
        roomId,
      );
      // 如果socket实例不存在，先创建连接
      if (!this._socket) {
        this.connect(roomId);
      } else {
        // 如果socket存在但未连接，尝试重新连接
        this._socket.connect();
      }
      
      // 等待连接建立后再加入房间
      let connectAttempts = 0;
      const maxConnectAttempts = 10;
      const connectCheckInterval = 500;

      const checkConnection = () => {
        connectAttempts++;
        if (this._socket?.connected) {
          console.log("WebSocket connected, now joining room:", roomId);
          this._socket.emit("join_room", { room_id: roomId });
        } else if (connectAttempts < maxConnectAttempts) {
          console.log(
            `Checking connection attempt ${connectAttempts}/${maxConnectAttempts}...`,
          );
          setTimeout(checkConnection, connectCheckInterval);
        } else {
          console.error(
            "Failed to connect to WebSocket after multiple attempts, cannot join room:",
            roomId,
          );
          // 不再强制用户退出房间，只记录错误
        }
      };

      // 立即开始检查连接
      checkConnection();
    }
  }

  disconnect() {
    this._socket?.disconnect();
    this._socket = null;
    this.listeners.clear();
    this.roomState = null;
    this.currentRoomId = null;
    this.isInitializing = false;
    this._isRoomInitialized = false;
    this.reconnectionAttempts = 0;
  }

  reconnect() {
    if (this._socket && !this._socket.connected) {
      this._socket.connect();
    }
  }

  private setupEventListeners() {
    if (!this._socket) return;

    this._socket.on("connect", () => {
      console.log("WebSocket connected successfully");
      console.log("Socket ID:", this._socket?.id);
      this.notifyListeners("connect", {});
      this.reconnectionAttempts = 0;

      // 获取用户ID并加入用户房间
      const userId = localStorage.getItem("user_id");
      if (userId) {
        console.log("Joining user room:", `user_${userId}`);
        this._socket?.emit("join_room", { room_id: `user_${userId}` });
      }

      // 如果有当前房间ID，使用safeJoinRoom方法安全加入房间
      if (this.currentRoomId) {
        console.log("Joining current room:", this.currentRoomId);
        this.safeJoinRoom(this.currentRoomId);
      }
    });

    this._socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected, reason:", reason);
      this.notifyListeners("disconnect", { reason });
    });

    this._socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      this.notifyListeners("connect_error", error);
    });

    this._socket.on("error", (error) => {
      console.error("WebSocket error:", error);
      this.notifyListeners("error", error);
    });

    // 消息事件
    this._socket.on("new_private_message", (data) => {
      this.notifyListeners("new_private_message", data);
    });

    // 房间消息事件
    this._socket.on("new_message", (data) => {
      console.log("New message:", data);
      this.notifyListeners("new_message", data);
    });

    // 好友请求事件
    this._socket.on("new_friend_request", (data) => {
      this.notifyListeners("new_friend_request", data);
    });

    this._socket.on("friend_request_sent", (data) => {
      this.notifyListeners("friend_request_sent", data);
    });

    this._socket.on("friend_request_accepted", (data) => {
      this.notifyListeners("friend_request_accepted", data);
    });

    this._socket.on("friend_request_accepted_ack", (data) => {
      this.notifyListeners("friend_request_accepted_ack", data);
    });

    // 房间事件 - 新增
    this._socket.on("room_initialized", (data) => {
      console.log("Room initialized:", data);
      this.roomState = data;
      this.isInitializing = false;
      this._isRoomInitialized = true;
      this.notifyListeners("room_initialized", data);
    });

    this._socket.on("user_joining", (data) => {
      console.log("User joining:", data);
      this.notifyListeners("user_joining", data);
    });

    this._socket.on("user_joined", (data) => {
      console.log("User joined:", data);
      // 更新房间状态中的参与者列表
      if (this.roomState) {
        this.roomState.participants.push({
          userId: data.userId,
          name: data.name,
          avatar: data.avatar,
          isHost: data.isHost,
          isMuted: data.isMuted,
          isCameraOn: data.isCameraOn,
          joinedAt: new Date(data.joinedAt),
        });
      }
      this.notifyListeners("user_joined", data);
    });

    this._socket.on("user_left", (data) => {
      console.log("User left:", data);
      // 更新房间状态中的参与者列表
      if (this.roomState) {
        this.roomState.participants = this.roomState.participants.filter(
          (participant) => participant.userId !== data.user_id,
        );
      }
      this.notifyListeners("user_left", data);
    });

    this._socket.on("host_changed", (data) => {
      console.log("Host changed:", data);
      // 更新房间状态中的所有者信息
      if (this.roomState) {
        this.roomState.ownerId = data.new_host_id;
        this.roomState.participants.forEach((participant) => {
          participant.isHost = participant.userId === data.new_host_id;
        });
      }
      this.notifyListeners("host_changed", data);
    });

    this._socket.on("room_ended", (data) => {
      console.log("Room ended:", data);
      this.roomState = null;
      this._isRoomInitialized = false;
      this.notifyListeners("room_ended", data);
    });

    // 视频相关事件 - 新增
    this._socket.on("video_stream_available", (data) => {
      console.log("Video stream available:", data);
      this.notifyListeners("video_stream_available", data);
    });

    this._socket.on("audio_muted", (data) => {
      console.log("Audio muted:", data);
      // 更新房间状态中的参与者静音状态
      if (this.roomState) {
        const participant = this.roomState.participants.find(
          (p) => p.userId === data.user_id,
        );
        if (participant) {
          participant.isMuted = data.muted;
        }
      }
      this.notifyListeners("audio_muted", data);
    });

    this._socket.on("camera_toggled", (data) => {
      console.log("Camera toggled:", data);
      // 更新房间状态中的参与者摄像头状态
      if (this.roomState) {
        const participant = this.roomState.participants.find(
          (p) => p.userId === data.user_id,
        );
        if (participant) {
          participant.isCameraOn = data.camera_on;
        }
      }
      this.notifyListeners("camera_toggled", data);
    });

    this._socket.on("screen_share_started", (data) => {
      console.log("Screen share started:", data);
      this.notifyListeners("screen_share_started", data);
    });

    this._socket.on("screen_share_stopped", (data) => {
      console.log("Screen share stopped:", data);
      this.notifyListeners("screen_share_stopped", data);
    });

    // 重连事件 - 新增
    this._socket.on("reconnect_attempt", (attempt: number) => {
      console.log(`Reconnect attempt ${attempt}`);
      this.reconnectionAttempts = attempt;
      this.notifyListeners("reconnect_attempt", { attempt });
    });

    this._socket.on("reconnect", () => {
      console.log("Reconnected successfully");
      this.reconnectionAttempts = 0;
      this.notifyListeners("reconnected", {});
      // 重连后重新同步房间状态
      if (this.currentRoomId) {
        this.syncRoomState(this.currentRoomId);
      }
    });

    this._socket.on("reconnect_error", (error) => {
      console.error("Reconnect error:", error);
      this.notifyListeners("reconnect_error", error);
    });

    this._socket.on("reconnect_failed", () => {
      console.error("Reconnect failed after multiple attempts");
      this.notifyListeners("reconnect_failed", {});
    });
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      this.listeners.set(
        event,
        callbacks.filter((cb) => cb !== callback),
      );
    }
  }

  private notifyListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    callbacks?.forEach((callback) => callback(data));
  }

  send(event: string, data: any) {
    if (this._socket?.connected) {
      this._socket.emit(event, data);
    } else {
      // 如果WebSocket未连接，尝试建立连接
      console.log("WebSocket not connected, attempting to connect...");
      console.log("Current socket state:", {
        connected: this._socket?.connected,
        disconnected: this._socket?.disconnected,
        active: this._socket?.active,
      });

      // 如果socket实例不存在，先创建连接
      if (!this._socket) {
        this.connect();
      } else {
        // 如果socket存在但未连接，尝试重新连接
        this._socket.connect();
      }

      // 延迟发送消息，确保连接建立
      let attempts = 0;
      const maxAttempts = 5;
      const attemptInterval = 1000;

      const trySend = () => {
        attempts++;
        if (this._socket?.connected) {
          console.log("WebSocket connected, sending event:", event);
          this._socket.emit(event, data);
        } else if (attempts < maxAttempts) {
          console.log(
            `WebSocket connection attempt ${attempts}/${maxAttempts}...`,
          );
          setTimeout(trySend, attemptInterval);
        } else {
          console.error(
            "WebSocket still not connected after multiple reconnect attempts. Event:",
            event,
          );
          console.error("Socket state after reconnect attempts:", {
            connected: this._socket?.connected,
            disconnected: this._socket?.disconnected,
            active: this._socket?.active,
          });
        }
      };

      setTimeout(trySend, attemptInterval);
    }
  }

  isConnected(): boolean {
    return this._socket?.connected || false;
  }

  // 房间初始化方法 - 新增
  initializeRoom(roomId: string, settings: RoomSettings) {
    this.isInitializing = true;
    this.send("initialize_room", { room_id: roomId, settings });
  }

  // 同步房间状态 - 新增
  syncRoomState(roomId: string) {
    this.send("sync_room_state", { room_id: roomId });
  }

  // 通知视频流可用 - 新增
  notifyVideoStreamAvailable(roomId: string, streamId: string) {
    this.send("video_stream_available", {
      room_id: roomId,
      stream_id: streamId,
    });
  }

  // 静音/取消静音 - 新增
  toggleMute(roomId: string, muted: boolean) {
    this.send("toggle_mute", { room_id: roomId, muted });
  }

  // 开关摄像头 - 新增
  toggleCamera(roomId: string, cameraOn: boolean) {
    this.send("toggle_camera", { room_id: roomId, camera_on: cameraOn });
  }

  // 开始屏幕共享 - 新增
  startScreenShare(roomId: string, streamId: string) {
    this.send("start_screen_share", { room_id: roomId, stream_id: streamId });
  }

  // 停止屏幕共享 - 新增
  stopScreenShare(roomId: string) {
    this.send("stop_screen_share", { room_id: roomId });
  }

  // 获取当前房间状态 - 新增
  getRoomState(): RoomState | null {
    return this.roomState;
  }

  // 获取重连尝试次数 - 新增
  getReconnectionAttempts(): number {
    return this.reconnectionAttempts;
  }

  // 是否已初始化 - 新增
  isInitializingRoom(): boolean {
    return this.isInitializing;
  }

  // 加入房间方法
  joinRoom(roomId: string) {
    this.currentRoomId = roomId;
    this.send("join_room", { room_id: roomId });
  }

  // 离开房间方法
  leaveRoom(roomId: string) {
    this.send("leave_room", { room_id: roomId });
  }

  // 获取当前房间ID
  getCurrentRoomId(): string | null {
    return this.currentRoomId;
  }

  // 房间是否已初始化
  isRoomInitialized(): boolean {
    return this._isRoomInitialized;
  }

  // 发送消息方法
  sendMessage(roomId: string, message: string) {
    const messageData = {
      roomId,
      message,
      timestamp: new Date().toISOString(),
    };
    this.send("send_message", messageData);
  }
}

export default new WebSocketManager();
