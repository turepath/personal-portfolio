
import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from '../Common';
import { AICharacterId } from '../../utils/types';

interface AIEntityViewProps {
  characterId?: AICharacterId;
  isUserSpeaking?: boolean;
  isAiSpeaking?: boolean;
  isTaskSuccess?: boolean;
  isUserAsking?: boolean;
}

export const AIEntityView: React.FC<AIEntityViewProps> = ({ 
  characterId = 'lin_xia', 
  isUserSpeaking, 
  isAiSpeaking,
  isTaskSuccess, 
  isUserAsking
}) => {
  const [blink, setBlink] = useState(false);
  const [activeAction, setActiveAction] = useState<'idle' | 'speaking' | 'nod' | 'smile'>('idle');

  useEffect(() => {
    const timer = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const theme = useMemo(() => {
    switch(characterId) {
      case 'lin_xia': return { name: '林晓', bio: '都市学霸', main: '#8C8C8C', bg: 'bg-[#F4F4F7]' };
      case 'chen_mo': return { name: '陈默', bio: '职场精英', main: '#4A5568', bg: 'bg-[#EBEDF0]' };
      case 'su_he': return { name: '苏禾', bio: '文艺创作者', main: '#D6BCFA', bg: 'bg-[#FAF5FF]' };
      default: return { name: 'Scholar', bio: 'Partner', main: '#8A9B6E', bg: 'bg-white' };
    }
  }, [characterId]);

  return (
    <div className={`relative rounded-[3rem] overflow-hidden ${theme.bg} shadow-2xl border-4 border-white flex flex-col items-center justify-center h-full transition-all duration-1000 group`}>
      
      {/* 说话时的声波纹 */}
      {isAiSpeaking && (
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-64 h-64 bg-earth-accent/20 rounded-full animate-ping opacity-20"></div>
           <div className="absolute w-80 h-80 bg-earth-accent/10 rounded-full animate-ping [animation-delay:0.3s] opacity-10"></div>
        </div>
      )}

      <div className={`relative flex flex-col items-center transition-all duration-700 ${isAiSpeaking ? 'scale-105' : 'scale-100'}`}>
        <svg width="280" height="320" viewBox="0 0 200 240" className="drop-shadow-2xl">
           {/* 身体 */}
           <path d="M40 200 Q 100 180 160 200 L 180 240 L 20 240 Z" fill={characterId === 'chen_mo' ? '#2D3748' : characterId === 'su_he' ? '#FFF5F5' : '#E2E8F0'} />
           
           {/* 头部 */}
           <g className={`${isAiSpeaking ? 'animate-ai-nod' : ''}`}>
              <path d="M60 80 C 60 40, 140 40, 140 80 C 140 130, 130 160, 100 160 C 70 160, 60 130, 60 80" fill="#FFE4D6" />
              
              {/* 发型 */}
              {characterId === 'lin_xia' && <path d="M60 80 Q 60 30 100 30 Q 140 30 140 80" fill="#2D3748" />}
              {characterId === 'chen_mo' && <path d="M60 75 Q 60 40 100 35 Q 140 40 140 75" fill="#1A202C" />}
              {characterId === 'su_he' && <path d="M55 80 Q 50 20 100 25 Q 150 20 145 80" fill="#744210" />}

              {/* 五官 */}
              <g transform="translate(100, 95)">
                 {!blink ? (
                   <><circle cx="-22" cy="0" r="4" fill="#333" /><circle cx="22" cy="0" r="4" fill="#333" /></>
                 ) : (
                   <><rect x="-26" y="-1" width="8" height="2" rx="1" fill="#333" /><rect x="18" y="-1" width="8" height="2" rx="1" fill="#333" /></>
                 )}
                 {/* 嘴巴同步动画 */}
                 {isAiSpeaking ? (
                   <ellipse cx="0" cy="15" rx="6" ry="4" fill="#333" className="animate-ai-talk" />
                 ) : (
                   <path d="M-5 15 Q 0 18 5 15" stroke="#333" strokeWidth="2" fill="none" />
                 )}
              </g>
           </g>
        </svg>

        {isAiSpeaking && (
           <div className="mt-4 flex gap-1 items-center justify-center h-4">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-1 bg-earth-accent rounded-full animate-ai-wave" style={{ animationDelay: `${i * 0.1}s` }}></div>
              ))}
           </div>
        )}
      </div>

      <div className="absolute bottom-8 flex flex-col items-center gap-2">
         <div className="px-6 py-2 bg-white/90 backdrop-blur shadow-sm rounded-full border border-earth-border flex items-center gap-3">
            <span className="text-[11px] font-black text-earth-text uppercase tracking-widest">
               {theme.name} · {theme.bio}
            </span>
            <div className={`w-2.5 h-2.5 rounded-full ${isAiSpeaking ? 'bg-earth-success animate-pulse' : 'bg-earth-accent/20'}`}></div>
         </div>
      </div>

      <style>{`
        @keyframes ai-nod { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(3px); } }
        @keyframes ai-talk { 0%, 100% { ry: 2px; } 50% { ry: 5px; } }
        @keyframes ai-wave { 0%, 100% { height: 4px; } 50% { height: 16px; } }
        .animate-ai-nod { animation: ai-nod 1.5s ease-in-out infinite; }
        .animate-ai-talk { animation: ai-talk 0.2s ease-in-out infinite; }
        .animate-ai-wave { animation: ai-wave 0.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
