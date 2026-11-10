
import React, { useEffect, useRef } from 'react';
import { Badge } from '../Common';

interface VideoPaneProps {
  id: string;
  name: string;
  isMe?: boolean;
  isVirtual?: boolean;
  isMuted?: boolean;
  isEnlarged?: boolean;
  avatar?: string;
  stream?: MediaStream | null;
  onEnlarge: (id: string) => void;
}

export const VideoPane: React.FC<VideoPaneProps> = ({ 
  id, name, isMe, isVirtual, isMuted, isEnlarged, avatar, stream, onEnlarge 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream && !isVirtual) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isVirtual]);

  return (
    <div className={`relative rounded-xl overflow-hidden bg-black shadow-2xl transition-all duration-700 ease-in-out group ${isEnlarged ? 'w-full h-full' : 'aspect-video w-full'}`}>
      {/* Feed Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isVirtual ? (
          <div className="w-full h-full bg-gradient-to-br from-earth-accent/40 via-earth-accent/20 to-[#2C2824] flex flex-col items-center justify-center overflow-hidden">
             {/* Simulated 3D Avatar Visual */}
             <div className="relative animate-bounce duration-[3s]">
               <div className="w-32 h-32 bg-white/10 rounded-full blur-2xl absolute -inset-4 animate-pulse"></div>
               <div className="text-6xl drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] relative z-10">🦊</div>
             </div>
             <div className="mt-6 flex flex-col items-center gap-1 z-10">
               <Badge color="accent">Virtual Active</Badge>
               <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">Face Tracking Enabled</p>
             </div>
             {/* Background particles simulation */}
             <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping"></div>
                <div className="absolute top-3/4 left-2/3 w-1 h-1 bg-white rounded-full animate-ping delay-700"></div>
                <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white rounded-full animate-ping delay-300"></div>
             </div>
          </div>
        ) : (
          <>
            {isMe && stream ? (
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover scale-x-[-1] opacity-90 group-hover:opacity-100 transition-opacity"
              />
            ) : (
              <img 
                src={avatar || `https://picsum.photos/seed/${id}/800/450`} 
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                alt={name} 
              />
            )}
          </>
        )}
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="absolute bottom-4 left-4 flex items-center gap-3">
        <div className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
          <span className="text-xs font-bold text-white tracking-wide">
            {name} {isMe && "(You)"}
          </span>
        </div>
        {isMuted && <Badge color="danger">Muted</Badge>}
      </div>

      {/* Hover Controls */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
        <button 
          onClick={() => onEnlarge(id)}
          className="p-2 bg-black/60 backdrop-blur-md hover:bg-earth-accent text-white rounded-lg transition-all shadow-lg border border-white/10"
          aria-label={isEnlarged ? "Minimize" : "Enlarge view"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isEnlarged ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
};
