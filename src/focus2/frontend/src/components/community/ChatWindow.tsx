import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../utils/types';

interface ChatWindowProps {
  inline?: boolean;
  friendId: string;
  friendName: string;
  messages: ChatMessage[];
  onClose: () => void;
  onAcceptRequest: (uid: string) => void;
  onSend: (txt: string, type: 'text' | 'image' | 'task', rid?: string, furl?: string, fname?: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  inline = false, 
  friendId, 
  friendName, 
  messages, 
  onClose, 
  onAcceptRequest, 
  onSend 
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim(), 'text');
      setInput('');
    }
  };

  if (!inline) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in" onClick={onClose}></div>
        <div className="relative bg-white w-full max-w-2xl h-[80vh] rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-earth-border bg-earth-bg/20">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="p-2 hover:bg-earth-card rounded-full text-earth-text-sec">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" /></svg>
              </button>
              <h2 className="text-xl font-black text-earth-text tracking-tighter">{friendName}</h2>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.senderId === friendId ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[70%] p-4 rounded-2xl ${msg.senderId === friendId ? 'bg-earth-card text-earth-text' : 'bg-earth-accent text-white'}`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-[9px] font-black uppercase mt-1 opacity-60 tracking-widest">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-earth-border">
            <div className="flex items-center gap-3">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-earth-bg border-2 border-earth-border rounded-2xl px-6 py-3 text-sm font-bold focus:border-earth-accent outline-none"
              />
              <button 
                onClick={handleSend}
                className="w-12 h-12 bg-earth-accent rounded-2xl flex items-center justify-center text-white hover:bg-earth-accent-hover transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeWidth="2" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-earth-border bg-earth-bg/20">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-earth-text tracking-tighter">{friendName}</h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.senderId === friendId ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[70%] p-4 rounded-2xl ${msg.senderId === friendId ? 'bg-earth-card text-earth-text' : 'bg-earth-accent text-white'}`}>
              <p className="text-sm">{msg.text}</p>
              <p className="text-[9px] font-black uppercase mt-1 opacity-60 tracking-widest">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-earth-border">
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-earth-bg border-2 border-earth-border rounded-2xl px-6 py-3 text-sm font-bold focus:border-earth-accent outline-none"
          />
          <button 
            onClick={handleSend}
            className="w-12 h-12 bg-earth-accent rounded-2xl flex items-center justify-center text-white hover:bg-earth-accent-hover transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeWidth="2" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};