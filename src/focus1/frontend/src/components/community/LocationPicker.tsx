
import React from 'react';

interface LocationPickerProps {
  onSelect: (name: string) => void;
  onClose: () => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ onSelect, onClose }) => {
  const LOCATIONS = [
    { name: 'Starbucks Reserve', sub: 'Downtown' },
    { name: 'Public Library', sub: 'Central Branch' },
    { name: 'WeWork Labs', sub: 'Tech District' },
    { name: 'Campus Study Hall', sub: 'University Area' }
  ];

  return (
    <div className="absolute inset-x-0 bottom-[80px] bg-white border-t border-earth-border p-6 shadow-2xl animate-in slide-in-from-bottom-5 duration-300 z-50">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-earth-text">Set Location</h4>
        <button onClick={onClose} className="text-earth-text-sec hover:text-earth-danger p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg>
        </button>
      </div>
      <div className="space-y-3">
        {LOCATIONS.map(loc => (
          <button 
            key={loc.name}
            onClick={() => onSelect(loc.name)}
            className="w-full text-left p-3 hover:bg-earth-bg rounded-xl border border-transparent hover:border-earth-border transition-all flex items-center gap-3 group"
          >
            <div className="w-8 h-8 rounded-full bg-earth-warning/10 text-earth-warning flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-earth-text leading-tight">{loc.name}</p>
              <p className="text-[10px] text-earth-text-sec uppercase font-bold tracking-tighter">{loc.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
