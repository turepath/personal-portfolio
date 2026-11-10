
import React from 'react';

interface ControlsBarProps {
  isMicOn: boolean;
  onMicToggle: () => void;
  isCamOn: boolean;
  onCamToggle: () => void;
  isVirtualAllowed: boolean;
  isVirtualActive: boolean;
  onVirtualToggle: () => void;
  isChatOpen: boolean;
  onChatToggle: () => void;
  isTasksOpen?: boolean;
  onTasksToggle?: () => void;
  onLeave: () => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  isMicOn, onMicToggle, isCamOn, onCamToggle, isVirtualAllowed, isVirtualActive, onVirtualToggle, isChatOpen, onChatToggle, isTasksOpen, onTasksToggle, onLeave
}) => {
  return (
    <div className="absolute bottom-[4vh] left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-1000 w-[var(--max-content-width)] max-w-[90%] flex justify-center pointer-events-none">
      <div className="bg-[#1A1A1A]/90 backdrop-blur-3xl rounded-full px-10 py-5 border border-white/10 flex items-center gap-6 shadow-2xl transition-all hover:scale-[1.02] pointer-events-auto">
        <button onClick={onMicToggle} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'text-white/60 hover:text-white hover:bg-white/10' : 'bg-earth-danger text-white shadow-xl ring-8 ring-earth-danger/10'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{isMicOn ? <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v1a7 7 0 01-14 0v-1M12 18.5V23" strokeWidth="2.5" /> : <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v1a7 7 0 01-14 0v-1M1 1l22 22" strokeWidth="2.5" />}</svg>
        </button>
        
        <button onClick={onCamToggle} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isCamOn ? 'text-white/60 hover:text-white hover:bg-white/10' : 'bg-earth-danger text-white shadow-xl ring-8 ring-earth-danger/10'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{isCamOn ? <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth="2.5" /> : <path d="M1 1l22 22M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14" strokeWidth="2.5" />}</svg>
        </button>

        <div className="w-px h-10 bg-white/10 mx-2"></div>

        {isVirtualAllowed && (
          <button onClick={onVirtualToggle} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVirtualActive ? 'bg-earth-accent text-white shadow-xl ring-8 ring-earth-accent/20' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7.5 5.6L10 7L8.6 4.5L10 2L7.5 3.4L5 2L6.4 4.5L5 7L7.5 5.6ZM19.5 15.4L17 14L18.4 16.5L17 19L19.5 17.6L22 19L20.6 16.5L22 14L19.5 15.4ZM22 2L19.5 3.4L17 2L18.4 4.5L17 7L19.5 5.6L22 7L20.6 4.5L22 2ZM13.35 11.05L11 8.7L3 16.7V19H5.3L13.35 11.05ZM15.83 8.58L14.42 7.17L15.41 6.18C15.8 5.79 16.44 5.79 16.83 6.18L17.82 7.17C18.21 7.56 18.21 8.2 17.82 8.59L15.83 8.58Z" /></svg>
          </button>
        )}

        <button 
          onClick={onTasksToggle} 
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all relative ${isTasksOpen ? 'bg-earth-accent text-white shadow-xl ring-8 ring-earth-accent/20' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
          title="Task Center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          <span className="absolute -top-1 -right-1 bg-earth-success text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-[#1A1A1A]">GOAL</span>
        </button>

        <button onClick={onChatToggle} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isChatOpen ? 'bg-earth-accent text-white shadow-xl ring-8 ring-earth-accent/20' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeWidth="2.5" /></svg>
        </button>

        <div className="w-px h-10 bg-white/10 mx-2"></div>

        <button onClick={onLeave} className="w-14 h-14 rounded-full flex items-center justify-center bg-earth-danger/20 text-earth-danger hover:bg-earth-danger hover:text-white transition-all shadow-xl group ring-4 ring-earth-danger/5">
          <svg className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" /></svg>
        </button>
      </div>
    </div>
  );
};
