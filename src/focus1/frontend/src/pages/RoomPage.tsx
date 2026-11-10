import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RoomLayout, RoomMode } from "../components/rooms/RoomLayout";
import { EntryPermissionModal } from "../components/rooms/EntryPermissionModal";
import {
  useEntryPermissions,
  PermissionSaveOptions,
} from "../hooks/useEntryPermissions";
import { useRoom } from "../context/RoomContext";
import WebSocketManager from "../utils/WebSocketManager";
import { WebRTCClient } from "../utils/WebRTCClient";
import { Room } from "../types";
import { Button } from "../components/Common";

export const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { getForRoom, savePermissions, requestMedia } = useEntryPermissions();
  const { joinRoom, leaveRoom } = useRoom();

  const [loading, setLoading] = useState(true);
  const [showPermModal, setShowPermModal] = useState(false);
  const [roomData, setRoomData] = useState<Room | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [resolvedPrefs, setResolvedPrefs] =
    useState<PermissionSaveOptions | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map(),
  );
  const [webrtcClient, setWebrtcClient] = useState<WebRTCClient | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isRoomValid, setIsRoomValid] = useState(false);

  useEffect(() => {
    // 获取用户ID
    const userId = localStorage.getItem("user_id") || "";
    if (!userId) {
      navigate("/login");
      return;
    }

    // WebRTC事件处理函数
    const handleRemoteStreamAdded = (stream: MediaStream, peerId: string) => {
      console.log("Remote stream added from:", peerId);
      setRemoteStreams((prev) => {
        const newMap = new Map(prev);
        newMap.set(peerId, stream);
        return newMap;
      });
    };

    const handleRemoteStreamRemoved = (peerId: string) => {
      console.log("Remote stream removed from:", peerId);
      setRemoteStreams((prev) => {
        const newMap = new Map(prev);
        newMap.delete(peerId);
        return newMap;
      });
    };

    const handleIceCandidate = (candidate: RTCIceCandidate, peerId: string) => {
      console.log("ICE candidate from:", peerId);
    };

    const handleOffer = (offer: RTCSessionDescription, peerId: string) => {
      console.log("Offer from:", peerId);
    };

    const handleAnswer = (answer: RTCSessionDescription, peerId: string) => {
      console.log("Answer from:", peerId);
    };

    // 监听房间初始化事件
    const handleRoomInitialized = (data: any) => {
      console.log("Room initialized:", data);
      setParticipants(
        data.participants.map((p: any) => ({
          id: `user-${p.userId}`,
          name: p.name,
          avatar: p.avatar,
          isVirtual: false,
          isMuted: p.isMuted,
          isCameraOn: p.isCameraOn,
          isHost: p.isHost,
        })),
      );
    };

    // 监听参与者加入事件
    const handleUserJoined = (data: any) => {
      console.log("User joined:", data);
      // 更新参与者列表
      setParticipants((prev) => [
        ...prev,
        {
          id: `user-${data.userId}`,
          name: data.name,
          avatar: data.avatar,
          isVirtual: false,
          isMuted: data.isMuted,
          isCameraOn: data.isCameraOn,
          isHost: data.isHost,
        },
      ]);
    };

    // 监听参与者离开事件
    const handleUserLeft = (data: any) => {
      console.log("User left:", data);
      // 更新参与者列表
      setParticipants((prev) =>
        prev.filter((p) => p.id !== `user-${data.user_id}`),
      );
    };

    // 监听主机变更事件
    const handleHostChanged = (data: any) => {
      console.log("Host changed:", data);
      // 更新参与者列表中的主机信息
      setParticipants((prev) =>
        prev.map((p) => ({
          ...p,
          isHost: p.id === `user-${data.new_host_id}`,
        })),
      );
    };

    // 监听 WebSocket 错误
    const handleError = (data: any) => {
      console.error("WebSocket error:", data);
      if (data.message === "Room is full") {
        setError("房间已满，无法加入");
        setShowPermModal(false);
        setTimeout(() => {
          navigate("/rooms");
        }, 2000);
      } else if (data.message === "Room not found") {
        console.warn("WebSocket Room not found error - room may have been deleted or connection issue");
        // 不再强制用户退出房间，只记录错误
        // 因为房间可能只是暂时不可用，或者是WebSocket连接问题
      }
    };

    // 注册事件监听器
    WebSocketManager.on("room_initialized", handleRoomInitialized);
    WebSocketManager.on("user_joined", handleUserJoined);
    WebSocketManager.on("user_left", handleUserLeft);
    WebSocketManager.on("host_changed", handleHostChanged);
    WebSocketManager.on("error", handleError);

    // 初始化WebRTC客户端
    const initWebRTCClient = () => {
      const socket = WebSocketManager.socket;
      if (socket) {
        const client = new WebRTCClient({
          socket,
          roomId: roomId!,
          userId,
          onRemoteStreamAdded: handleRemoteStreamAdded,
          onRemoteStreamRemoved: handleRemoteStreamRemoved,
          onIceCandidate: handleIceCandidate,
          onOffer: handleOffer,
          onAnswer: handleAnswer,
        });
        setWebrtcClient(client);
      }
    };

    // 当WebSocket连接成功后初始化WebRTC客户端
    const handleWebSocketConnect = () => {
      initWebRTCClient();
    };

    // 注册WebSocket连接成功事件
    WebSocketManager.on("connect", handleWebSocketConnect);

    // 立即尝试初始化，如果WebSocket已经连接
    if (WebSocketManager.isConnected()) {
      initWebRTCClient();
    }

    // 清理函数
    return () => {
      WebSocketManager.off("room_initialized", handleRoomInitialized);
      WebSocketManager.off("user_joined", handleUserJoined);
      WebSocketManager.off("user_left", handleUserLeft);
      WebSocketManager.off("host_changed", handleHostChanged);
      WebSocketManager.off("connect", handleWebSocketConnect);
      WebSocketManager.off("error", handleError);

      // 关闭WebRTC客户端
      webrtcClient?.close();
    };
  }, [roomId, navigate]);

  useEffect(() => {
    const fetchLifecycle = async () => {
      setLoading(true);

      // 获取房间数据
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`/api/rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Room data fetched successfully:", data);
          setRoomData(data);
          setIsRoomValid(true);

          // 房间验证成功后，才初始化WebSocket连接
          WebSocketManager.connect(roomId);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error(
            "Failed to fetch room data:",
            response.status,
            errorData,
          );
          navigate("/rooms");
        }
      } catch (err) {
        console.error("Error fetching room:", err);
        navigate("/rooms");
      }

      // 检查权限设置
      const saved = getForRoom(roomId!);
      if (saved) {
        try {
          const stream = await requestMedia(saved);
          setLocalStream(stream);
          setResolvedPrefs({ ...saved });
          setLoading(false);
        } catch (e) {
          // 如果保存的权限失败（例如设备未连接），显示模态框
          setShowPermModal(true);
          setLoading(false);
        }
      } else {
        setShowPermModal(true);
        setLoading(false);
      }
    };

    fetchLifecycle();
  }, [roomId, navigate]);

  const handleJoin = async (opts: PermissionSaveOptions) => {
    try {
      setError(null);
      const stream = await requestMedia(opts);
      setLocalStream(stream);
      savePermissions(roomId!, opts);
      setResolvedPrefs(opts);
      setShowPermModal(false);

      // 加入房间
      await joinRoom(roomId!);

      // 使用WebSocketManager的safeJoinRoom方法安全加入房间
      WebSocketManager.safeJoinRoom(roomId!);

      // 设置本地流到WebRTC客户端
      if (webrtcClient) {
        webrtcClient.setLocalStream(stream);
      }

      // 不需要手动初始化参与者列表，会通过room_initialized事件获取
    } catch (e: any) {
      console.error("Failed to join room:", e);
      if (e.response?.data?.error) {
        setError(e.response.data.error);
        setShowPermModal(true);
      }
      throw e; // 模态框处理UI错误
    }
  };

  const handleCancel = () => {
    // 离开房间并断开连接
    WebSocketManager.disconnect();
    navigate("/rooms");
  };

  // 当组件卸载时，确保离开房间并断开WebSocket连接
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      // 使用WebSocketManager的leaveRoom方法离开房间
      WebSocketManager.leaveRoom(roomId!);

      // 调用room context的leaveRoom方法
      leaveRoom();
    };
  }, [roomId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#EFEAE2] flex flex-col items-center justify-center z-[200]">
        <div className="w-14 h-14 border-[5px] border-earth-accent/20 border-t-earth-accent rounded-full animate-spin mb-8"></div>
        <div className="text-center">
          <h2 className="text-xs font-black text-earth-text tracking-[0.4em] uppercase mb-3">
            Syncing Workspace
          </h2>
          <p className="text-earth-text-sec text-[10px] font-bold animate-pulse tracking-widest">
            TUNING FEED...
          </p>
        </div>
      </div>
    );
  }

  // 从roomData获取房间数据
  const room = roomData;
  if (!room) {
    return (
      <div className="fixed inset-0 bg-[#EFEAE2] flex flex-col items-center justify-center z-[200]">
        <h2 className="text-xl font-black text-earth-text mb-4">
          Room Not Found
        </h2>
        <Button variant="primary" onClick={() => navigate("/rooms")}>
          Back to Rooms
        </Button>
      </div>
    );
  }

  // 确定房间模式
  let mappedMode: RoomMode = "1:1-real";
  if (room.type === "1:1") {
    mappedMode = "1:1-real";
  } else if (room.type === "1:many") {
    mappedMode = "1:many-real";
  }

  return (
    <div className="fixed inset-0 bg-[#EFEAE2] z-[500] overflow-hidden">
      {error && !showPermModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md shadow-2xl">
            <div className="w-12 h-12 bg-earth-danger/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-earth-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-earth-text mb-2 text-center">
              错误
            </h3>
            <p className="text-earth-text-sec text-center mb-6">{error}</p>
            <Button variant="primary" onClick={() => navigate("/rooms")} className="w-full">
              返回房间列表
            </Button>
          </div>
        </div>
      )}

      {showPermModal && (
        <EntryPermissionModal
          roomId={roomId!}
          onJoin={handleJoin}
          onCancel={handleCancel}
        />
      )}

      {/* Only render RoomLayout if modal is hidden OR we have a fallback resolution */}
      {!showPermModal && room && !error && (
        <RoomLayout
          mode={mappedMode}
          participants={participants}
          initialStream={localStream}
          remoteStreams={remoteStreams}
          initialCam={resolvedPrefs?.camera}
          initialMic={resolvedPrefs?.mic}
          initialTasks={resolvedPrefs?.initialTasks}
        />
      )}
    </div>
  );
};
