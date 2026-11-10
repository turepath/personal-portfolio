import React, { useState, useEffect, useRef } from 'react';
import socket from '../utils/socket';

interface ChatPanelProps {
  roomId: string;
  username: string;
}

interface Message {
  username: string;
  message: string;
  timestamp: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ roomId, username }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 监听聊天消息
  useEffect(() => {
    const handleChatMessage = (data: Message) => {
      setMessages(prev => [...prev, data]);
    };

    socket.on('chat-message', handleChatMessage);

    return () => {
      socket.off('chat-message', handleChatMessage);
    };
  }, []);

  // 发送消息
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputMessage.trim() && roomId && username) {
      const messageData = {
        roomId,
        message: inputMessage.trim(),
        timestamp: new Date().toISOString()
      };

      // 发送消息到服务器
      socket.emit('chat', messageData);

      // 清空输入框
      setInputMessage('');
    }
  };

  // 新消息时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>聊天</h3>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.username === username ? 'own-message' : 'other-message'}`}>
            <div className="message-header">
              <span className="message-sender">{msg.username}</span>
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="message-content">
              {msg.message}
            </div>
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
    </div>
  );
};

export default ChatPanel;