
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DuoLayout } from './DuoLayout';
import { GroupGridLayout } from './GroupGridLayout';
import { GroupRingLayout } from './GroupRingLayout';
import { ChatSidebar } from './ChatSidebar';
import { TimerControl } from './TimerControl';
import { ModeSwitcher } from './ModeSwitcher';
import { ControlsBar } from './ControlsBar';
import { Badge } from '../Common';

export type RoomMode = '1:1-virtual' | '1:1-real' | '1:many-virtual' | '1:many-real' | '1:1-special';

interface RoomLayoutProps {
  mode: RoomMode;
  participants: any[];
}

export const RoomLayout: React.FC<RoomLayoutProps> = ({ mode, participants }) => {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVirtualActive, setIsVirtualActive] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [subMode, setSubMode] = useState<'grid' | 'ring'>('grid');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const isMany = mode.includes('many');
  const isVirtualAllowed = mode.includes('virtual');
  const isSpecial = mode === '1:1-special';

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function getMedia() {
      try {
        if (isCamOn) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: 1280, height: 720 },
            audio: true 
          });
          setLocalStream(stream);
        } else {
          stopMedia();
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
    getMedia();
    return () => stopMedia();
  }, [isCamOn]);

  function stopMedia() {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  }

  const handleLeave = () => {
    stopMedia();
    navigate('/rooms');
  };

  return (
    <div 
      className={`fixed inset-0 flex flex-col transition-colors duration-1000 overflow-hidden ${isSpecial ? 'bg-[#121212]' : 'bg-[#EFEAE2]'}`}
      style={{ backgroundImage: isSpecial ? 'none' : 'radial-gradient(circle at center, #F8F5F1 0%, #EFEAE2 100%)' }}
    >
      {/* Internal Room Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start pointer-events-none z-[60]">
        <div className="pointer-events-auto flex flex-col gap-4">
          <button 
            onClick={handleLeave}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-earth-text-sec hover:text-earth-accent transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" /></svg>
            Lobby
          </button>
          {isMany && <ModeSwitcher currentMode={subMode} onModeChange={setSubMode} />}
        </div>

        <div className="pointer-events-auto flex flex-col items-center">
          <TimerControl seconds={timeLeft} onPresetSelect={(m) => setTimeLeft(m * 60)} />
        </div>

        <div className="pointer-events-auto">
          {!isVirtualAllowed && <Badge color="warning">Authentic Mode Only</Badge>}
          {isSpecial && <Badge color="accent">Premium Space</Badge>}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-[var(--gutter)] relative overflow-hidden mt-20">
        <div className={`w-full h-full max-w-[1600px] flex items-center justify-center ${isChatOpen ? 'pr-[320px]' : ''} transition-all duration-500`}>
          {!isMany ? (
            <DuoLayout 
              localStream={localStream} 
              isVirtualActive={isVirtualActive} 
              participants={participants} 
            />
          ) : (
            subMode === 'grid' ? (
              <GroupGridLayout 
                localStream={localStream} 
                isVirtualActive={isVirtualActive} 
                participants={participants} 
              />
            ) : (
              <GroupRingLayout 
                localStream={localStream} 
                isVirtualActive={isVirtualActive} 
                participants={participants} 
              />
            )
          )}
        </div>
      </div>

      {/* Controls Bar - Bottom Centered */}
      <ControlsBar 
        isMicOn={isMicOn} 
        onMicToggle={() => setIsMicOn(!isMicOn)}
        isCamOn={isCamOn}
        onCamToggle={() => setIsCamOn(!isCamOn)}
        isVirtualAllowed={isVirtualAllowed}
        isVirtualActive={isVirtualActive}
        onVirtualToggle={() => setIsVirtualActive(!isVirtualActive)}
        isChatOpen={isChatOpen}
        onChatToggle={() => setIsChatOpen(!isChatOpen)}
        onLeave={handleLeave}
      />

      {/* Chat Sidebar */}
      <ChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};
