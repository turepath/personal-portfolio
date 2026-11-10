import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { RoomLayout, RoomMode } from "../components/rooms/RoomLayout";
import { EntryPermissionModal } from "../components/rooms/EntryPermissionModal";
import {
  useEntryPermissions,
  PermissionSaveOptions,
} from "../hooks/useEntryPermissions";
import WebRTCClient from "../utils/WebRTCClient";
import apiClient from "../services/index";

export const RoomPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // 获取导航 state
  const { getForRoom, savePermissions, requestMedia } = useEntryPermissions();

  const [loading, setLoading] = useState(true);
  const [showPermModal, setShowPermModal] = useState(false);
  const [roomData, setRoomData] = useState<any>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [resolvedPrefs, setResolvedPrefs] =
    useState<PermissionSaveOptions | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");

  const [webrtcClient, setWebrtcClient] = useState<WebRTCClient | null>(null);

  // 从路由 state 中尝试获取时长，如果没有则默认为 25
  const customDuration = location.state?.duration;

  useEffect(() => {
    const fetchLifecycle = async () => {
      setLoading(true);

      try {
        // 获取用户信息
        const userResponse = await apiClient.get("/api/auth/me");
        const userData = userResponse.data;
        setUserId(userData.id);
        setUserName(userData.username || `User_${userData.id}`);
        setUserAvatar(
          userData.avatar ||
            `https://picsum.photos/seed/${userData.id}/400/400`,
        );

        // 获取房间信息
        const roomResponse = await apiClient.get(`/api/rooms/${id}`);
        const room = roomResponse.data;

        let mappedMode: RoomMode = "1:1-virtual";
        if (room.type === "1:ai" || room.id === "r_ai") mappedMode = "1:ai";
        else if (room.id === "r5") mappedMode = "1:1-special";
        else if (room.type === "1:1")
          mappedMode = room.virtualAllowed ? "1:1-virtual" : "1:1-real";
        else if (room.type === "1:many")
          mappedMode = room.virtualAllowed ? "1:many-virtual" : "1:many-real";

        setRoomData({ ...room, mappedMode });

        const saved = getForRoom(id!);
        if (saved) {
          try {
            const stream = await requestMedia(saved);
            setLocalStream(stream);
            setResolvedPrefs({ ...saved });
            setLoading(false);
            // 初始化 WebRTC 连接，直接使用 userData.id
            if (stream) {
              await initWebRTC(stream, userData.id);
            }
          } catch (e) {
            setShowPermModal(true);
            setLoading(false);
          }
        } else {
          setShowPermModal(true);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching room or user data:", error);
        // Fallback for custom numeric rooms or AI
        const room = {
          id: id!,
          title: "Custom Focus Lab",
          type: "1:many",
          participants: 0,
          maxParticipants: 10,
          tags: ["custom"],
          status: "live",
          virtualAllowed: true,
          thumbnail: "https://picsum.photos/seed/custom/400/300",
          isPaid: false,
        };

        let mappedMode: RoomMode = "1:1-virtual";
        if (room.type === "1:ai" || room.id === "r_ai") mappedMode = "1:ai";
        else if (room.id === "r5") mappedMode = "1:1-special";
        else if (room.type === "1:1")
          mappedMode = room.virtualAllowed ? "1:1-virtual" : "1:1-real";
        else if (room.type === "1:many")
          mappedMode = room.virtualAllowed ? "1:many-virtual" : "1:many-real";

        setRoomData({ ...room, mappedMode });

        const saved = getForRoom(id!);
        if (saved) {
          try {
            const stream = await requestMedia(saved);
            setLocalStream(stream);
            setResolvedPrefs({ ...saved });
            setLoading(false);
          } catch (e) {
            setShowPermModal(true);
            setLoading(false);
          }
        } else {
          setShowPermModal(true);
          setLoading(false);
        }
      }
    };

    fetchLifecycle();

    // 清理函数
    return () => {
      if (webrtcClient) {
        webrtcClient.leaveRoom();
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [id]);

  const initWebRTC = async (stream: MediaStream, currentUserId?: string) => {
    try {
      const newWebrtcClient = new WebRTCClient();
      setWebrtcClient(newWebrtcClient);

      // 设置回调
      newWebrtcClient.setOnUserJoined((joinedUserId, username, avatar) => {
        // 添加新用户到参与者列表
        setParticipants((prev) => {
          if (!prev.some((p) => p.id === joinedUserId)) {
            return [
              ...prev,
              {
                id: joinedUserId,
                name: username,
                avatar: avatar,
                isVirtual: false,
                isMuted: false,
              },
            ];
          }
          return prev;
        });
      });

      newWebrtcClient.setOnUserLeft((leftUserId) => {
        // 从参与者列表中移除用户
        setParticipants((prev) => prev.filter((p) => p.id !== leftUserId));
      });

      // 远程流处理由 RoomLayout 组件负责
      // newWebrtcClient.setOnStreamAdded((userId, remoteStream) => {
      //   // 处理远程流添加
      //   console.log("Remote stream added for user:", userId);
      // });

      // newWebrtcClient.setOnStreamRemoved((userId) => {
      //   // 处理远程流移除
      //   console.log("Remote stream removed for user:", userId);
      // });

      // 消息处理由 ChatSidebar 组件负责
      // newWebrtcClient.setOnMessage((userId, message) => {
      //   // 处理收到的消息
      //   console.log("Received message from", userId, ":", message);
      // });

      newWebrtcClient.setOnError((error) => {
        // 处理错误
        console.error("WebRTC error:", error);
      });

      // 连接到 Socket.IO 服务器
      const socketUrl = ''; // 使用相对路径，通过Vite代理连接到后端服务器
      const userToUse = currentUserId || userId;
      console.log("Connecting with user ID:", userToUse);
      await newWebrtcClient.connect(socketUrl, userToUse, id!, stream);

      console.log("WebRTC client initialized successfully");
    } catch (error) {
      console.error("Error initializing WebRTC:", error);
    }
  };

  const handleJoin = async (opts: PermissionSaveOptions) => {
    try {
      const stream = await requestMedia(opts);
      setLocalStream(stream);
      savePermissions(id!, opts);
      setResolvedPrefs(opts);
      setShowPermModal(false);

      // 获取用户信息
      const userResponse = await apiClient.get("/api/auth/me");
      const userData = userResponse.data;

      // 初始化 WebRTC 连接，直接使用 userData.id
      if (stream) {
        await initWebRTC(stream, userData.id);
      }
    } catch (e) {
      throw e;
    }
  };

  const handleCancel = () => {
    navigate("/rooms");
  };

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

  return (
    <div className="fixed inset-0 bg-[#EFEAE2] z-[500] overflow-hidden">
      {showPermModal && (
        <EntryPermissionModal
          roomId={id!}
          onJoin={handleJoin}
          onCancel={handleCancel}
        />
      )}

      {!showPermModal && roomData && (
        <RoomLayout
          mode={roomData.mappedMode}
          participants={participants}
          initialStream={localStream}
          initialCam={resolvedPrefs?.camera}
          initialMic={resolvedPrefs?.mic}
          initialTasks={resolvedPrefs?.initialTasks}
          sessionDuration={customDuration || roomData.sessionDuration} // 使用传递的时长
          userId={userId}
          userName={userName}
          userAvatar={userAvatar}
          webrtcClient={webrtcClient}
        />
      )}
    </div>
  );
};
