
import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { MOCK_USER, WHITE_NOISE_TRACKS } from '../constants';

const TopNav: React.FC<{ onLogout: () => void }> = ({ onLogout }) => (
  <header className="h-16 bg-earth-bg border-b border-earth-border flex items-center justify-between px-6 sticky top-0 z-40">
    <div className="flex items-center gap-4">
      <NavLink to="/" className="flex items-center gap-4">
        <div className="w-10 h-10 bg-earth-accent rounded-md flex items-center justify-center text-white font-bold text-xl">F</div>
        <h1 className="text-lg font-bold tracking-tight hidden md:block">Focus Companion</h1>
      </NavLink>
    </div>

    <div className="flex-1 max-w-xl mx-8 hidden lg:block">
      <div className="relative">
        <input 
          type="text" 
          placeholder="Search rooms, posts, people..." 
          className="w-full bg-earth-card border border-earth-border rounded-full py-2 px-10 text-sm focus:outline-none focus:border-earth-accent transition-all"
        />
        <svg className="w-4 h-4 absolute left-4 top-2.5 text-earth-text-sec" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <button className="p-2 text-earth-text-sec hover:text-earth-text relative">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        <span className="absolute top-2 right-2 w-2 h-2 bg-earth-danger rounded-full border-2 border-earth-bg"></span>
      </button>
      <NavLink to="/my" className="flex items-center gap-3">
        <img src={MOCK_USER.avatar} alt="User" className="w-8 h-8 rounded-full border border-earth-border" />
        <span className="text-sm font-medium hidden sm:inline">{MOCK_USER.name}</span>
      </NavLink>
    </div>
  </header>
);

const DesktopSidebar: React.FC = () => {
  const links = [
    { to: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/rooms', label: 'Rooms', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { to: '/community', label: 'Community', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { to: '/my', label: 'My Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { to: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  return (
    <aside className="w-64 bg-earth-bg border-r border-earth-border flex-shrink-0 flex-col py-6 sticky top-16 h-[calc(100vh-64px)] hidden md:flex">
      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-earth-card text-earth-accent' 
                  : 'text-earth-text-sec hover:bg-earth-card-alt hover:text-earth-text'
              }`
            }
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon}></path></svg>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4">
        <div className="bg-earth-card rounded-lg p-4 border border-earth-border">
          <p className="text-xs font-bold text-earth-accent mb-1 uppercase tracking-wider">Upgrade to Pro</p>
          <p className="text-xs text-earth-text-sec mb-3">Unlimited sessions & premium virtual avatars.</p>
          <NavLink to="/rooms" className="block">
            <button className="w-full py-2 bg-earth-accent text-white text-xs font-bold rounded shadow-sm hover:bg-earth-accent-hover transition-colors">Upgrade Now</button>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

const MobileNav: React.FC = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-earth-bg border-t border-earth-border h-16 flex items-center justify-around z-50 md:hidden">
    {[
      { to: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { to: '/rooms', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
      { to: '/community', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857' },
      { to: '/my', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
    ].map((link, idx) => (
      <NavLink
        key={idx}
        to={link.to}
        className={({ isActive }) => `p-2 ${isActive ? 'text-earth-accent' : 'text-earth-text-sec'}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon}></path></svg>
      </NavLink>
    ))}
  </nav>
);

const WhiteNoiseWidget: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(() => localStorage.getItem('noise_enabled') === 'true');
  const [currentTrackId, setCurrentTrackId] = useState(() => localStorage.getItem('noise_track') || WHITE_NOISE_TRACKS[0].id);
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('noise_volume') || 50));
  const [showMenu, setShowMenu] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const currentTrack = WHITE_NOISE_TRACKS.find(t => t.id === currentTrackId) || WHITE_NOISE_TRACKS[0];

  useEffect(() => {
    localStorage.setItem('noise_enabled', String(isEnabled));
    localStorage.setItem('noise_track', currentTrackId);
    localStorage.setItem('noise_volume', String(volume));

    if (isEnabled) {
      startNoise();
    } else {
      stopNoise();
    }

    return () => stopNoise();
  }, [isEnabled, currentTrackId]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  const startNoise = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    stopNoise();

    const bufferSize = 2 * audioContextRef.current.sampleRate;
    const noiseBuffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      if (currentTrackId === 'rain') {
        output[i] = (Math.random() * 2 - 1) * 0.15;
      } else if (currentTrackId === 'waves') {
        output[i] = (Math.random() * 2 - 1) * 0.1 * Math.sin(i / 10000);
      } else {
        output[i] = (Math.random() * 2 - 1) * 0.1;
      }
    }

    sourceRef.current = audioContextRef.current.createBufferSource();
    sourceRef.current.buffer = noiseBuffer;
    sourceRef.current.loop = true;

    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.gain.value = volume / 100;

    sourceRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioContextRef.current.destination);
    
    sourceRef.current.start();
  };

  const stopNoise = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (e) {}
      sourceRef.current = null;
    }
  };

  const handleMainButtonClick = () => {
    if (!isEnabled) {
      // 1st Click Logic: Enable + Show Menu
      setIsEnabled(true);
      setShowMenu(true);
    } else {
      // 2nd Click Logic: Disable (Mute) + Toggle Menu if already open or hide
      setIsEnabled(false);
      setShowMenu(false);
    }
  };

  const handleTrackSelect = (trackId: string) => {
    if (currentTrackId === trackId && isEnabled) {
      setIsEnabled(false);
    } else {
      setCurrentTrackId(trackId);
      setIsEnabled(true);
    }
  };

  return (
    <div className="fixed bottom-24 md:bottom-8 right-8 z-50">
      {showMenu && (
        <div className="absolute bottom-16 right-0 bg-earth-bg border border-earth-border rounded-lg shadow-xl p-4 w-64 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="flex justify-between items-center mb-4 px-1">
            <h4 className="text-xs font-bold text-earth-text-sec uppercase tracking-wider">Ambient Flow</h4>
            <div className="flex gap-2">
              {isEnabled && (
                <button 
                  onClick={() => setIsEnabled(false)}
                  className="text-[10px] font-bold text-earth-danger hover:underline"
                >
                  MUTE
                </button>
              )}
              <button onClick={() => setShowMenu(false)} className="text-earth-text-sec hover:text-earth-text">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          </div>
          
          <div className="space-y-1.5 mb-4">
            {WHITE_NOISE_TRACKS.map(track => (
              <button
                key={track.id}
                onClick={() => handleTrackSelect(track.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-all ${currentTrackId === track.id && isEnabled ? 'bg-earth-accent text-white shadow-sm' : 'hover:bg-earth-card text-earth-text'}`}
              >
                <span className="flex items-center">
                  <span className="mr-3 text-lg">{track.icon}</span>
                  <span className="font-medium">{track.name}</span>
                </span>
                {currentTrackId === track.id && isEnabled && (
                  <div className="flex items-end gap-0.5 h-3">
                    <div className="w-0.5 bg-white animate-[bounce_0.6s_infinite] h-full"></div>
                    <div className="w-0.5 bg-white animate-[bounce_0.8s_infinite] h-2/3"></div>
                    <div className="w-0.5 bg-white animate-[bounce_0.7s_infinite] h-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-earth-border space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-earth-text-sec uppercase">Volume</span>
              <span className="text-[10px] text-earth-text font-mono">{volume}%</span>
            </div>
            <input 
              type="range" 
              min="0" max="100" 
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-earth-accent h-1.5 bg-earth-border rounded-lg appearance-none cursor-pointer" 
            />
          </div>
        </div>
      )}
      
      <div className="flex flex-col items-center gap-2">
        {isEnabled && (
          <div className="bg-earth-accent text-white text-[10px] px-2 py-1 rounded-full animate-in fade-in slide-in-from-right-2 font-bold shadow-sm">
            {currentTrack.name}
          </div>
        )}
        <button 
          onClick={handleMainButtonClick}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${isEnabled ? 'bg-earth-accent text-white ring-4 ring-earth-accent/20' : 'bg-earth-card text-earth-text-sec border border-earth-border'}`}
          aria-label={isEnabled ? "Mute audio" : "Enable white noise and select track"}
        >
          {isEnabled ? (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M18.364 18.364L5.636 5.636"></path></svg>
          )}
        </button>
      </div>
    </div>
  );
};

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-earth-bg text-earth-text pb-16 md:pb-0">
      <TopNav onLogout={() => {}} />
      <div className="flex flex-1">
        <DesktopSidebar />
        <main className="flex-1 overflow-x-hidden p-6 max-w-7xl mx-auto w-full relative">
          {children}
          <WhiteNoiseWidget />
        </main>
      </div>
      <MobileNav />
    </div>
  );
};
