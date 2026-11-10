import React, { useState, useRef, useEffect } from "react";
import { Badge, Button } from "../Common";
import { usePoints } from "../../hooks/usePoints";
import { GoogleGenAI, Type } from "@google/genai";

interface Message {
  id: string;
  user: string;
  text: string;
  type: "chat" | "task";
  timestamp: Date;
  completed?: boolean;
  avatar?: string;
  userId?: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  initialTasks?: string[];
  focusMode?: "chat" | "tasks";
  webrtcClient?: any;
  currentUserId?: string;
  userName?: string;
  userAvatar?: string;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  initialTasks = [],
  focusMode = "chat",
  webrtcClient,
  currentUserId,
  userName = "Me",
  userAvatar = "",
}) => {
  const { awardPoints } = usePoints();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [msgType, setMsgType] = useState<"chat" | "task">(
    focusMode === "tasks" ? "task" : "chat",
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [userMap, setUserMap] = useState<
    Record<string, { name: string; avatar: string }>
  >({});

  useEffect(() => {
    // 只有在messages数组为空时才初始化任务消息，避免覆盖现有的聊天消息
    if (messages.length === 0 && initialTasks.length > 0) {
      const taskMsgs: Message[] = initialTasks.map((taskText, i) => ({
        id: `init-task-${i}`,
        user: "Me",
        text: taskText,
        type: "task",
        timestamp: new Date(),
        completed: false,
      }));
      setMessages([...taskMsgs]);
    }
  }, [initialTasks, messages.length]);

  useEffect(() => {
    if (webrtcClient) {
      // 定义消息处理函数
      const handleMessage = (
        userId: string,
        message: string,
        username?: string,
      ) => {
        // 跳过自己发送的消息（因为已经在sendMessage中添加了）
        if (userId === currentUserId) {
          return;
        }

        // 获取或生成用户头像
        const avatar = `https://picsum.photos/seed/${userId}/100/100`;
        const name = username || `User_${userId}`;

        // 更新用户映射
        setUserMap((prev) => {
          if (!prev[userId]) {
            return {
              ...prev,
              [userId]: { name, avatar },
            };
          }
          return prev;
        });

        const newMessage: Message = {
          id: `${Date.now()}-${userId}-${Math.random().toString(36).substr(2, 9)}`,
          user: name,
          text: message,
          type: "chat",
          timestamp: new Date(),
          avatar: avatar,
          userId: userId,
        };

        // 添加消息到列表
        setMessages((prev) => [...prev, newMessage]);

        // 滚动到底部
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, 100);
      };

      // 设置消息回调
      webrtcClient.setOnMessage(handleMessage);
    }
  }, [webrtcClient, currentUserId]);

  const generateTasksWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiProcessing(true);
    try {
      // 模拟 AI 响应，避免 API 密钥错误
      const mockTasks = ["完成当前学习任务", "休息 5 分钟", "复习今天所学内容"];
      const newTasks: Message[] = mockTasks.map((t, i) => ({
        id: `ai-task-${Date.now()}-${i}`,
        user: "AI Assistant",
        text: t,
        type: "task",
        timestamp: new Date(),
        completed: false,
      }));

      setMessages((prev) => [...prev, ...newTasks]);
      setShowAiInput(false);
      setAiPrompt("");
    } catch (e) {
      console.error(e);
      alert("AI interpretation failed. Please try a simpler description.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    if (msgType === "chat" && webrtcClient) {
      // 通过 WebRTC 发送聊天消息（只发送一次）
      webrtcClient.sendMessage(input);
    }

    const newMessage: Message = {
      id: `${Date.now()}-${currentUserId}-send`,
      user: userName,
      text: input,
      type: msgType,
      timestamp: new Date(),
      completed: false,
      avatar: userAvatar,
      userId: currentUserId,
    };

    // 添加消息到列表
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // 滚动到底部
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  const toggleTask = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          if (!m.completed) awardPoints(0.5);
          return { ...m, completed: !m.completed };
        }
        return m;
      }),
    );
  };

  const pinnedTasks = messages.filter((m) => m.type === "task");
  const chatFlow = messages.filter((m) => m.type === "chat");

  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 right-0 w-full md:w-[320px] bg-white border-l border-earth-border flex flex-col animate-in slide-in-from-right duration-500 z-50 shadow-2xl">
      <div className="p-5 border-b border-earth-border flex justify-between items-center bg-earth-bg/50">
        <h3 className="text-xs font-black text-earth-text uppercase tracking-[0.2em]">
          Session Hub
        </h3>
        <button
          onClick={onClose}
          className="text-earth-text-sec hover:text-earth-danger p-1"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" />
          </svg>
        </button>
      </div>

      <div className="p-4 bg-earth-accent/5 border-b border-earth-accent/10">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[10px] font-black text-earth-accent uppercase tracking-widest">
            Active Goals
          </p>
          <button
            onClick={() => setShowAiInput(!showAiInput)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-earth-accent/30 rounded-full text-[9px] font-black text-earth-accent uppercase hover:bg-earth-accent hover:text-white transition-all shadow-sm"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L14.5 9H22L16 14L18.5 21L12 17L5.5 21L8 14L2 9H9.5L12 2Z" />
            </svg>
            AI Plan
          </button>
        </div>

        {showAiInput && (
          <div className="mb-4 space-y-2 animate-in slide-in-from-top-2">
            <textarea
              placeholder="What's on your agenda today? Just type naturally..."
              className="w-full bg-white border border-earth-accent/20 rounded-xl p-3 text-xs leading-relaxed outline-none focus:border-earth-accent transition-all min-h-[80px] resize-none"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <Button
              className="w-full h-10 text-[10px] font-black uppercase tracking-widest"
              onClick={generateTasksWithAI}
              isLoading={isAiProcessing}
              disabled={!aiPrompt.trim()}
            >
              Parse into tasks
            </Button>
          </div>
        )}

        <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
          {pinnedTasks.map((t) => (
            <div
              key={t.id}
              className={`flex items-center gap-3 bg-white p-3 rounded-xl border transition-all ${t.completed ? "opacity-40 border-earth-success/30" : "border-earth-accent/10 shadow-sm"}`}
            >
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleTask(t.id)}
                className="w-4 h-4 accent-earth-accent cursor-pointer rounded"
              />
              <p
                className={`text-xs text-earth-text font-bold leading-relaxed flex-1 ${t.completed ? "line-through text-earth-text-sec" : ""}`}
              >
                {t.text}
              </p>
            </div>
          ))}
          {pinnedTasks.length === 0 && !showAiInput && (
            <div className="py-8 text-center opacity-30 italic text-[10px] uppercase tracking-widest">
              No goals set
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide bg-[#FCFAF7]">
        {chatFlow.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.user === userName ? "justify-end" : "justify-start"}`}
          >
            {m.user !== userName && m.avatar && (
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                <img
                  src={m.avatar}
                  alt={m.user}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-col max-w-[80%]">
              {m.user !== userName && (
                <span className="text-xs text-earth-text-sec mb-1 ml-1">
                  {m.user}
                </span>
              )}
              <div
                className={`p-3.5 rounded-2xl text-[12px] leading-relaxed shadow-sm ${
                  m.user === userName
                    ? "bg-earth-accent text-white rounded-tr-none"
                    : "bg-white border border-earth-border rounded-tl-none text-earth-text"
                }`}
              >
                {m.text}
              </div>
              <span
                className={`text-[10px] text-earth-text-sec mt-1 ${
                  m.user === userName ? "text-right mr-1" : "ml-1"
                }`}
              >
                {m.timestamp.toLocaleTimeString()}
              </span>
            </div>
            {m.user === userName && m.avatar && (
              <div className="w-8 h-8 rounded-full overflow-hidden ml-2 flex-shrink-0">
                <img
                  src={m.avatar}
                  alt={m.user}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-earth-border">
        <div className="flex bg-earth-bg rounded-lg p-1 border border-earth-border mb-3">
          {(["chat", "task"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMsgType(type)}
              className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all ${msgType === type ? "bg-white text-earth-accent shadow-sm" : "text-earth-text-sec"}`}
            >
              {type === "chat" ? "Message" : "New Goal"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={
              msgType === "task" ? "Add a goal..." : "Type a message..."
            }
            className="flex-1 bg-earth-bg border border-earth-border rounded-xl px-4 py-2 text-sm focus:border-earth-accent outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="w-10 h-10 bg-earth-accent text-white rounded-xl shadow-lg flex items-center justify-center"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2.5" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};
