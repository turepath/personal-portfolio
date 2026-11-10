"use client";
import { CallProvider, useCall } from "../context/CallContext";
import { UserCard } from "../components/call/UserCard";
import { VideoTile } from "../components/call/VideoTile";
import { CallControls } from "../components/call/CallControls";
import { UserProfile } from "../lib/types";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
// presence now from CallContext; PresenceProvider removed

function LoginForm() {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <form className="flex gap-2" onSubmit={async (e) => { e.preventDefault(); setLoading(true); await login(name, password); setLoading(false); }}>
      <input className="border rounded px-2 py-1" placeholder="用户名" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="border rounded px-2 py-1" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="px-3 py-1 rounded bg-blue-600 text-white" disabled={!name || !password || loading} type="submit">登录</button>
    </form>
  );
}

// removed legacy HomeInner

export default function Home() {
  // const { user, token } = useAuth();
  const { user } = useAuth();
  const meProfile = useMemo<UserProfile | null>(() => (user ? { id: user.id, displayName: user.displayName, isOnline: true } : null), [user]);

  if (!meProfile) {
    return (
      <div className="p-6 max-w-xl mx-auto w-full flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">登录</h1>
        <LoginForm />
      </div>
    );
  }

  return (
    <CallProvider me={meProfile}>
      <HomeInnerWS meId={meProfile.id} />
    </CallProvider>
  );
}

function HomeInnerWS({ meId }: { meId: string }) {
  const { presence, micEnabled, cameraEnabled, toggleMic, toggleCamera, localStream, remoteStream, startCall, inCall, endCall, incomingFromUserId, acceptCall, rejectCall, callStatus, peerUserId } = useCall();
  const others = presence.filter((u) => u.id !== meId);
  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-semibold">用户列表</h1>

      {/* 来电提示：根据 incomingFromUserId 显示来电提示 */}
      {incomingFromUserId && (
        <div className="p-3 rounded border bg-yellow-50 text-sm flex items-center justify-between">
          <span>来自 {incomingFromUserId} 的来电</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={acceptCall}>接受</button>
            <button className="px-3 py-1 rounded bg-gray-600 text-white" onClick={rejectCall}>拒绝</button>
          </div>
        </div>
      )}
      {callStatus !== "idle" && (
        <div className="text-sm opacity-70">状态：{callStatus}{peerUserId ? ` (${peerUserId})` : ""}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {others.map((u) => (
          <UserCard key={u.id} user={u} onCall={startCall} disabled={callStatus === "ringing" || callStatus === "connecting" || callStatus === "in-call"} />
        ))}
      </div>
      {inCall && (
        <>
          <h2 className="text-xl font-semibold">通话</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-2">我的视频</div>
              <VideoTile stream={localStream} isLocal={true} placeholder={<span className="opacity-70">我的摄像头已关闭</span>} />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-2">对方视频</div>
              <VideoTile stream={remoteStream} isLocal={false} placeholder={<span className="opacity-70">等待对方视频...</span>} />
            </div>
          </div>
          <CallControls mic={micEnabled} cam={cameraEnabled} onToggleMic={toggleMic} onToggleCam={toggleCamera} />
          <div>
            <button className="mt-2 px-3 py-1 rounded bg-red-600 text-white text-sm" onClick={endCall}>挂断</button>
          </div>
        </>
      )}
    </div>
  );
}
