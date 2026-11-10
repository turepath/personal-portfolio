
import React, { useState } from 'react';
import { VideoPane } from './VideoPane';

interface GroupGridLayoutProps {
  localStream: MediaStream | null;
  isVirtualActive: boolean;
  participants: any[];
}

export const GroupGridLayout: React.FC<GroupGridLayoutProps> = ({ localStream, isVirtualActive, participants }) => {
  const [enlargedId, setEnlargedId] = useState<string | null>(null);

  const handleInteraction = (id: string) => {
    setEnlargedId(enlargedId === id ? null : id);
  };

  const allParticipants = [{ id: 'me', name: 'Alex', isMe: true }, ...participants];

  if (enlargedId) {
    return (
      <div className="w-full h-full flex gap-8 animate-in fade-in duration-500 overflow-hidden">
        <div className="flex-[3.5] h-full shadow-[0_40px_100px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden">
          <VideoPane 
            id={enlargedId} 
            name={enlargedId === 'me' ? 'Alex' : (participants.find(p => p.id === enlargedId)?.name || 'Scholar')} 
            isMe={enlargedId === 'me'} 
            isVirtual={enlargedId === 'me' ? isVirtualActive : false} 
            isEnlarged={true}
            stream={enlargedId === 'me' ? localStream : null}
            onEnlarge={() => setEnlargedId(null)} 
          />
        </div>
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide py-2">
          {allParticipants.filter(p => p.id !== enlargedId).map(p => (
            <div key={p.id} className="w-full shrink-0">
              <VideoPane 
                {...p} 
                isMe={p.id === 'me'} 
                isVirtual={p.id === 'me' ? isVirtualActive : (p as any).isVirtual}
                stream={p.id === 'me' ? localStream : null}
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
      <VideoPane id="me" name="Alex" isMe isVirtual={isVirtualActive} stream={localStream} onEnlarge={handleInteraction} />
      {participants.map(p => (
        <VideoPane key={p.id} {...p} onEnlarge={handleInteraction} />
      ))}
    </div>
  );
};
