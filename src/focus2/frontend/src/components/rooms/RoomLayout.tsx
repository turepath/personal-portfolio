import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DuoLayout } from "./DuoLayout";
import { GroupGridLayout } from "./GroupGridLayout";
import { GroupRingLayout } from "./GroupRingLayout";
import { ChatSidebar } from "./ChatSidebar";
import { TimerControl } from "./TimerControl";
import { ModeSwitcher } from "./ModeSwitcher";
import { ControlsBar } from "./ControlsBar";
import { Badge, Button, Modal } from "../Common";
import { VideoPane } from "./VideoPane";
import { AIEntityView } from "./AIEntityView";
import { AICharacterId } from "../../utils/types";
import { useGeminiLive } from "../../hooks/useGeminiLive";
import apiClient from "../../services/index";

export type RoomMode =
  | "1:1-virtual"
  | "1:1-real"
  | "1:many-virtual"
  | "1:many-real"
  | "1:1-special"
  | "1:ai";

interface RoomLayoutProps {
  mode: RoomMode;
  participants: any[];
  initialStream?: MediaStream | null;
  initialCam?: boolean;
  initialMic?: boolean;
  initialTasks?: string[];
  sessionDuration?: number;
  aiCharacter?: AICharacterId;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  webrtcClient?: any;
}

const AI_CHARACTERS: {
  id: AICharacterId;
  name: string;
  desc: string;
  icon: string;
}[] = [
  { id: "lin_xia", name: "林晓", desc: "都市学霸", icon: "👩‍🏫" },
  { id: "chen_mo", name: "陈默", desc: "职场精英", icon: "👨‍💻" },
  { id: "su_he", name: "苏禾", desc: "文艺创作者", icon: "🎨" },
];

export const RoomLayout: React.FC<RoomLayoutProps> = ({
  mode,
  participants,
  initialStream,
  initialCam = true,
  initialMic = true,
  initialTasks = [],
  sessionDuration = 25,
  aiCharacter = "lin_xia",
  userId = "",
  userName = "User",
  userAvatar = "",
  webrtcClient,
}) => {
  const navigate = useNavigate();
  const { id: roomId } = useParams();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [privacyMode, setPrivacyMode] = useState<"real" | "mask" | "avatar">(
    "real",
  );
  const [isMicOn, setIsMicOn] = useState(initialMic);
  const [isCamOn, setIsCamOn] = useState(initialCam);
  const [timeLeft, setTimeLeft] = useState(sessionDuration * 60);
  const [localStream, setLocalStream] = useState<MediaStream | null>(
    initialStream || null,
  );
  const [myEmoji, setMyEmoji] = useState("🧐");
  const [bgId, setBgId] = useState("minimal");
  const [isCreator, setIsCreator] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(userId);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map(),
  );

  // AI 状态
  const [activeAi, setActiveAi] = useState<AICharacterId>(aiCharacter);
  const [isDualAi, setIsDualAi] = useState(false);
  const [aiHistory, setAiHistory] = useState<
    { role: "user" | "bot"; text: string }[]
  >([]);
  const [showAiSelector, setShowAiSelector] = useState(false);

  // 处理远程流添加
  useEffect(() => {
    if (webrtcClient) {
      // 保存现有的回调函数
      const originalOnStreamAdded = (webrtcClient as any).onStreamAdded;
      const originalOnStreamRemoved = (webrtcClient as any).onStreamRemoved;

      webrtcClient.setOnStreamAdded((userId: string, stream: MediaStream) => {
        setRemoteStreams((prev) => new Map(prev.set(userId, stream)));
        // 调用原始回调函数
        if (originalOnStreamAdded) {
          originalOnStreamAdded(userId, stream);
        }
      });

      webrtcClient.setOnStreamRemoved((userId: string) => {
        setRemoteStreams((prev) => {
          const newStreams = new Map(prev);
          newStreams.delete(userId);
          return newStreams;
        });
        // 调用原始回调函数
        if (originalOnStreamRemoved) {
          originalOnStreamRemoved(userId);
        }
      });
    }
  }, [webrtcClient]);

  // 映射角色语音
  const voiceMap: Record<AICharacterId, string> = {
    lin_xia: "Kore",
    chen_mo: "Charon",
    su_he: "Zephyr",
  };

  const handleTranscription = useCallback(
    (text: string, role: "user" | "bot", isFinal: boolean) => {
      setAiHistory((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === role) {
          const next = [...prev];
          next[next.length - 1] = { role, text };
          return next;
        }
        return [...prev.slice(-10), { role, text }];
      });
    },
    [],
  );

  const systemInstruction = useMemo(() => {
    const char = AI_CHARACTERS.find((c) => c.id === activeAi);
    return `You are ${char?.name || "an AI study partner"}, described as ${char?.desc || "a helpful companion"}. You are study partners in a focus room. Be encouraging, concise, and focused. If another AI is present, you can debate study methods or encourage each other.`;
  }, [activeAi]);

  const {
    isActive: isLiveActive,
    isAiSpeaking,
    connect,
    disconnect,
  } = useGeminiLive({
    voiceName: voiceMap[activeAi],
    systemInstruction,
    onTranscriptionUpdate: handleTranscription,
  });

  const toggleLive = () => {
    if (isLiveActive) disconnect();
    else connect();
  };

  // Switch AI and reconnect if session is active
  const switchAi = async (id: AICharacterId) => {
    const wasActive = isLiveActive;
    if (wasActive) disconnect();
    setActiveAi(id);
    setShowAiSelector(false);
    // Auto reconnect if it was active to make switching seamless
    if (wasActive) {
      setTimeout(() => connect(), 300);
    }
  };

  useEffect(() => {
    const timer = setInterval(
      () => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)),
      1000,
    );
    return () => {
      clearInterval(timer);
      disconnect();
    };
  }, [disconnect]);

  useEffect(() => {
    const fetchUserAndRoomInfo = async () => {
      try {
        // 获取当前用户信息
        const userResponse = await apiClient.get("/api/auth/me");
        const userId = userResponse.data.id;
        setCurrentUserId(userId);

        // 获取房间信息
        const roomsResponse = await apiClient.get("/api/rooms");
        const room = roomsResponse.data.items.find((r: any) => r.id === roomId);

        if (room && Number(room.createdBy) === Number(userId)) {
          setIsCreator(true);
        }
      } catch (err) {
        console.error("Error fetching user or room info:", err);
      }
    };

    fetchUserAndRoomInfo();
  }, [roomId]);

  const handleLeave = () => {
    if (isCreator) {
      // 显示删除确认弹窗
      setShowDeleteModal(true);
    } else {
      // 普通用户直接离开房间
      cleanupResources();
      navigate("/rooms");
    }
  };

  const handleDeleteRoom = async () => {
    try {
      // 发送DELETE请求删除房间
      await apiClient.delete(`/api/rooms/${roomId}`);

      // 清理资源并导航回房间列表
      cleanupResources();
      navigate("/rooms");
    } catch (err) {
      console.error("Error deleting room:", err);
    }
  };

  const cleanupResources = () => {
    // 停止本地流的所有轨道（摄像头和麦克风）
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    // 关闭WebRTC连接
    if (webrtcClient) {
      try {
        webrtcClient.leaveRoom();
      } catch (error) {
        console.error("Error disconnecting WebRTC:", error);
      }
    }

    // 断开AI语音连接
    disconnect();
  };

  const renderContent = () => {
    if (mode === "1:ai") {
      return (
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 w-full max-w-7xl h-full max-h-[80vh] items-center justify-center p-6 md:p-10">
          {/* 用户端 */}
          {!isDualAi && (
            <div className="w-full h-full flex items-center justify-center animate-in fade-in slide-in-from-left-10 duration-700">
              <VideoPane
                id="me"
                name="Alex"
                isMe
                isVirtual={privacyMode === "avatar"}
                isMasked={privacyMode === "mask"}
                virtualEmoji={myEmoji}
                stream={localStream}
                onEnlarge={() => {}}
                isEnlarged={true}
              />
            </div>
          )}

          {/* AI端 */}
          <div
            className={`grid ${isDualAi ? "grid-cols-2" : "grid-cols-1"} gap-6 w-full h-full flex-1`}
          >
            <div className="w-full h-full flex items-center justify-center transition-all duration-500">
              <AIEntityView
                characterId={activeAi}
                isAiSpeaking={isAiSpeaking}
                isUserSpeaking={isMicOn}
              />
            </div>
            {isDualAi && (
              <div className="w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-1000">
                <AIEntityView
                  characterId={activeAi === "lin_xia" ? "chen_mo" : "lin_xia"}
                  isAiSpeaking={false}
                />
              </div>
            )}
          </div>

          {/* AI 控制台面板 */}
          <div className="absolute top-24 right-10 flex flex-col items-end gap-4 pointer-events-auto">
            <div className="bg-white/10 backdrop-blur-xl p-4 rounded-[2.5rem] border border-white/20 flex flex-col gap-4 shadow-2xl">
              <button
                onClick={toggleLive}
                title={isLiveActive ? "Stop Voice" : "Start Voice"}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isLiveActive ? "bg-earth-success text-white shadow-lg ring-4 ring-earth-success/20" : "bg-white/20 text-white/60 hover:text-white"}`}
              >
                <i
                  className={`fas ${isLiveActive ? "fa-phone-slash" : "fa-microphone-lines"} text-xl`}
                ></i>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowAiSelector(!showAiSelector)}
                  title="Change Character"
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${showAiSelector ? "bg-white text-earth-accent" : "bg-white/20 text-white/60 hover:text-white"}`}
                >
                  <i className="fas fa-user-circle text-xl"></i>
                </button>

                {showAiSelector && (
                  <div className="absolute right-full mr-4 top-0 bg-white/95 backdrop-blur-2xl border border-earth-border rounded-[2.5rem] p-4 shadow-2xl animate-in slide-in-from-right-2 fade-in duration-300 min-w-[200px] flex flex-col gap-2">
                    <p className="text-[9px] font-black text-earth-text/40 uppercase tracking-widest px-4 mb-2">
                      Switch Partner
                    </p>
                    {AI_CHARACTERS.map((char) => (
                      <button
                        key={char.id}
                        onClick={() => switchAi(char.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeAi === char.id ? "bg-earth-accent text-white shadow-md" : "hover:bg-earth-accent/10 text-earth-text"}`}
                      >
                        <span className="text-xl">{char.icon}</span>
                        <div className="text-left">
                          <p
                            className={`text-xs font-black ${activeAi === char.id ? "text-white" : "text-earth-text"}`}
                          >
                            {char.name}
                          </p>
                          <p
                            className={`text-[9px] font-bold opacity-60 ${activeAi === char.id ? "text-white/80" : "text-earth-text-sec"}`}
                          >
                            {char.desc}
                          </p>
                        </div>
                        {activeAi === char.id && (
                          <i className="fas fa-check ml-auto text-[10px]"></i>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsDualAi(!isDualAi)}
                title={isDualAi ? "Solo Mode" : "Dual AI Mode"}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isDualAi ? "bg-indigo-500 text-white shadow-lg" : "bg-white/20 text-white/60 hover:text-white"}`}
              >
                <i className="fas fa-user-group text-xl"></i>
              </button>
            </div>
          </div>

          {/* 实时转写浮窗 */}
          {aiHistory.length > 0 && (
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-xl animate-in slide-in-from-bottom-5">
              <div className="bg-black/40 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/10 text-center">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">
                  {aiHistory[aiHistory.length - 1].role.toUpperCase()}
                </p>
                <p className="text-white font-bold text-sm leading-relaxed line-clamp-2 italic">
                  "{aiHistory[aiHistory.length - 1].text}"
                </p>
              </div>
            </div>
          )}
        </div>
      );
    }

    const commonProps = {
      localStream,
      isVirtualActive: privacyMode === "avatar",
      isMaskActive: privacyMode === "mask",
      localEmoji: myEmoji,
      participants,
      remoteStreams,
      currentUserId,
    };
    if (mode === "1:1-virtual" || mode === "1:1-real" || mode === "1:1-special")
      return <DuoLayout {...commonProps} />;
    return <GroupGridLayout {...commonProps} />;
  };

  return (
    <div
      className={`fixed inset-0 flex flex-col transition-all duration-1000 overflow-hidden ${bgId === "minimal" ? "bg-[#EFEAE2]" : ""}`}
    >
      <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-[60] pointer-events-none">
        <button
          onClick={handleLeave}
          className="pointer-events-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-earth-text-sec hover:text-earth-accent"
        >
          <i className="fas fa-chevron-left mr-2"></i>{" "}
          {isCreator ? "Delete Room" : "Exit"}
        </button>
        <div className="pointer-events-auto">
          <TimerControl
            seconds={timeLeft}
            onPresetSelect={(m) => setTimeLeft(m * 60)}
          />
        </div>
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <Badge color="accent">Room: {roomId}</Badge>
          {isLiveActive && (
            <div className="flex items-center gap-2 px-3 py-1 bg-earth-success text-white rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">
              <i className="fas fa-bolt"></i> Live Conversation
            </div>
          )}
        </div>
      </header>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
      >
        <div className="text-center p-4">
          <p className="text-earth-text-sec mb-6">
            Are you sure you want to delete this room?
          </p>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteRoom}
              className="flex-1 bg-earth-danger hover:bg-earth-danger/80"
            >
              Delete Room
            </Button>
          </div>
        </div>
      </Modal>

      <main className="flex-1 flex items-center justify-center p-6 relative">
        <div
          className={`w-full h-full max-w-[1600px] flex items-center justify-center transition-all duration-700 ${isChatOpen || isTasksOpen ? "pr-[340px]" : ""}`}
        >
          {renderContent()}
        </div>
      </main>

      <ControlsBar
        isMicOn={isMicOn}
        onMicToggle={() => setIsMicOn(!isMicOn)}
        isCamOn={isCamOn}
        onCamToggle={() => setIsCamOn(!isCamOn)}
        isVirtualAllowed={true}
        isVirtualActive={privacyMode !== "real"}
        privacyMode={privacyMode}
        onVirtualToggle={() =>
          setPrivacyMode((p) =>
            p === "real" ? "mask" : p === "mask" ? "avatar" : "real",
          )
        }
        isChatOpen={isChatOpen}
        onChatToggle={() => setIsChatOpen(!isChatOpen)}
        isTasksOpen={isTasksOpen}
        onTasksToggle={() => setIsTasksOpen(!isTasksOpen)}
        onLeave={handleLeave}
        currentEmoji={myEmoji}
        onEmojiChange={setMyEmoji}
        isCreator={isCreator}
      />

      <ChatSidebar
        isOpen={isChatOpen || isTasksOpen}
        onClose={() => {
          setIsChatOpen(false);
          setIsTasksOpen(false);
        }}
        initialTasks={initialTasks}
        focusMode={isTasksOpen ? "tasks" : "chat"}
        webrtcClient={webrtcClient}
        currentUserId={currentUserId}
        userName={userName}
        userAvatar={userAvatar}
      />
    </div>
  );
};
