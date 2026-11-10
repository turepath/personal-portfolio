import { useEffect, useRef, useState } from "react";
import { SignalingClient, SignalEvent } from "../lib/signaling";

type UseWebRTCArgs = {
  signaling: SignalingClient;
  localStream: MediaStream | null;
  localUserId: string;
};

export function useWebRTC({ signaling, localStream, localUserId }: UseWebRTCArgs) {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerUserIdRef = useRef<string | null>(null);
  const tracksAddedRef = useRef<Set<string>>(new Set());
  const iceCandidateQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;

  const ensurePeer = () => {
    // 如果连接已存在，直接返回（不管什么状态）
    if (peerRef.current) {
      console.log(`[useWebRTC] Using existing connection with state: ${peerRef.current.connectionState}`);
      return peerRef.current;
    }
    
    // 配置多个STUN服务器以提高连接成功率，特别是针对中国地区
    const iceServers: RTCIceServer[] = [
      // 主要STUN服务器 - 中国地区兼容
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
      // 备用STUN服务器
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun.stunprotocol.org:3478" },
      { urls: "stun:stun.voiparound.com" },
      { urls: "stun:stun.voipbuster.com" },
      { urls: "stun:stun.voipstunt.com" },
      { urls: "stun:stun.counterpath.com" },
      { urls: "stun:stun.1und1.de" },
      { urls: "stun:stun.gmx.net" },
      { urls: "stun:stun.callwithus.com" },
      { urls: "stun:stun.counterpath.com" },
      { urls: "stun:stun.1und1.de" },
      { urls: "stun:stun.gmx.net" },
      { urls: "stun:stun.callwithus.com" },
      { urls: "stun:stun.internetcalls.com" },
      { urls: "stun:stun.sipgate.net" },
      { urls: "stun:stun.softjoys.com" },
      { urls: "stun:stun.voiparound.com" },
      { urls: "stun:stun.voipbuster.com" },
      { urls: "stun:stun.voipstunt.com" },
      { urls: "stun:stun.voxgratia.org" },
      { urls: "stun:stun.xten.com" },
      // 中国地区STUN服务器
      { urls: "stun:stun.qq.com:3478" },
      { urls: "stun:stun.miwifi.com:3478" },
    ];
    
    // 添加TURN服务器（如果配置了）
    const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
    const turnUser = process.env.NEXT_PUBLIC_TURN_USERNAME;
    const turnPass = process.env.NEXT_PUBLIC_TURN_PASSWORD;
    if (turnUrl && turnUser && turnPass) {
      iceServers.push({ urls: turnUrl, username: turnUser, credential: turnPass });
    }
    
    // 添加环境变量中的自定义STUN服务器
    const customStun = process.env.NEXT_PUBLIC_STUN_URL;
    if (customStun) {
      iceServers.unshift({ urls: customStun });
    }
    
    console.log(`[useWebRTC] Creating peer connection with ${iceServers.length} ICE servers`);
    const pc = new RTCPeerConnection({ 
      iceServers,
      iceCandidatePoolSize: 10, // 预收集ICE候选
      bundlePolicy: 'max-bundle', // 优化连接
      rtcpMuxPolicy: 'require' // 要求RTCP复用
    });
    pc.ontrack = (e) => {
      console.log(`[useWebRTC] Received track from remote peer:`, e);
      console.log(`[useWebRTC] Track kind: ${e.track.kind}, enabled: ${e.track.enabled}`);
      const [first] = e.streams;
      if (first) {
        console.log(`[useWebRTC] Setting remote stream with ${first.getTracks().length} tracks`);
        console.log(`[useWebRTC] Remote stream tracks:`, first.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, id: t.id })));
        setRemoteStream(first);
      } else {
        console.log(`[useWebRTC] No streams in track event`);
      }
    };
    pc.onicecandidate = (e) => {
      if (e.candidate && peerUserIdRef.current) {
        console.log(`[useWebRTC] Sending ICE candidate to ${peerUserIdRef.current}:`, e.candidate);
        signaling.send({ type: "ice", fromUserId: localUserId, toUserId: peerUserIdRef.current, candidate: e.candidate.toJSON() });
      } else if (!e.candidate) {
        console.log(`[useWebRTC] ICE candidate gathering completed`);
      }
    };
    pc.onconnectionstatechange = () => {
      console.log(`[useWebRTC] Connection state: ${pc.connectionState}`);
      if (pc.connectionState === 'connected') {
        console.log(`[useWebRTC] Peer connection established!`);
        // 连接建立后，检查是否有远程流
        const receivers = pc.getReceivers();
        console.log(`[useWebRTC] Connection established with ${receivers.length} receivers`);
        receivers.forEach((receiver, index) => {
          console.log(`[useWebRTC] Receiver ${index}: ${receiver.track?.kind} track`);
        });
      } else if (pc.connectionState === 'failed') {
        console.error(`[useWebRTC] Peer connection failed!`);
        // 清除连接超时
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        // 连接失败时尝试重新连接
        if (retryCountRef.current < maxRetries && peerUserIdRef.current) {
          retryCountRef.current++;
          console.log(`[useWebRTC] Attempting to restart connection (retry ${retryCountRef.current}/${maxRetries})...`);
          setTimeout(() => {
            if (peerUserIdRef.current) {
              startCall(peerUserIdRef.current);
            }
          }, 2000 * retryCountRef.current); // 递增延迟
        } else {
          console.error(`[useWebRTC] Max retries reached, giving up`);
          retryCountRef.current = 0;
        }
      } else if (pc.connectionState === 'disconnected') {
        console.warn(`[useWebRTC] Peer connection disconnected`);
        // 清除连接超时
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
      } else if (pc.connectionState === 'connecting') {
        console.log(`[useWebRTC] Peer connection connecting...`);
        // 设置连接超时
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
        }
        connectionTimeoutRef.current = setTimeout(() => {
          if (pc.connectionState === 'connecting') {
            console.error(`[useWebRTC] Connection timeout after 30 seconds`);
            pc.close();
            if (retryCountRef.current < maxRetries && peerUserIdRef.current) {
              retryCountRef.current++;
              console.log(`[useWebRTC] Retrying connection due to timeout (retry ${retryCountRef.current}/${maxRetries})...`);
              setTimeout(() => {
                if (peerUserIdRef.current) {
                  startCall(peerUserIdRef.current);
                }
              }, 2000);
            }
          }
        }, 30000); // 30秒超时
      }
    };
    pc.oniceconnectionstatechange = () => {
      console.log(`[useWebRTC] ICE connection state: ${pc.iceConnectionState}`);
      if (pc.iceConnectionState === 'connected') {
        console.log(`[useWebRTC] ICE connection established!`);
      } else if (pc.iceConnectionState === 'failed') {
        console.error(`[useWebRTC] ICE connection failed!`);
      }
    };
    pc.onicegatheringstatechange = () => {
      console.log(`[useWebRTC] ICE gathering state: ${pc.iceGatheringState}`);
      if (pc.iceGatheringState === 'complete') {
        console.log(`[useWebRTC] ICE gathering completed`);
      }
    };
    pc.onsignalingstatechange = () => {
      console.log(`[useWebRTC] Signaling state: ${pc.signalingState}`);
    };
    peerRef.current = pc;
    return pc;
  };

  // 强制创建新连接的函数（用于需要重新建立连接的场景）
  const forceNewPeer = () => {
    console.log(`[useWebRTC] Force creating new connection`);
    if (peerRef.current) {
      try {
        peerRef.current.close();
      } catch {}
      peerRef.current = null;
      // 清理相关状态
      tracksAddedRef.current.clear();
      iceCandidateQueueRef.current = [];
      setRemoteStream(null);
    }
    return ensurePeer();
  };

  useEffect(() => {
    const pc = peerRef.current;
    if (!pc || !localStream) return;
    
    // 避免重复添加相同的轨道
    localStream.getTracks().forEach((track) => {
      const trackId = track.id;
      if (!tracksAddedRef.current.has(trackId)) {
        console.log(`[useWebRTC] Adding track: ${track.kind} (${trackId})`);
        pc.addTrack(track, localStream);
        tracksAddedRef.current.add(trackId);
      }
    });
  }, [localStream]);

  // 添加一个调试函数来检查连接状态
  useEffect(() => {
    const pc = peerRef.current;
    if (!pc) return;
    
    const checkConnection = () => {
      console.log(`[useWebRTC] Connection state: ${pc.connectionState}`);
      console.log(`[useWebRTC] ICE connection state: ${pc.iceConnectionState}`);
      console.log(`[useWebRTC] Signaling state: ${pc.signalingState}`);
      console.log(`[useWebRTC] ICE gathering state: ${pc.iceGatheringState}`);
      console.log(`[useWebRTC] Senders: ${pc.getSenders().length}`);
      console.log(`[useWebRTC] Receivers: ${pc.getReceivers().length}`);
    };
    
    // 每5秒检查一次连接状态
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = async (evt: SignalEvent) => {
      if (evt.fromUserId === localUserId) return;

      if (evt.type === "offer") {
        console.log(`[useWebRTC] Received offer from ${evt.fromUserId}`);
        
        const pc = ensurePeer();
        if (!pc) return;
        peerUserIdRef.current = evt.fromUserId;
        try {
          // 步骤1: 添加本地媒体流到连接
          if (localStream) {
            console.log(`[useWebRTC] Local stream available, adding tracks before handling offer`);
            localStream.getTracks().forEach((track) => {
              const trackId = track.id;
              if (!tracksAddedRef.current.has(trackId)) {
                console.log(`[useWebRTC] Adding track: ${track.kind} (${trackId})`);
                pc.addTrack(track, localStream);
                tracksAddedRef.current.add(trackId);
              }
            });
          }
          
          await pc.setRemoteDescription(evt.sdp);
          
          // 处理队列中的ICE候选
          for (const candidate of iceCandidateQueueRef.current) {
            try {
              await pc.addIceCandidate(candidate);
              console.log(`[useWebRTC] Added queued ICE candidate`);
            } catch (error) {
              console.error(`[useWebRTC] Error adding queued ICE candidate:`, error);
            }
          }
          iceCandidateQueueRef.current = [];
          
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log(`[useWebRTC] Sending answer to ${evt.fromUserId}`);
          await signaling.send({ type: "answer", fromUserId: localUserId, toUserId: evt.fromUserId, sdp: answer });
          
          // 强制触发ICE候选收集
          console.log(`[useWebRTC] Triggering ICE candidate gathering for answer`);
        } catch (error) {
          console.error(`[useWebRTC] Error handling offer:`, error);
        }
      } else if (evt.type === "answer") {
        console.log(`[useWebRTC] Received answer from ${evt.fromUserId}`);
        const pc = peerRef.current;
        if (!pc) {
          console.warn(`[useWebRTC] No peer connection available for answer`);
          return;
        }
        try {
          await pc.setRemoteDescription(evt.sdp);
          
          // 处理队列中的ICE候选
          for (const candidate of iceCandidateQueueRef.current) {
            try {
              await pc.addIceCandidate(candidate);
              console.log(`[useWebRTC] Added queued ICE candidate`);
            } catch (error) {
              console.error(`[useWebRTC] Error adding queued ICE candidate:`, error);
            }
          }
          iceCandidateQueueRef.current = [];
        } catch (error) {
          console.error(`[useWebRTC] Error handling answer:`, error);
        }
      } else if (evt.type === "ice" && evt.candidate) {
        console.log(`[useWebRTC] Received ICE candidate from ${evt.fromUserId}:`, evt.candidate);
        const pc = peerRef.current;
        if (!pc) {
          console.warn(`[useWebRTC] No peer connection available for ICE candidate`);
          return;
        }
        try {
          // 检查连接状态，只有在连接状态允许时才添加ICE候选
          if (pc.signalingState === 'stable' || pc.signalingState === 'have-local-offer' || pc.signalingState === 'have-remote-offer') {
            await pc.addIceCandidate(evt.candidate);
            console.log(`[useWebRTC] Successfully added ICE candidate`);
          } else {
            // 如果远程描述还没有设置，将候选加入队列
            if (pc.remoteDescription) {
              iceCandidateQueueRef.current.push(evt.candidate);
              console.log(`[useWebRTC] Queued ICE candidate for later processing (signaling state: ${pc.signalingState})`);
            } else {
              iceCandidateQueueRef.current.push(evt.candidate);
              console.log(`[useWebRTC] Queued ICE candidate for later processing (no remote description)`);
            }
          }
        } catch (error) {
          console.error(`[useWebRTC] Error adding ICE candidate:`, error);
          // 如果添加失败，尝试加入队列
          iceCandidateQueueRef.current.push(evt.candidate);
          console.log(`[useWebRTC] Added failed ICE candidate to queue for retry`);
        }
      }
    };
    signaling.onMessage(handler);
    return () => signaling.offMessage(handler);
  }, [localUserId, signaling]);

  const startCall = async (toUserId: string) => {
    console.log(`[useWebRTC] Creating offer for ${toUserId}`);
    
    // 清除之前的超时
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    
    // 重置重试计数
    retryCountRef.current = 0;
    
    // 步骤1: 强制创建新的 RTCPeerConnection（主动发起通话）
    const pc = forceNewPeer();
    if (!pc) return;
    peerUserIdRef.current = toUserId;

    try {
      // 步骤2: 添加本地媒体流到连接
      if (localStream) {
        console.log(`[useWebRTC] Local stream available, adding tracks before creating offer`);
        localStream.getTracks().forEach((track) => {
          const trackId = track.id;
          if (!tracksAddedRef.current.has(trackId)) {
            console.log(`[useWebRTC] Adding track: ${track.kind} (${trackId})`);
            pc.addTrack(track, localStream);
            tracksAddedRef.current.add(trackId);
          }
        });
      }
      
      // 步骤3: 创建并发送offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log(`[useWebRTC] Sending offer to ${toUserId}`);
      await signaling.send({ type: "offer", fromUserId: localUserId, toUserId, sdp: offer });
      
      // 强制触发ICE候选收集
      console.log(`[useWebRTC] Triggering ICE candidate gathering for offer`);
    } catch (error) {
      console.error(`[useWebRTC] Error creating offer:`, error);
    }
  };

  const endCall = () => {
    // 清除连接超时
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    
    // 重置重试计数
    retryCountRef.current = 0;
    
    const pc = peerRef.current;
    if (pc) {
      try {
        pc.getSenders().forEach((s) => {
          try { s.track && s.track.stop(); } catch {}
        });
        pc.getReceivers().forEach((r) => {
          try { r.track && r.track.stop(); } catch {}
        });
        pc.onicecandidate = null;
        pc.ontrack = null;
        pc.onconnectionstatechange = null;
        pc.oniceconnectionstatechange = null;
        pc.onicegatheringstatechange = null;
        pc.onsignalingstatechange = null;
        pc.close();
      } catch {}
    }
    peerRef.current = null;
    peerUserIdRef.current = null;
    tracksAddedRef.current.clear();
    iceCandidateQueueRef.current = [];
    setRemoteStream(null);
  };

  return { remoteStream, startCall, endCall };
}


