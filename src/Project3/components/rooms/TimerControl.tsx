
import React from 'react';

interface TimerControlProps {
  seconds: number;
  onPresetSelect: (minutes: number) => void;
}

export const TimerControl: React.FC<TimerControlProps> = ({ seconds, onPresetSelect }) => {
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="group relative">
        <button className="text-3xl font-mono font-bold text-earth-text tabular-nums tracking-[0.2em] bg-white/20 px-8 py-2 rounded-full border border-white/20 shadow-2xl hover:scale-105 transition-all">
          {formatTime(seconds)}
        </button>
        {/* Timer Presets Overlay */}
        <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-black/60 backdrop-blur-2xl p-3 rounded-2xl border border-white/10 shadow-2xl z-20">
          {[25, 45, 75].map(t => (
            <button 
              key={t} 
              onClick={() => onPresetSelect(t)} 
              className="text-[11px] font-black text-white hover:text-earth-accent uppercase tracking-[0.2em] whitespace-nowrap px-2 py-1 rounded hover:bg-white/10 transition-colors"
            >
              {t}M
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
