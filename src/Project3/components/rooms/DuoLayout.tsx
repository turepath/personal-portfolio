
import React, { useState } from 'react';
import { VideoPane } from './VideoPane';

interface DuoLayoutProps {
  localStream: MediaStream | null;
  isVirtualActive: boolean;
  participants: any[];
}

export const DuoLayout: React.FC<DuoLayoutProps> = ({ localStream, isVirtualActive, participants }) => {
  const [enlargedId, setEnlargedId] = useState<string | null>(null);
  const partner = participants[0] || { id: 'partner', name: 'Partner' };

  const handleInteraction = (id: string) => {
    setEnlargedId(enlargedId === id ? null : id);
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      {enlargedId ? (
        <div className="relative w-full h-full animate-in fade-in duration-500">
          {/* Main Enlarged View */}
          <VideoPane 
            id={enlargedId}
            name={enlargedId === 'me' ? 'Alex' : partner.name}
            isMe={enlargedId === 'me'}
            isVirtual={enlargedId === 'me' ? isVirtualActive : partner.isVirtual}
            isEnlarged={true}
            stream={enlargedId === 'me' ? localStream : null}
            onEnlarge={handleInteraction}
          />
          {/* PIP View */}
          <div className="absolute top-6 right-6 w-1/4 aspect-video shadow-2xl rounded-2xl overflow-hidden border border-white/20 z-10 transition-all hover:scale-105">
            <VideoPane 
              id={enlargedId === 'me' ? partner.id : 'me'}
              name={enlargedId === 'me' ? partner.name : 'Alex'}
              isMe={enlargedId !== 'me'}
              isVirtual={enlargedId !== 'me' ? isVirtualActive : partner.isVirtual}
              isEnlarged={false}
              stream={enlargedId !== 'me' ? localStream : null}
              onEnlarge={handleInteraction}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-[var(--gutter)] w-full max-w-[1300px] h-full items-center content-center animate-in fade-in duration-700">
          <div className="w-full flex justify-center">
            <VideoPane 
              id="me" 
              name="Alex" 
              isMe 
              isVirtual={isVirtualActive} 
              stream={localStream} 
              onEnlarge={handleInteraction} 
            />
          </div>
          <div className="w-full flex justify-center">
            <VideoPane 
              id={partner.id} 
              name={partner.name} 
              isVirtual={partner.isVirtual}
              onEnlarge={handleInteraction} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
