
import React from 'react';

interface Partner {
  name: string;
  avatar: string;
  profession: string;
  age: number;
  bio: string;
}

export const PartnerCard: React.FC<{ partner: Partner }> = ({ partner }) => {
  return (
    <div className="relative group">
      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl p-2.5 rounded-2xl border border-white/20 shadow-xl transition-all hover:bg-white/20">
        <img 
          src={partner.avatar} 
          className="w-10 h-10 rounded-full border-2 border-white/30 shadow-sm" 
          alt={partner.name} 
        />
        <div className="hidden sm:block">
          <p className="text-[9px] font-black text-earth-text/50 uppercase tracking-[0.2em]">Flowing With</p>
          <p className="text-[13px] font-black text-earth-text">{partner.name}</p>
        </div>
        <button className="text-earth-text/30 hover:text-earth-accent transition-colors ml-1" aria-label="Favorite partner">
           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        </button>
      </div>
      
      {/* Expanded Hover Tooltip */}
      <div className="absolute top-14 left-0 w-72 bg-white/95 backdrop-blur-2xl border border-earth-border rounded-2xl p-5 shadow-2xl opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 pointer-events-none z-50">
        <p className="text-xs font-black text-earth-text mb-2 uppercase tracking-widest">{partner.profession} / {partner.age} / 2,400h</p>
        <p className="text-[12px] text-earth-text-sec leading-relaxed italic">"{partner.bio}"</p>
      </div>
    </div>
  );
};
