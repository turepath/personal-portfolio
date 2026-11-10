
import React, { useState } from 'react';
import { VideoPane } from './VideoPane';

interface GroupGridLayoutProps {
  localStream: MediaStream | null;
  isVirtualActive: boolean;
  isMaskActive?: boolean;
  localEmoji: string;
  participants: any[];
  remoteStreams: Map<string, MediaStream>;
  currentUserId: string;
}

export const GroupGridLayout: React.FC<GroupGridLayoutProps> = ({ localStream, isVirtualActive, isMaskActive, localEmoji, participants, remoteStreams, currentUserId }) => {
  const [enlargedId, setEnlargedId] = useState<string | null>(null);

  const handleInteraction = (id: string) => {
    setEnlargedId(enlargedId === id ? null : id);
  };

  const allParticipants = [{ id: currentUserId, name: 'You', isMe: true }, ...participants];

  if (enlargedId) {
    return (
      <div className="w-full h-full flex gap-8 animate-in fade-in duration-500 overflow-hidden">
        <div className="flex-[3.5] h-full shadow-[0_40px_100px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden">
          <VideoPane 
            id={enlargedId} 
            name={enlargedId === currentUserId ? 'You' : (participants.find(p => p.id === enlargedId)?.name || 'Scholar')} 
            isMe={enlargedId === currentUserId} 
            isVirtual={enlargedId === currentUserId ? isVirtualActive : false} 
            isMasked={enlargedId === currentUserId ? isMaskActive : false}
            virtualEmoji={enlargedId === currentUserId ? localEmoji : (participants.find(p => p.id === enlargedId)?.virtualEmoji)}
            isEnlarged={true}
            stream={enlargedId === currentUserId ? localStream : remoteStreams.get(enlargedId) || null}
            onEnlarge={() => setEnlargedId(null)} 
          />
        </div>
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide py-2">
          {allParticipants.filter(p => p.id !== enlargedId).map(p => (
            <div key={p.id} className="w-full shrink-0">
              <VideoPane 
                {...p} 
                isMe={p.id === currentUserId} 
                isVirtual={p.id === currentUserId ? isVirtualActive : (p as any).isVirtual}
                isMasked={p.id === currentUserId ? isMaskActive : (p as any).isMasked}
                virtualEmoji={p.id === currentUserId ? localEmoji : (p as any).virtualEmoji}
                stream={p.id === currentUserId ? localStream : remoteStreams.get(p.id) || null}
                onEnlarge={handleInteraction} 
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8 w-full max-h-full overflow-y-auto p-4 scrollbar-hide place-content-center animate-in fade-in zoom-in duration-700">
      <VideoPane 
        id={currentUserId} name="You" isMe 
        isVirtual={isVirtualActive} isMasked={isMaskActive}
        virtualEmoji={localEmoji}
        stream={localStream} 
        onEnlarge={handleInteraction} 
      />
      {participants.map(p => (
        <VideoPane 
          key={p.id} 
          {...p} 
          stream={remoteStreams.get(p.id) || null}
          onEnlarge={handleInteraction} 
        />
      ))}
    </div>
  );
};
