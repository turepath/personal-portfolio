import { Socket } from "socket.io-client";

interface WebRTCClientOptions {
  socket: Socket;
  roomId: string;
  userId: string;
  onRemoteStreamAdded: (stream: MediaStream, peerId: string) => void;
  onRemoteStreamRemoved: (peerId: string) => void;
  onIceCandidate: (candidate: RTCIceCandidate, peerId: string) => void;
  onOffer: (offer: RTCSessionDescriptionInit, peerId: string) => void;
  onAnswer: (answer: RTCSessionDescriptionInit, peerId: string) => void;
}

export class WebRTCClient {
  private socket: Socket;
  private roomId: string;
  private userId: string;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private iceServers: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];
  private onRemoteStreamAdded: (stream: MediaStream, peerId: string) => void;
  private onRemoteStreamRemoved: (peerId: string) => void;
  private onIceCandidate: (candidate: RTCIceCandidate, peerId: string) => void;
  private onOffer: (offer: RTCSessionDescriptionInit, peerId: string) => void;
  private onAnswer: (answer: RTCSessionDescriptionInit, peerId: string) => void;

  constructor(options: WebRTCClientOptions) {
    this.socket = options.socket;
    this.roomId = options.roomId;
    this.userId = options.userId;
    this.onRemoteStreamAdded = options.onRemoteStreamAdded;
    this.onRemoteStreamRemoved = options.onRemoteStreamRemoved;
    this.onIceCandidate = options.onIceCandidate;
    this.onOffer = options.onOffer;
    this.onAnswer = options.onAnswer;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    // 监听远程ICE候选
    this.socket.on("ice_candidate", (data) => {
      this.handleIceCandidate(data.peerId, data.candidate);
    });

    // 监听远程Offer
    this.socket.on("offer", (data) => {
      this.handleOffer(data.peerId, data.offer);
    });

    // 监听远程Answer
    this.socket.on("answer", (data) => {
      this.handleAnswer(data.peerId, data.answer);
    });

    // 监听用户加入
    this.socket.on("user_joined", (data) => {
      this.handleUserJoined(data.userId);
    });

    // 监听用户离开
    this.socket.on("user_left", (data) => {
      this.handleUserLeft(data.user_id);
    });
  }

  private createPeerConnection(peerId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection({
      iceServers: this.iceServers,
      iceTransportPolicy: "all",
      bundlePolicy: "max-bundle",
      rtcpMuxPolicy: "require",
    });

    // 监听ICE候选
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.onIceCandidate(event.candidate, peerId);
        this.socket.emit("ice_candidate", {
          room_id: this.roomId,
          peerId,
          candidate: event.candidate,
        });
      }
    };

    // 监听远程流
    pc.ontrack = (event) => {
      this.onRemoteStreamAdded(event.streams[0], peerId);
    };

    // 监听连接关闭
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "closed" || pc.connectionState === "failed") {
        this.onRemoteStreamRemoved(peerId);
        this.peerConnections.delete(peerId);
      }
    };

    return pc;
  }

  // 设置本地媒体流约束
  private getMediaConstraints(): MediaStreamConstraints {
    return {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: {
        width: {
          ideal: 720,
          max: 1280,
        },
        height: {
          ideal: 480,
          max: 720,
        },
        frameRate: {
          ideal: 30,
          max: 60,
        },
        facingMode: "user",
      },
    };
  }

  private async handleUserJoined(peerId: string) {
    console.log(`User joined: ${peerId}`);
    const pc = this.createPeerConnection(peerId);
    this.peerConnections.set(peerId, pc);

    // 添加本地流到PeerConnection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // 创建Offer，优化媒体约束
    const offerOptions = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
      voiceActivityDetection: true,
    };

    const offer = await pc.createOffer(offerOptions);
    await pc.setLocalDescription(offer);

    this.onOffer(offer, peerId);
    this.socket.emit("offer", {
      room_id: this.roomId,
      peerId,
      offer,
    });
  }

  private handleUserLeft(peerId: string) {
    console.log(`User left: ${peerId}`);
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(peerId);
      this.onRemoteStreamRemoved(peerId);
    }
  }

  private async handleOffer(peerId: string, offer: RTCSessionDescription) {
    console.log(`Received offer from ${peerId}`);
    const pc = this.createPeerConnection(peerId);
    this.peerConnections.set(peerId, pc);

    // 添加本地流到PeerConnection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // 接受Offer
    await pc.setRemoteDescription(offer);

    // 创建Answer，优化媒体约束
    const answerOptions = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
      voiceActivityDetection: true,
    };

    const answer = await pc.createAnswer(answerOptions);
    await pc.setLocalDescription(answer);

    this.onAnswer(answer, peerId);
    this.socket.emit("answer", {
      room_id: this.roomId,
      peerId,
      answer,
    });
  }

  private async handleAnswer(peerId: string, answer: RTCSessionDescription) {
    console.log(`Received answer from ${peerId}`);
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      await pc.setRemoteDescription(answer);
    }
  }

  private async handleIceCandidate(peerId: string, candidate: RTCIceCandidate) {
    console.log(`Received ICE candidate from ${peerId}`);
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      await pc.addIceCandidate(candidate);
    }
  }

  // 设置本地媒体流
  setLocalStream(stream: MediaStream) {
    this.localStream = stream;

    // 将本地流添加到所有现有连接
    this.peerConnections.forEach((pc) => {
      // 先移除现有轨道
      pc.getSenders().forEach((sender) => {
        pc.removeTrack(sender);
      });

      // 添加新轨道
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    });
  }

  // 移除本地媒体流
  removeLocalStream() {
    this.peerConnections.forEach((pc) => {
      pc.getSenders().forEach((sender) => {
        pc.removeTrack(sender);
      });
    });
    this.localStream = null;
  }

  // 关闭所有连接
  close() {
    this.peerConnections.forEach((pc) => {
      pc.close();
    });
    this.peerConnections.clear();
    this.localStream = null;
  }

  // 获取所有PeerConnection
  getPeerConnections(): Map<string, RTCPeerConnection> {
    return this.peerConnections;
  }
}
