
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import { Button } from '../Common';
import { useNavigate } from 'react-router-dom';

interface ChatWindowProps {
  friendId: string;
  friendName: string;
  friendAvatar?: string;
  messages: ChatMessage[];
  onClose: () => void;
  onSend: (text: string, type?: ChatMessage['type'], roomId?: string, fileUrl?: string, fileName?: string) => void;
  onAcceptRequest?: (userId: string) => void;
  inline?: boolean;
}

const EMOJIS = ['😊', '📚', '🔥', '💡', '✅', '☕', '🚀', '💪', '🌱', '🎓'];

export const ChatWindow: React.FC<ChatWindowProps> = ({ friendId, friendName, friendAvatar, messages, onClose, onSend, onAcceptRequest, inline = false }) => {
  const [input, setInput] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onSend(`Sent a file: ${file.name}`, 'file', undefined, url, file.name);
    }
  };

  const handleStudyInvite = () => {
    onSend(`Hey ${friendName}, join my focus session! 📚`, 'invite', 'r1');
  };

  const addEmoji = (emoji: string) => {
    setInput(prev => prev + emoji);
    setShowEmojis(false);
  };

  const content = (
    <div 
      className={`bg-white overflow-hidden flex flex-col ${inline ? 'h-full w-full' : 'relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl h-[80vh] sm:h-[600px] animate-in slide-in-from-bottom-10'}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className={`px-8 pt-8 pb-6 border-earth-border flex justify-between items-center ${inline ? 'bg-white' : 'bg-earth-bg/30'}`}>
         <div className="flex items-center gap-4">
            <div className="relative">
              <img src={friendAvatar || `https://picsum.photos/seed/${friendId}/100/100`} className="w-12 h-12 rounded-full border-2 border-white shadow-md" alt="" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-earth-success rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-earth-text tracking-tighter leading-none">{friendName}</h3>
              <p className="text-[10px] font-black text-earth-accent uppercase tracking-[0.2em] mt-1.5 opacity-80">Scholar Partner</p>
            </div>
         </div>
         <div className="flex items-center gap-2">
            {inline ? (
               <button onClick={onClose} className="text-earth-text-sec hover:text-earth-danger p-2 rounded-full hover:bg-earth-bg transition-all" title="Close Chat">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
               </button>
            ) : (
              <button onClick={onClose} className="text-earth-text-sec hover:text-earth-danger p-2 rounded-full hover:bg-earth-card transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            )}
         </div>
      </div>

      {/* Message area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 pb-8 space-y-6 scrollbar-hide bg-[#FCFAF7] border-t border-earth-border/30">
         <div className="pt-6">
           {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col mb-6 ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
                 <div className={`px-5 py-3.5 rounded-3xl text-[14px] max-w-[85%] shadow-sm leading-relaxed ${
                    msg.senderId === 'me' 
                      ? 'bg-earth-accent text-white rounded-tr-none' 
                      : 'bg-white border border-earth-border rounded-tl-none text-earth-text'
                 }`}>
                    {msg.type === 'friend_request' ? (
                       <div className="space-y-4 min-w-[200px]">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-earth-accent">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                             Friend Request
                          </div>
                          <p className="text-[13px] font-medium leading-normal">{msg.text}</p>
                          {msg.senderId !== 'me' && (
                             <div className="flex gap-2">
                                <button 
                                  onClick={() => onAcceptRequest?.(friendId)}
                                  className="flex-1 py-2 bg-earth-accent text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-earth-accent-hover transition-all"
                                >
                                  Accept
                                </button>
                                <button className="flex-1 py-2 bg-earth-bg text-earth-text-sec text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-earth-border transition-all">
                                  Decline
                                </button>
                             </div>
                          )}
                          {msg.senderId === 'me' && (
                             <p className="text-[10px] italic opacity-60">Request sent. Waiting for response...</p>
                          )}
                       </div>
                    ) : msg.type === 'invite' ? (
                       <div className="space-y-4 min-w-[180px]">
                          <p className="font-black flex items-center gap-2 text-[10px] uppercase tracking-widest">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                            Live Invitation
                          </p>
                          <p className="text-[12px] opacity-90">{msg.text}</p>
                          <Button 
                            variant="secondary" 
                            className="w-full py-2 text-[10px] font-black uppercase tracking-widest bg-white text-earth-accent border-none hover:bg-earth-bg"
                            onClick={() => navigate(`/room/${msg.roomId}`)}
                          >
                            Join Session
                          </Button>
                       </div>
                    ) : msg.type === 'file' ? (
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth="2.5"/></svg>
                         </div>
                         <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{msg.fileName}</p>
                            <a href={msg.fileUrl} download={msg.fileName} className="text-[9px] font-black uppercase tracking-[0.1em] opacity-60 hover:opacity-100 hover:underline">Download</a>
                         </div>
                      </div>
                    ) : (
                       msg.text
                    )}
                 </div>
                 <span className="text-[8px] font-black text-earth-text-sec mt-2 px-1 uppercase tracking-wider opacity-40">{msg.timestamp}</span>
              </div>
           ))}
         </div>
      </div>

      {/* Emoji Bar */}
      {showEmojis && (
        <div className="px-8 py-4 border-t border-earth-border flex gap-4 animate-in slide-in-from-bottom-2 duration-300 bg-white">
          {EMOJIS.map(e => (
            <button key={e} onClick={() => addEmoji(e)} className="text-2xl hover:scale-125 transition-transform">{e}</button>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="p-6 border-t border-earth-border bg-white space-y-4">
         <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 py-2 text-[10px] font-black uppercase tracking-[0.2em] border-earth-border text-earth-text-sec hover:border-earth-accent hover:text-earth-accent hover:bg-earth-accent/5 h-auto rounded-xl"
              onClick={handleStudyInvite}
            >
              Study Invite
            </Button>
            <Button 
              variant="ghost"
              className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] h-auto rounded-xl hover:bg-earth-bg"
              onClick={() => fileInputRef.current?.click()}
            >
              Attach
            </Button>
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
         </div>
         <div className="flex gap-3">
            <button 
              onClick={() => setShowEmojis(!showEmojis)}
              className={`text-earth-text-sec hover:text-earth-accent p-2 transition-all ${showEmojis ? 'text-earth-accent scale-110' : ''}`}
            >
               <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 21a9 9 0 100-18 9 9 0 000 18z"/><path d="M14.828 14.828a4 4 0 01-5.656 0" strokeWidth="2.5" strokeLinecap="round" /></svg>
            </button>
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="w-full bg-earth-bg border border-earth-border rounded-2xl px-5 py-3 text-sm focus:border-earth-accent outline-none transition-all"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
            </div>
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-11 h-11 bg-earth-accent text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
         </div>
      </div>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      {content}
    </div>
  );
};
