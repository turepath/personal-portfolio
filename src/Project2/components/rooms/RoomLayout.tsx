
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { VideoPane } from './VideoPane';
import { ChatSidebar } from './ChatSidebar';
import { PartnerCard } from './PartnerCard';
import { TimerControl } from './TimerControl';
import { ModeSwitcher } from './ModeSwitcher';
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
  const [enlargedId, setEnlargedId] = useState<string | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [subMode, setSubMode] = useState<'grid' | 'ring'>('grid');
  const [currentPage, setCurrentPage] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const isMany = mode.includes('many');
  const isVirtualAllowed = mode.includes('virtual');
  const isSpecial = mode === '1:1-special';

  const visibleParticipants = isMany 
    ? participants.slice(currentPage * 10, (currentPage + 1) * 10) 
    : participants.slice(0, 1);

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  // Camera handling logic
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

  // Handle stream tracks when mic/cam toggles
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => { track.enabled = isCamOn; });
      localStream.getAudioTracks().forEach(track => { track.enabled = isMicOn; });
    }
  }, [isCamOn, isMicOn, localStream]);

  const handleEnlarge = (id: string) => {
    setEnlargedId(enlargedId === id ? null : id);
  };

  const handleLeave = () => {
    stopMedia();
    navigate('/rooms');
  };

  const partnerData = {
    name: 'Sarah Jenkins',
    avatar: 'https://picsum.photos/seed/sarah/100/100',
    profession: 'Architect',
    age: 28,
    bio: 'Focusing on parametric 3D modeling today. Always up for a tea break!'
  };

  return (
    <div 
      className={`fixed inset-0 flex transition-colors duration-1000 overflow-hidden ${isSpecial ? 'bg-[#2C2824]' : 'bg-[#E8E3DB]'}`}
      style={{ backgroundImage: isSpecial ? 'none' : 'radial-gradient(circle at center, #F1EEE9 0%, #E8E3DB 100%)' }}
    >
      <div className="flex-1 relative flex flex-col h-full">
        
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 z-10 bg-black/5 backdrop-blur-md border-b border-white/5">
           <PartnerCard partner={partnerData} />
           <TimerControl seconds={timeLeft} onPresetSelect={(m) => setTimeLeft(m * 60)} />
           <div className="flex items-center gap-4">
             {!isVirtualAllowed && <Badge color="warning">Authentic Mode Only</Badge>}
             {isMany && <ModeSwitcher currentMode={subMode} onModeChange={setSubMode} />}
           </div>
        </header>

        {/* Workspace Canvas */}
        <div className="flex-1 p-8 md:p-14 flex items-center justify-center relative">
          <div className="w-full h-full max-w-[1400px] mx-auto relative flex items-center justify-center">
            {enlargedId ? (
              <div className="w-full h-full flex gap-8 transition-all duration-1000 ease-in-out">
                <div className="flex-[4] h-full shadow-2xl rounded-3xl overflow-hidden">
                  <VideoPane 
                    id={enlargedId} 
                    name={enlargedId === 'me' ? 'Alex' : (participants.find(p => p.id === enlargedId)?.name || 'Participant')} 
                    isMe={enlargedId === 'me'} 
                    isVirtual={enlargedId === 'me' ? isVirtualActive : false} 
                    isEnlarged={true}
                    stream={enlargedId === 'me' ? localStream : null}
                    onEnlarge={() => setEnlargedId(null)} 
                  />
                </div>
                <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-4 scrollbar-hide">
                  {enlargedId !== 'me' && (
                     <div className="aspect-video w-full"><VideoPane id="me" name="Alex" isMe isVirtual={isVirtualActive} isEnlarged={false} stream={localStream} onEnlarge={handleEnlarge} /></div>
                  )}
                  {visibleParticipants.filter(p => p.id !== enlargedId).map(p => (
                    <div key={p.id} className="aspect-video w-full"><VideoPane {...p} isEnlarged={false} onEnlarge={handleEnlarge} /></div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {!isMany ? (
                  <div className="w-full h-full flex gap-10 items-center justify-center max-w-[1200px]">
                    <div className="flex-1 h-[70%] max-h-[600px] transform hover:scale-[1.02] transition-transform">
                      <VideoPane id="me" name="Alex" isMe isVirtual={isVirtualActive} isEnlarged={false} stream={localStream} onEnlarge={handleEnlarge} />
                    </div>
                    <div className="flex-1 h-[70%] max-h-[600px] transform hover:scale-[1.02] transition-transform">
                      <VideoPane id="partner" name="Sarah" isEnlarged={false} onEnlarge={handleEnlarge} />
                    </div>
                  </div>
                ) : (
                  <>
                    {subMode === 'grid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full h-full content-center overflow-y-auto pr-2 scrollbar-hide">
                         <div className="aspect-video">
                           <VideoPane id="me" name="Alex" isMe isVirtual={isVirtualActive} isEnlarged={false} stream={localStream} onEnlarge={handleEnlarge} />
                         </div>
                         {visibleParticipants.map(p => (
                            <div key={p.id} className="aspect-video"><VideoPane {...p} onEnlarge={handleEnlarge} /></div>
                         ))}
                      </div>
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center animate-in zoom-in duration-1000">
                        <div className="w-[45%] aspect-video shadow-[0_50px_100px_rgba(0,0,0,0.2)]">
                           <VideoPane id="me" name="Alex" isMe isVirtual={isVirtualActive} isEnlarged={false} stream={localStream} onEnlarge={handleEnlarge} />
                        </div>
                        <div className="absolute inset-0 pointer-events-none">
                           {visibleParticipants.map((p, i) => {
                             const angle = (i / visibleParticipants.length) * 2 * Math.PI - Math.PI/2;
                             const radius = 42;
                             const x = Math.cos(angle) * radius + 50;
                             const y = Math.sin(angle) * radius + 50;
                             return (
                               <div key={p.id} className="absolute w-40 h-24 pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 hover:scale-125 hover:z-50 shadow-xl" style={{ left: `${x}%`, top: `${y}%` }}>
                                 <VideoPane {...p} onEnlarge={handleEnlarge} />
                               </div>
                             )
                           })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Global Controls */}
        <div className="h-28 flex items-center justify-center px-8 z-20">
           <div className="bg-room-control-bg backdrop-blur-3xl rounded-[40px] px-10 py-4 border border-white/10 flex items-center gap-6 shadow-[0_30px_90px_rgba(0,0,0,0.3)] transition-all hover:scale-[1.02]">
              <button 
                onClick={() => setIsMicOn(!isMicOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'text-white hover:bg-white/10' : 'bg-earth-danger text-white shadow-2xl ring-4 ring-earth-danger/10'}`}
                aria-label="Toggle Mic"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMicOn ? <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v1a7 7 0 01-14 0v-1M12 18.5V23" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v1a7 7 0 01-14 0v-1M1 1l22 22" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                </svg>
              </button>
              <button 
                onClick={() => setIsCamOn(!isCamOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCamOn ? 'text-white hover:bg-white/10' : 'bg-earth-danger text-white shadow-2xl ring-4 ring-earth-danger/10'}`}
                aria-label="Toggle Cam"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isCamOn ? <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M1 1l22 22M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                </svg>
              </button>
              
              <div className="w-px h-8 bg-white/10 mx-1"></div>
              
              {isVirtualAllowed && (
                <button 
                  onClick={() => setIsVirtualActive(!isVirtualActive)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isVirtualActive ? 'bg-earth-accent text-white shadow-2xl ring-4 ring-earth-accent/10' : 'text-white hover:bg-white/10'}`}
                  aria-label="Toggle Virtual Avatar"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.5 5.6L10 7L8.6 4.5L10 2L7.5 3.4L5 2L6.4 4.5L5 7L7.5 5.6ZM19.5 15.4L17 14L18.4 16.5L17 19L19.5 17.6L22 19L20.6 16.5L22 14L19.5 15.4ZM22 2L19.5 3.4L17 2L18.4 4.5L17 7L19.5 5.6L22 7L20.6 4.5L22 2ZM13.35 11.05L11 8.7L3 16.7V19H5.3L13.35 11.05ZM15.83 8.58L14.42 7.17L15.41 6.18C15.8 5.79 16.44 5.79 16.83 6.18L17.82 7.17C18.21 7.56 18.21 8.2 17.82 8.59L15.83 8.58Z" /></svg>
                </button>
              )}
              
              <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isChatOpen ? 'bg-earth-accent text-white shadow-2xl ring-4 ring-earth-accent/10' : 'text-white hover:bg-white/10'}`}
                aria-label="Toggle Chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>

              <div className="w-px h-8 bg-white/10 mx-1"></div>

              {/* Leave Room Button */}
              <button 
                onClick={handleLeave}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-earth-danger/10 text-earth-danger hover:bg-earth-danger hover:text-white transition-all shadow-sm group"
                aria-label="Leave Session"
              >
                <svg className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
           </div>
        </div>

        {/* Edge-aligned Chat Toggle Button */}
        {!isChatOpen && (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="fixed top-1/2 -right-6 -translate-y-1/2 w-12 h-32 bg-earth-accent/90 text-white rounded-l-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex items-center justify-center hover:pr-6 transition-all active:scale-95 group z-40 border-l border-white/20 backdrop-blur-2xl"
            aria-label="Open sidebar"
          >
             <svg className="w-6 h-6 -rotate-90 group-hover:scale-125 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        )}
      </div>
      <ChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};
