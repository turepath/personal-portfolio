import { io, Socket } from 'socket.io-client';

class WebRTCClient {
  private socket: Socket | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private roomId: string = "";
  private userId: string = "";
  private onUserJoined: ((userId: string, username: string, avatar: string) => void) | null = null;
  private onUserLeft: ((userId: string) => void) | null = null;
  private onStreamAdded: ((userId: string, stream: MediaStream) => void) | null = null;
  private onStreamRemoved: ((userId: string) => void) | null = null;
  private onMessage: ((userId: string, message: string, username?: string) => void) | null = null;
  private onError: ((error: string) => void) | null = null;

  connect(
    socketUrl: string,
    userId: string,
    roomId: string,
    stream: MediaStream,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userId = userId;
      this.roomId = roomId;
      this.localStream = stream;

      try {
        // 获取认证 token
        const token = localStorage.getItem("access_token");

        // 创建 Socket.IO 客户端实例
        const ioOptions = {
          transports: ['websocket'],
          query: { token },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        };
        this.socket = socketUrl ? io(socketUrl, ioOptions) : io(ioOptions);

        // 监听连接成功事件
        this.socket.on('connect', () => {
          console.log('Socket.IO connected');
          this.joinRoom();
          resolve();
        });

        // 监听连接错误事件
        this.socket.on('error', (error) => {
          console.error('Socket.IO error:', error);
          this.onError?.(`Socket.IO error: ${error}`);
          reject(error);
        });

        // 监听连接错误事件（Socket.IO 内置）
        this.socket.on('connect_error', (error) => {
          console.error('Socket.IO connect error:', error);
          this.onError?.(`Socket.IO connect error: ${error}`);
          reject(error);
        });

        // 监听断开连接事件
        this.socket.on('disconnect', () => {
          console.log('Socket.IO disconnected');
          this.cleanup();
        });

        // 监听加入房间成功事件
        this.socket.on('joined_room', (data) => {
          console.log('Joined room:', data.room_id);
        });

        // 监听现有用户事件
        this.socket.on('existing_users', (data) => {
          console.log('Existing users in room:', data.users);
          data.users.forEach((user: any) => {
            this.handleUserJoined(user.user_id, user.username, user.avatar);
          });
        });

        // 监听用户离开事件
        this.socket.on('left_room', (data) => {
          this.handleUserLeft(data.user_id);
        });

        // 监听用户活动事件
        this.socket.on('user_activity', (data) => {
          if (data.activity === 'joined') {
            this.handleUserJoined(data.user_id, data.username, data.avatar);
          }
        });

        // 监听视频流事件
        this.socket.on('video_feed', (data) => {
          this.handleVideoFeed(data);
        });

        // 监听 ICE 候选事件
        this.socket.on('ice_candidate', (data) => {
          this.handleIceCandidate(data);
        });

        // 监听新消息事件
        this.socket.on('new_message', (data) => {
          this.onMessage?.(data.user_id, data.message, data.username);
        });

        // 监听错误事件
        this.socket.on('error', (data) => {
          this.onError?.(data.message);
        });
      } catch (error) {
        console.error('Failed to connect Socket.IO:', error);
        this.onError?.(`Failed to connect Socket.IO: ${error}`);
        reject(error);
      }
    });
  }

  private joinRoom() {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_room', {
        room_id: this.roomId
      });
    }
  }

  private async handleUserJoined(userId: string, username: string, avatar: string) {
    if (userId === this.userId) return;

    console.log('User joined:', userId, username, avatar);
    this.onUserJoined?.(userId, username, avatar);

    // Create peer connection for new user
    await this.createPeerConnection(userId);
  }

  private handleUserLeft(userId: string) {
    if (userId === this.userId) return;

    console.log('User left:', userId);
    this.onUserLeft?.(userId);

    // Clean up peer connection
    const pc = this.peerConnections.get(userId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(userId);
    }

    this.onStreamRemoved?.(userId);
  }

  private async createPeerConnection(userId: string): Promise<void> {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
            ],
          },
        ],
      });

      this.peerConnections.set(userId, pc);

      // Add local stream tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          pc.addTrack(track, this.localStream!);
        });
      }

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('Remote track received from:', userId);
        if (event.streams && event.streams[0]) {
          this.onStreamAdded?.(userId, event.streams[0]);
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          this.sendIceCandidate(userId, event.candidate);
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state for', userId, ':', pc.connectionState);
        if (
          pc.connectionState === "closed" ||
          pc.connectionState === "failed"
        ) {
          this.peerConnections.delete(userId);
          this.onStreamRemoved?.(userId);
        }
      };

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to remote user
      this.sendVideoFeed(userId, pc.localDescription!);
    } catch (error) {
      console.error('Error creating peer connection:', error);
      this.onError?.(`Error creating peer connection: ${error}`);
    }
  }

  private async handleVideoFeed(data: any) {
    const { user_id, sdp, type } = data;
    if (user_id === this.userId) return;

    try {
      let pc = this.peerConnections.get(user_id);
      if (!pc) {
        pc = new RTCPeerConnection({
          iceServers: [
            {
              urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
              ],
            },
          ],
        });

        this.peerConnections.set(user_id, pc);

        // Add local stream tracks
        if (this.localStream) {
          this.localStream.getTracks().forEach((track) => {
            pc?.addTrack(track, this.localStream!);
          });
        }

        // Handle remote stream
        pc.ontrack = (event) => {
          console.log('Remote track received from:', user_id);
          if (event.streams && event.streams[0]) {
            this.onStreamAdded?.(user_id, event.streams[0]);
          }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            this.sendIceCandidate(user_id, event.candidate);
          }
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
          console.log(
            'Connection state for',
            user_id,
            ':',
            pc?.connectionState,
          );
          if (
            pc?.connectionState === "closed" ||
            pc?.connectionState === "failed"
          ) {
            this.peerConnections.delete(user_id);
            this.onStreamRemoved?.(user_id);
          }
        };
      }

      if (type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription({ type, sdp }));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.sendVideoFeed(user_id, pc.localDescription!);
      } else if (type === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription({ type, sdp }));
      }
    } catch (error) {
      console.error('Error handling video feed:', error);
      this.onError?.(`Error handling video feed: ${error}`);
    }
  }

  private handleIceCandidate(data: any) {
    const { user_id, candidate } = data;
    if (user_id === this.userId) return;

    const pc = this.peerConnections.get(user_id);
    if (pc) {
      pc.addIceCandidate(new RTCIceCandidate(candidate)).catch((error) => {
        console.error('Error adding ICE candidate:', error);
      });
    }
  }

  private sendVideoFeed(
    userId: string,
    sessionDescription: RTCSessionDescription,
  ) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('video_feed', {
        room_id: this.roomId,
        user_id: this.userId,
        sdp: sessionDescription.sdp,
        type: sessionDescription.type,
      });
    }
  }

  private sendIceCandidate(userId: string, candidate: RTCIceCandidate) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('ice_candidate', {
        room_id: this.roomId,
        user_id: this.userId,
        candidate: {
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid,
          sdpMLineIndex: candidate.sdpMLineIndex,
        },
      });
    }
  }

  sendMessage(message: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('send_message', {
        room_id: this.roomId,
        user_id: this.userId,
        message: message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  leaveRoom() {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave_room', {
        room_id: this.roomId,
        user_id: this.userId,
      });
    }
    this.cleanup();
  }

  private cleanup() {
    // Close all peer connections
    this.peerConnections.forEach((pc) => {
      pc.close();
    });
    this.peerConnections.clear();

    // Close socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.localStream = null;
    }
  }

  // Setters for callbacks
  setOnUserJoined(callback: (userId: string, username: string, avatar: string) => void) {
    this.onUserJoined = callback;
  }

  setOnUserLeft(callback: (userId: string) => void) {
    this.onUserLeft = callback;
  }

  setOnStreamAdded(callback: (userId: string, stream: MediaStream) => void) {
    this.onStreamAdded = callback;
  }

  setOnStreamRemoved(callback: (userId: string) => void) {
    this.onStreamRemoved = callback;
  }

  setOnMessage(callback: (userId: string, message: string, username?: string) => void) {
    this.onMessage = callback;
  }

  setOnError(callback: (error: string) => void) {
    this.onError = callback;
  }

  // Getters
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRoomId(): string {
    return this.roomId;
  }

  getUserId(): string {
    return this.userId;
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }
}

export default WebRTCClient;