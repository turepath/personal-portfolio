
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MOCK_USER } from '../constants';

const TopHeader: React.FC = () => {
  const location = useLocation();
  // Ensure we only hide on room session pages (e.g. /room/r1), not the rooms list (/rooms)
  const isRoomSession = location.pathname.startsWith('/room/');
  
  if (isRoomSession) return null;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/community', label: 'Community' },
    { to: '/my', label: 'My' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-[var(--header-height)] bg-white/80 backdrop-blur-xl border-b border-earth-border z-[100] flex items-center px-6 md:px-10 justify-between">
      <NavLink to="/" className="flex items-center gap-3 group">
        <div className="w-9 h-9 bg-earth-accent rounded-lg flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">F</div>
        <h1 className="text-earth-text font-black tracking-tighter text-lg hidden sm:block">FocusCompanion</h1>
      </NavLink>

      <div className="flex-1 max-w-3xl px-8 hidden md:flex items-center gap-8">
        <div className="relative flex-1 group">
          <input 
            type="text" 
            placeholder="Search rooms, posts, focus partners..." 
            className="w-full bg-earth-bg border border-earth-border rounded-full py-2.5 px-11 text-sm focus:outline-none focus:border-earth-accent transition-all"
          />
          <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-earth-text-sec group-hover:text-earth-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        
        <nav className="flex items-center gap-1">
          {navLinks.map(link => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              className={({ isActive }) => `px-4 py-2 text-[13px] font-black uppercase tracking-widest transition-all rounded-lg ${isActive ? 'text-earth-accent bg-earth-accent/5' : 'text-earth-text-sec hover:text-earth-text hover:bg-earth-bg'}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <button className="p-2 text-earth-text-sec hover:text-earth-accent relative hidden sm:block transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-earth-danger rounded-full ring-2 ring-white"></span>
          </button>
          
          <NavLink to="/settings" className={({ isActive }) => `p-2 hidden sm:block transition-all hover:scale-110 ${isActive ? 'text-earth-accent' : 'text-earth-text-sec hover:text-earth-accent'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </NavLink>
        </div>
        
        <NavLink to="/my" className="flex items-center gap-3 p-1 rounded-full hover:bg-earth-bg transition-all group">
          <img src={MOCK_USER.avatar} alt="User" className="w-9 h-9 rounded-full border border-earth-border shadow-sm group-hover:border-earth-accent" />
          <div className="hidden lg:block pr-2">
            <p className="text-xs font-black text-earth-text leading-none mb-0.5">{MOCK_USER.name}</p>
            <p className="text-[10px] text-earth-accent font-bold uppercase tracking-tighter">Pro Member</p>
          </div>
        </NavLink>
      </div>
    </header>
  );
};

const MobileTabs: React.FC = () => {
  const location = useLocation();
  // Hide on room session pages
  if (location.pathname.startsWith('/room/')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-earth-border flex items-center justify-around z-[100] md:hidden">
      {[
        { to: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { to: '/rooms', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
        { to: '/community', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857' },
        { to: '/my', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0z' }
      ].map((link, idx) => (
        <NavLink
          key={idx}
          to={link.to}
          className={({ isActive }) => `p-3 rounded-xl transition-all ${isActive ? 'bg-earth-accent/10 text-earth-accent scale-110' : 'text-earth-text-sec'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon}></path></svg>
        </NavLink>
      ))}
    </nav>
  );
};

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Only apply session layout (no header padding) on specific session pages
  const isRoomSession = location.pathname.startsWith('/room/');

  return (
    <div className="min-h-screen flex flex-col bg-earth-bg text-earth-text">
      <TopHeader />
      <main className={`flex-1 flex flex-col ${isRoomSession ? 'pt-0' : 'pt-[var(--header-height)]'}`}>
        <div className={`flex-1 flex flex-col ${isRoomSession ? '' : 'justify-center items-center min-h-[calc(100vh-var(--header-height))]'}`}>
          <div className={`${isRoomSession ? 'w-full h-full' : 'w-full max-w-[var(--max-content-width)] p-6 md:p-10 pb-24 md:pb-16'}`}>
            {children}
          </div>
        </div>
      </main>
      <MobileTabs />
    </div>
  );
};
