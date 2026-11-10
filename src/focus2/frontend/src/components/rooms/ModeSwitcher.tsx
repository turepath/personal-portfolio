
import React from 'react';

interface ModeSwitcherProps {
  currentMode: 'grid' | 'ring';
  onModeChange: (mode: 'grid' | 'ring') => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="flex bg-black/10 p-1.5 rounded-xl border border-white/10 shadow-inner">
      <button 
        onClick={() => onModeChange('grid')} 
        className={`p-2 rounded-lg transition-all ${currentMode === 'grid' ? 'bg-white text-earth-accent shadow-xl scale-105' : 'text-earth-text/30 hover:text-earth-text'}`}
        aria-label="Grid view"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16m-7 6h7" strokeWidth="2.5" strokeLinecap="round"/></svg>
      </button>
      <button 
        onClick={() => onModeChange('ring')} 
        className={`p-2 rounded-lg transition-all ${currentMode === 'ring' ? 'bg-white text-earth-accent shadow-xl scale-105' : 'text-earth-text/30 hover:text-earth-text'}`}
        aria-label="Ring view"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth="2.5"/></svg>
      </button>
    </div>
  );
};
