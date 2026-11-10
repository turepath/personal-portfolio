
import React, { useState } from 'react';
import { Button } from '../components/Common';
import { useNavigate } from 'react-router-dom';
import { PreferencesModal } from '../components/PreferencesModal';
import { usePreferences } from '../hooks/usePreferences';
import { MOCK_ROOMS } from '../utils/constants';
import apiClient from '../services/index';

export const Home: React.FC = () => {
  const [isFocusing, setIsFocusing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { preferences } = usePreferences();
  const navigate = useNavigate();

  const handleStartFocus = async () => {
    setIsFocusing(true);
    
    try {
      // Check if user has an active room
      const response = await apiClient.get('/api/rooms/active');
      const activeRoom = response.data;
      
      if (activeRoom) {
        // User has an active room, navigate to it
        navigate(`/room/${activeRoom.room_id}`);
      } else {
        // No active room, proceed with normal logic
        setTimeout(() => {
          const choice = preferences.roomChoice;
          let targetRoomId = '';

          if (choice === 'duo_avatar') {
            const room = MOCK_ROOMS.find(r => r.type === '1:1' && r.virtualAllowed);
            targetRoomId = room?.id || 'r1';
          } else if (choice === 'group_avatar') {
            const room = MOCK_ROOMS.find(r => r.type === '1:many' && r.virtualAllowed);
            targetRoomId = room?.id || 'r3';
          } else if (choice === 'random') {
            // Pick randomly from the first 4 primary rooms (r1, r2, r3, r4)
            const pool = MOCK_ROOMS.slice(0, 4);
            const picked = pool[Math.floor(Math.random() * pool.length)];
            targetRoomId = picked?.id || 'r1';
          } else {
            targetRoomId = 'r1';
          }

          navigate(`/room/${targetRoomId}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Error checking active room:', error);
      // Fallback to normal logic if API call fails
      setTimeout(() => {
        navigate('/rooms');
      }, 1000);
    } finally {
      setIsFocusing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center relative text-center">
      {/* Visual background accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-earth-accent/5 rounded-full blur-[120px] -z-10"></div>
      
      <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-earth-accent/10 rounded-full text-earth-accent text-[11px] font-black uppercase tracking-[0.2em] mb-10 ring-1 ring-earth-accent/20">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-earth-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-earth-accent"></span>
          </span>
          Global Flow State: 1,240 Users Live
        </div>

        <h2 className="text-5xl md:text-7xl font-black mb-8 text-earth-text tracking-tighter leading-[1.05]">
          Master your focus in a <br/>
          <span className="text-earth-accent italic font-serif relative">
            connected
            <svg className="absolute -bottom-2 left-0 w-full h-3 text-earth-accent/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none"/></svg>
          </span> workspace.
        </h2>
        
        <p className="text-earth-text-sec text-lg md:text-xl mb-16 max-w-xl mx-auto leading-relaxed font-medium">
          The ultimate productivity companion. Join video-enabled rooms for deep study, silent collaboration, and shared accountability.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button 
            className="w-full sm:w-72 h-16 text-xl shadow-xl hover:shadow-earth-accent/20 hover:-translate-y-1.5 transition-all font-black uppercase tracking-widest"
            onClick={handleStartFocus}
            isLoading={isFocusing}
          >
            Start Focusing
          </Button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 text-sm font-black text-earth-text-sec hover:text-earth-accent transition-all flex items-center gap-3 group bg-white border border-earth-border rounded-xl shadow-sm hover:shadow-md"
            aria-label="Open Quick Preferences"
          >
            Preferences
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
      </div>

      <PreferencesModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={(prefs) => console.log('Current Session Prefs:', prefs)}
      />
    </div>
  );
};
