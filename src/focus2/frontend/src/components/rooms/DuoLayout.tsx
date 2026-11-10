
import React, { useState } from 'react';
import { VideoPane } from './VideoPane';

interface DuoLayoutProps {
  localStream: MediaStream | null;
  isVirtualActive: boolean;
  isMaskActive?: boolean;
  localEmoji: string;
  participants: any[];
  remoteStreams: Map<string, MediaStream>;
  currentUserId: string;
}

export const DuoLayout: React.FC<DuoLayoutProps> = ({ localStream, isVirtualActive, isMaskActive, localEmoji, participants, remoteStreams, currentUserId }) => {
  const [enlargedId, setEnlargedId] = useState<string | null>(null);
  const partner = participants[0] || { id: 'partner', name: 'Partner' };

  const handleInteraction = (id: string) => {
    setEnlargedId(enlargedId === id ? null : id);
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      {enlargedId ? (
        <div className="relative w-full h-full animate-in fade-in duration-500">
          <VideoPane 
            id={enlargedId}
            name={enlargedId === currentUserId ? 'You' : partner.name}
            isMe={enlargedId === currentUserId}
            isVirtual={enlargedId === currentUserId ? isVirtualActive : partner.isVirtual}
            isMasked={enlargedId === currentUserId ? isMaskActive : partner.isMasked}
            virtualEmoji={enlargedId === currentUserId ? localEmoji : partner.virtualEmoji}
            isEnlarged={true}
            stream={enlargedId === currentUserId ? localStream : remoteStreams.get(enlargedId) || null}
            onEnlarge={handleInteraction}
          />
          <div className="absolute top-6 right-6 w-1/4 aspect-video shadow-2xl rounded-2xl overflow-hidden border border-white/20 z-10 transition-all hover:scale-105">
            <VideoPane 
              id={enlargedId === currentUserId ? partner.id : currentUserId}
              name={enlargedId === currentUserId ? partner.name : 'You'}
              isMe={enlargedId !== currentUserId}
              isVirtual={enlargedId !== currentUserId ? isVirtualActive : partner.isVirtual}
              isMasked={enlargedId !== currentUserId ? isMaskActive : partner.isMasked}
              virtualEmoji={enlargedId !== currentUserId ? localEmoji : partner.virtualEmoji}
              isEnlarged={false}
              stream={enlargedId !== currentUserId ? localStream : remoteStreams.get(currentUserId) || null}
              onEnlarge={handleInteraction}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-[var(--gutter)] w-full max-w-[1300px] h-full items-center content-center animate-in fade-in duration-700">
          <div className="w-full flex justify-center">
            <VideoPane 
              id={currentUserId} name="You" isMe 
              isVirtual={isVirtualActive} isMasked={isMaskActive}
              virtualEmoji={localEmoji}
              stream={localStream} onEnlarge={handleInteraction} 
            />
          </div>
          <div className="w-full flex justify-center">
            <VideoPane 
              id={partner.id} name={partner.name} 
              isVirtual={partner.isVirtual} isMasked={partner.isMasked}
              virtualEmoji={partner.virtualEmoji}
              stream={remoteStreams.get(partner.id) || null}
              onEnlarge={handleInteraction} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
