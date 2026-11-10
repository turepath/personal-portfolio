
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGeminiChat } from '../hooks/useGeminiChat';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { Button } from './Common';

export const AICompanion: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [input, setInput] = useState('');
  
  // 语音模式专用的转写流状态，支持长串文字展示
  const [liveLog, setLiveLog] = useState<{ id: number, text: string, role: 'user' | 'bot', isFinal: boolean }[]>([]);
  const { messages, sendMessage, isTyping } = useGeminiChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const liveScrollRef = useRef<HTMLDivElement>(null);

  // 语音实时转写回调：支持长串累加展示
  const handleTranscriptionUpdate = useCallback((text: string, role: 'user' | 'bot', isFinal: boolean) => {
    setLiveLog(prev => {
      const last = prev[prev.length - 1];
      // 如果上一条是正在进行的同一角色，且尚未 Final，则更新它（实现文字在同一个气泡内实时流式增长）
      if (last && last.role === role && !last.isFinal) {
        const updated = [...prev];
        updated[updated.length - 1] = { ...last, text, isFinal };
        return updated;
      }
      // 否则创建新行
      if (!text.trim()) return prev;
      return [...prev, { id: Date.now(), text, role, isFinal }];
    });
  }, []);

  const { isActive, isAiSpeaking, volume, connect, disconnect } = useGeminiLive({
    voiceName: 'Zephyr',
    onTranscriptionUpdate: handleTranscriptionUpdate
  });

  // 自动滚动到最新消息
  useEffect(() => {
    if (liveScrollRef.current) {
      liveScrollRef.current.scrollTop = liveScrollRef.current.scrollHeight;
    }
  }, [liveLog]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput('');
  };

  const toggleLiveMode = async () => {
    if (isLiveMode) {
      disconnect();
      setIsLiveMode(false);
      setLiveLog([]);
    } else {
      setIsLiveMode(true);
      try {
        await connect();
      } catch (e) {
        setIsLiveMode(false);
      }
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-8 right-6 z-[200] flex flex-col items-end pointer-events-none">
      {isOpen && (
        <div className="pointer-events-auto mb-4 w-[340px] sm:w-[400px] h-[550px] bg-white rounded-[2.5rem] shadow-2xl border border-earth-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className={`p-5 text-white flex justify-between items-center transition-colors duration-500 ${isLiveMode ? 'bg-indigo-600' : 'bg-earth-accent'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-white/40'}`}></div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">
                {isLiveMode ? 'Voice Companion' : 'Study Buddy AI'}
              </h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-black/10 rounded-full transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          <div className="flex-1 relative flex flex-col overflow-hidden bg-[#FCFAF7]">
            {isLiveMode ? (
              <div className="flex-1 flex flex-col animate-in fade-in duration-500">
                 {/* 上部：视觉反馈 */}
                 <div className="h-44 shrink-0 flex items-center justify-center relative border-b border-indigo-50 bg-white/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/20 to-transparent"></div>
                    <div 
                      className="absolute rounded-full bg-indigo-500/5 transition-all duration-150 ease-out"
                      style={{ width: `${100 + volume}px`, height: `${100 + volume}px` }}
                    ></div>
                    
                    <div className="relative w-24 h-24 bg-white rounded-full shadow-xl border-2 border-indigo-100 flex items-center justify-center overflow-hidden">
                       {isAiSpeaking ? (
                         <div className="flex gap-1 items-end h-8">
                            {[...Array(6)].map((_, i) => (
                              <div key={i} className="w-1 bg-indigo-500 rounded-full animate-voice-bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
                            ))}
                         </div>
                       ) : (
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${volume > 5 ? 'bg-indigo-500 text-white scale-110' : 'bg-indigo-50 text-indigo-500 scale-100'}`}>
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeWidth="2.5"/></svg>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* 中部：长串聊天式日志 */}
                 <div ref={liveScrollRef} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide">
                    {liveLog.map((log) => (
                      <div key={log.id} className={`animate-in slide-in-from-bottom-2 duration-300 ${log.role === 'user' ? 'text-right' : 'text-left'}`}>
                         <div className={`inline-block max-w-[90%] px-4 py-3 rounded-2xl text-sm font-bold shadow-sm border ${
                            log.role === 'user' 
                              ? 'bg-indigo-50 border-indigo-100 text-indigo-900 rounded-tr-none' 
                              : 'bg-white border-earth-border text-earth-text rounded-tl-none'
                         }`}>
                           {log.text}{!log.isFinal && '...'}
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="p-6 bg-white border-t border-earth-border">
                    <button 
                      onClick={toggleLiveMode}
                      className="w-full py-4 bg-earth-danger/5 text-earth-danger rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-earth-danger hover:text-white transition-all shadow-sm"
                    >
                      Stop Session
                    </button>
                 </div>
              </div>
            ) : (
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                      msg.role === 'user' ? 'bg-earth-accent text-white rounded-tr-none' : 'bg-white border border-earth-border text-earth-text rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isLiveMode && (
            <div className="p-6 bg-white border-t border-earth-border flex gap-3">
              <button 
                onClick={toggleLiveMode}
                className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"
              >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeWidth="2.5"/></svg>
              </button>
              <div className="flex-1 flex gap-2">
                <input type="text" placeholder="Type to focus..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1 bg-earth-bg border border-earth-border rounded-2xl px-5 py-2 text-sm outline-none" />
                <button onClick={handleSend} disabled={isTyping || !input.trim()} className="w-12 h-12 bg-earth-accent text-white rounded-2xl shadow-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all ${isLiveMode ? 'bg-indigo-600 ring-4 ring-indigo-200' : 'bg-earth-accent'}`}
      >
        <i className={`fas ${isOpen ? 'fa-chevron-down' : (isLiveMode ? 'fa-microphone' : 'fa-bolt')} text-white text-xl`}></i>
      </button>

      <style>{`
        @keyframes voice-bar { 0%, 100% { height: 30%; opacity: 0.5; } 50% { height: 100%; opacity: 1; } }
        .animate-voice-bar { animation: voice-bar 0.3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
