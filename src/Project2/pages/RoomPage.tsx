
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState<any>(null);
  const [showTokenBanner, setShowTokenBanner] = useState(false);

  useEffect(() => {
    const fetchLifecycle = async () => {
      setLoading(true);
      
      // Simulate API call: GET /api/rooms/:id
      const room = MOCK_ROOMS.find(r => r.id === id) || MOCK_ROOMS[0];
      
      // Mode Mapping (duo_avatar, group_real, etc)
      let mappedMode: RoomMode = '1:1-virtual';
      if (room.type === '1:1') {
        if (room.isPaid) mappedMode = '1:1-special';
        else if (room.virtualAllowed) mappedMode = '1:1-virtual';
        else mappedMode = '1:1-real';
      } else {
        mappedMode = room.virtualAllowed ? '1:many-virtual' : '1:many-real';
      }

      setRoomData({ ...room, mappedMode });
      
      // Simulate API call: GET /api/rooms/:id/token
      setTimeout(() => {
        setShowTokenBanner(true); // Always true for demo
        setLoading(false);
      }, 1200);
    };

    fetchLifecycle();
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#E8E3DB] flex flex-col items-center justify-center animate-in fade-in duration-1000">
        <div className="w-16 h-16 border-4 border-earth-accent/30 border-t-earth-accent rounded-full animate-spin mb-6"></div>
        <div className="text-center">
          <h2 className="text-xl font-black text-earth-text tracking-widest uppercase mb-2">Joining Session</h2>
          <p className="text-earth-text-sec text-xs font-bold animate-pulse">Establishing encrypted video tunnel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Fallback Banner */}
      {showTokenBanner && (
        <div className="fixed top-0 left-0 right-0 bg-earth-accent text-white text-[10px] font-black uppercase tracking-[0.4em] py-2 text-center z-[200] px-6 backdrop-blur-md flex justify-between items-center shadow-2xl">
          <div className="flex-1 text-center">
            Demo Mode: Video tracks are simulated. Update AGORA_APP_ID in .env for production.
          </div>
          <button onClick={() => setShowTokenBanner(false)} className="hover:text-black transition-colors ml-4">
             [ DISMISS ]
          </button>
        </div>
      )}

      {/* Development Mode Switcher (Visible on hover at top) */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 backdrop-blur-3xl p-2 rounded-full z-[100] opacity-0 hover:opacity-100 transition-all duration-300 scale-75">
        {(['1:1-virtual', '1:1-real', '1:many-virtual', '1:many-real', '1:1-special'] as RoomMode[]).map(m => (
          <button 
            key={m}
            onClick={() => setRoomData({ ...roomData, mappedMode: m })}
            className={`px-4 py-1 rounded-full text-[9px] font-black tracking-widest transition-all ${roomData.mappedMode === m ? 'bg-earth-accent text-white' : 'text-white/40 hover:text-white'}`}
          >
            {m.replace('-', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      <RoomLayout mode={roomData.mappedMode} participants={MOCK_PARTICIPANTS} />
    </div>
  );
};
