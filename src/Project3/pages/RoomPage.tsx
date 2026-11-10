
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { RoomLayout, RoomMode } from '../components/rooms/RoomLayout';
import { MOCK_ROOMS } from '../constants';

const MOCK_PARTICIPANTS = Array.from({ length: 28 }).map((_, i) => ({
  id: `user-${i}`,
  name: `Scholar_${i + 101}`,
  avatar: `https://picsum.photos/seed/${i + 500}/400/225`,
  isVirtual: Math.random() > 0.85,
  isMuted: Math.random() > 0.4
}));

export const RoomPage: React.FC = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState<any>(null);

  useEffect(() => {
    const fetchLifecycle = async () => {
      setLoading(true);
      const room = MOCK_ROOMS.find(r => r.id === id) || MOCK_ROOMS[0];
      
      let mappedMode: RoomMode = '1:1-virtual';
      
      // Strict Mode Mapping
      if (room.id === 'r5') {
        // Specifically fix the fifth room (Elite Retreat)
        mappedMode = '1:1-special';
      } else if (room.type === '1:1') {
        if (room.virtualAllowed) mappedMode = '1:1-virtual';
        else mappedMode = '1:1-real';
      } else if (room.type === '1:many' || room.type === '1:pro') {
        mappedMode = room.virtualAllowed ? '1:many-virtual' : '1:many-real';
      }

      setRoomData({ ...room, mappedMode });
      
      setTimeout(() => {
        setLoading(false);
      }, 800);
    };

    fetchLifecycle();
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#EFEAE2] flex flex-col items-center justify-center z-[200]">
        <div className="w-14 h-14 border-[5px] border-earth-accent/20 border-t-earth-accent rounded-full animate-spin mb-8"></div>
        <div className="text-center">
          <h2 className="text-xs font-black text-earth-text tracking-[0.4em] uppercase mb-3">Syncing Workspace</h2>
          <p className="text-earth-text-sec text-[10px] font-bold animate-pulse tracking-widest">TUNING FEED...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#EFEAE2] z-[500] overflow-hidden">
       <RoomLayout mode={roomData.mappedMode} participants={MOCK_PARTICIPANTS} />
    </div>
  );
};
