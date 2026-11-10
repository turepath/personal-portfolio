
import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '../Common';

interface Message {
  id: string;
  user: string;
  text: string;
  type: 'chat' | 'task';
  timestamp: Date;
}

export const ChatSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', user: 'System', text: 'Welcome to the focus room. What are your goals today?', type: 'chat', timestamp: new Date() },
    { id: '2', user: 'Partner', text: 'Finish 3 React Components', type: 'task', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [msgType, setMsgType] = useState<'chat' | 'task'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);

  const pinnedTasks = messages.filter(m => m.type === 'task');
  const chatFlow = messages.filter(m => m.type === 'chat');

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      user: 'Me',
      text: input,
      type: msgType,
      timestamp: new Date()
    };
    setMessages([...messages, newMessage]);
    setInput('');
  };

  const deleteMessage = (id: string) => {
    setMessages(messages.filter(m => m.id !== id));
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 right-0 w-full md:w-[320px] bg-white border-l border-earth-border flex flex-col animate-in slide-in-from-right duration-500 z-50 shadow-2xl">
      <div className="p-5 border-b border-earth-border flex justify-between items-center bg-earth-bg/50">
        <div>
          <h3 className="text-xs font-black text-earth-text uppercase tracking-[0.2em]">Live Session Chat</h3>
        </div>
        <button onClick={onClose} className="text-earth-text-sec hover:text-earth-danger transition-colors p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* Pinned Tasks - Static area at top */}
      {pinnedTasks.length > 0 && (
        <div className="p-4 bg-earth-accent/5 border-b border-earth-accent/10">
          <p className="text-[10px] font-black text-earth-accent uppercase tracking-widest mb-3">Pinned Goals</p>
          <div className="space-y-2">
            {pinnedTasks.map(t => (
              <div key={t.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-earth-accent/10 shadow-sm transition-all hover:border-earth-accent/30 group relative">
                <div className="flex-shrink-0">
                  <input type="checkbox" className="w-4 h-4 accent-earth-accent cursor-pointer rounded" />
                </div>
                <p className="text-xs text-earth-text font-semibold leading-relaxed flex-1 pr-6">{t.text}</p>
                <button 
                  onClick={() => deleteMessage(t.id)}
                  className="absolute right-2 text-earth-text-sec opacity-0 group-hover:opacity-100 hover:text-earth-danger transition-all p-1"
                  aria-label="Delete task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Flow */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide bg-[#FCFAF7]">
        {chatFlow.map(m => (
          <div key={m.id} className={`flex flex-col ${m.user === 'Me' ? 'items-end' : 'items-start'}`}>
            <span className="text-[9px] font-bold text-earth-text-sec mb-2 uppercase tracking-tighter">{m.user}</span>
            <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed max-w-[90%] shadow-sm ${
              m.user === 'Me' 
                ? 'bg-earth-accent text-white rounded-tr-none' 
                : 'bg-white border border-earth-border rounded-tl-none text-earth-text'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-5 bg-white border-t border-earth-border shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-3">
           <div className="flex bg-earth-bg rounded-lg p-1 border border-earth-border">
              {(['chat', 'task'] as const).map(type => (
                <button 
                  key={type}
                  onClick={() => setMsgType(type)}
                  className={`flex-1 py-1 text-[10px] font-black uppercase tracking-widest rounded transition-all ${msgType === type ? 'bg-white text-earth-accent shadow-sm' : 'text-earth-text-sec'}`}
                >
                  {type}
                </button>
              ))}
           </div>
           <div className="flex gap-3">
             <input 
              type="text" 
              placeholder={msgType === 'task' ? 'Add a session goal...' : 'Type a message...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-earth-bg border border-earth-border rounded-xl px-4 py-3 text-sm focus:border-earth-accent focus:ring-1 focus:ring-earth-accent outline-none transition-all"
             />
             <button onClick={sendMessage} className="w-12 h-12 bg-earth-accent text-white rounded-xl shadow-lg hover:bg-earth-accent-hover transition-all flex items-center justify-center">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
             </button>
           </div>
        </div>
      </div>
    </aside>
  );
};
