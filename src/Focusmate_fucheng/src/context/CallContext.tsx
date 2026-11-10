"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createMockSignalingClient } from "../lib/signaling/mockClient";
import { createWebSocketSignalingClient } from "../lib/signaling/wsClient";
import { SignalEvent } from "../lib/signaling";
import { useLocalMedia } from "../hooks/useLocalMedia";
import { useWebRTC } from "../hooks/useWebRTC";
import { UserProfile } from "../lib/types";
import { useAuth } from "./AuthContext";

type PresenceEvent = {
  type: "presence";
  users: { id: string; displayName: string }[];
};

type SignalingEvent = SignalEvent | PresenceEvent;

type CallContextValue = {
  me: UserProfile;
  micEnabled: boolean;
  cameraEnabled: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  startCall: (toUserId: string) => Promise<void>;
  inCall: boolean;
  endCall: () => void;
  incomingFromUserId: string | null;
  acceptCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  callStatus: "idle" | "ringing" | "connecting" | "in-call" | "ended" | "failed";
  peerUserId: string | null;
  presence: { id: string; displayName: string }[];
};

const CallContext = createContext<CallContextValue | undefined>(undefined);

export function CallProvider({ children, me }: { children: React.ReactNode; me: UserProfile }) {
  const { token } = useAuth();
  const signaling = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SIGNALING_URL || "ws://localhost:8080/ws";
    if (url) return createWebSocketSignalingClient(url, token || undefined, me.id);
    return createMockSignalingClient();
  }, [token, me.id]);
  const { stream, micEnabled, cameraEnabled, toggleMic, toggleCamera, acquire, stop } = useLocalMedia();
  const { remoteStream, startCall: startPeerCall, endCall: endPeer } = useWebRTC({ signaling, localStream: stream, localUserId: me.id });
  const [inCall, setInCall] = useState(false);
  const [incomingFromUserId, setIncomingFromUserId] = useState<string | null>(null);
  const [peerUserId, setPeerUserId] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<"idle" | "ringing" | "connecting" | "in-call" | "ended" | "failed">("idle");
  const [presence, setPresence] = useState<{ id: string; displayName: string }[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try { await signaling.connect(); } catch {}
    })();
    // 处理信令事件
    const handler = (evt: SignalingEvent) => {
      // 如果事件不是发给当前用户的，则忽略
      if ("toUserId" in evt && evt.toUserId && evt.toUserId !== me.id) return;

      // 处理特定类型的事件
      if (evt.type === "ring" && evt.toUserId === me.id) {
        // 如果事件是 "ring" 类型，并且是发给当前用户的，则表明有来电，设置 incomingFromUserId
        setIncomingFromUserId(evt.fromUserId);
        setCallStatus("ringing");
      }
      if (evt.type === "end" && (evt.toUserId === me.id || evt.fromUserId === me.id)) {
        // 如果事件是 "end" 类型，并且是发给当前用户的，则表明对方挂断了电话，结束通话
        endPeer();
        stop();
        setInCall(false);
        setIncomingFromUserId(null);
        setPeerUserId(null);
        setCallStatus("ended");
      }
      if (evt.type === "presence" && "users" in evt && Array.isArray(evt.users)) {
        // 如果事件是 "presence" 类型，则这是服务器发送的广播，表明有用户上线或下线，更新在线用户列表
        setPresence(evt.users);
      }
    };
    signaling.onMessage(handler);
    return () => {
      mounted = false;
      signaling.offMessage(handler);
      signaling.disconnect().catch(() => {});
    };
  }, [signaling]);

  const waitForAccept = (toUserId: string, timeoutMs = 15000) =>
    new Promise<boolean>((resolve) => {
      let done = false;
      const onMsg = (evt: SignalEvent) => {
        if (evt.fromUserId === toUserId && evt.toUserId === me.id) {
          if (evt.type === "accept") { done = true; signaling.offMessage(onMsg); resolve(true); }
          if (evt.type === "reject") { done = true; signaling.offMessage(onMsg); resolve(false); }
        }
      };
      signaling.onMessage(onMsg);
      setTimeout(() => { if (!done) { signaling.offMessage(onMsg); resolve(false); } }, timeoutMs);
    });

  const startCall = async (toUserId: string) => {
    // 步骤1: 发送 "ring" 信令通知对方有人呼叫
    console.log(`[CallContext] A user starting call to ${toUserId}`);
    await signaling.send({ type: "ring", fromUserId: me.id, toUserId });
    setCallStatus("ringing");
    setPeerUserId(toUserId);

    // 步骤2: 等待对方接受或拒绝
    const accepted = await waitForAccept(toUserId);
    if (!accepted) {
      console.log(`[CallContext] A user call rejected or timeout`);
      setCallStatus("idle");
      setPeerUserId(null);
      return;
    }
    console.log(`[CallContext] A user call accepted, acquiring media`);

    // 步骤3: 获取本地媒体流
    const ok = await acquire();
    if (!ok) {
      console.log(`[CallContext] A user failed to acquire media`);
      setCallStatus("idle");
      setPeerUserId(null);
      return;
    }

    // 步骤4: 开始建立WebRTC连接
    try {
      setCallStatus("connecting");
      console.log(`[CallContext] A user starting peer call to ${toUserId}`);
      await startPeerCall(toUserId);
      setInCall(true);
      setCallStatus("in-call");
      console.log(`[CallContext] A user call established`);
    } catch (e) {
      console.error(`[CallContext] A user call failed:`, e);
      setInCall(false);
      setCallStatus("failed");
      stop();
    }
  };

  const acceptCall = async () => {
    // 如果 incomingFromUserId 为空，则表明没有来电，直接返回
    if (!incomingFromUserId) return;
    console.log(`[CallContext] B user accepting call from ${incomingFromUserId}`);

    // 步骤1: 发送 "accept" 信令，通知对方接受来电
    await signaling.send({ type: "accept", fromUserId: me.id, toUserId: incomingFromUserId });

    // 步骤2: 获取本地媒体流
    const ok = await acquire();
    if (!ok) {
      console.log(`[CallContext] B user failed to acquire media`);
      return;
    }

    // 步骤3: 开始建立WebRTC连接
    try {
      setCallStatus("connecting");
      console.log(`[CallContext] B user starting peer call to ${incomingFromUserId}`);
      await startPeerCall(incomingFromUserId);
      setInCall(true);
      setIncomingFromUserId(null);
      setPeerUserId(incomingFromUserId);
      setCallStatus("in-call");
      console.log(`[CallContext] B user call established`);
    } catch (e) {
      console.error(`[CallContext] B user call failed:`, e);
      setInCall(false);
      setCallStatus("failed");
      stop();
    }
  };

  const rejectCall = async () => {
    if (!incomingFromUserId) return;
    await signaling.send({ type: "reject", fromUserId: me.id, toUserId: incomingFromUserId });
    setIncomingFromUserId(null);
    setCallStatus("idle");
  };

  const value: CallContextValue = {
    me,
    micEnabled,
    cameraEnabled,
    toggleMic,
    toggleCamera,
    localStream: stream,
    remoteStream,
    startCall,
    inCall,
    endCall: () => {
      if (peerUserId) {
        signaling.send({ type: "end", fromUserId: me.id, toUserId: peerUserId });
      }
      endPeer();
      stop();
      setInCall(false);
      setPeerUserId(null);
      setCallStatus("ended");
    },
    incomingFromUserId,
    acceptCall,
    rejectCall,
    callStatus,
    peerUserId,
    presence,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used within CallProvider");
  return ctx;
}


