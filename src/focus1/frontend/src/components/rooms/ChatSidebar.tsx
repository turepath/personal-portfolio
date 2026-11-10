import React, { useState, useEffect, useRef } from "react";
import WebSocketManager from "../../utils/WebSocketManager";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  initialTasks?: string[];
  focusMode: "chat" | "tasks";
}

interface Message {
  user_id: string;
  username: string;
  message: string;
  timestamp: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  initialTasks = [],
  focusMode,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取必要的信息
  const roomId = WebSocketManager.getCurrentRoomId();
  const userId = localStorage.getItem("user_id") || "";
  const username = localStorage.getItem("username") || `User_${userId}`;

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 监听聊天消息
  useEffect(() => {
    const handleNewMessage = (data: Message) => {
      setMessages((prev) => [...prev, data]);
    };

    WebSocketManager.on("new_message", handleNewMessage);

    return () => {
      WebSocketManager.off("new_message", handleNewMessage);
    };
  }, []);

  // 发送消息
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputMessage.trim() && roomId && username) {
      // 发送消息到服务器
      WebSocketManager.sendMessage(roomId, inputMessage.trim());

      // 清空输入框
      setInputMessage("");
    }
  };

  // 新消息时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="chat-sidebar">
      <div className="chat-header">
        <h3>{focusMode === "chat" ? "聊天" : "任务"}</h3>
        <button onClick={onClose} className="close-button">
          ×
        </button>
      </div>

      {focusMode === "chat" ? (
        <>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.user_id === userId ? "own-message" : "other-message"}`}
              >
                <div className="message-header">
                  <span className="message-sender">{msg.username}</span>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-content">{msg.message}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="chat-input-form">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="输入消息..."
              className="chat-input"
            />
            <button type="submit" className="chat-send-button">
              发送
            </button>
          </form>
        </>
      ) : (
        <div className="tasks-container">
          <div className="tasks-list">
            {initialTasks.map((task, index) => (
              <div key={index} className="task-item">
                <input type="checkbox" className="task-checkbox" />
                <span className="task-text">{task}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
