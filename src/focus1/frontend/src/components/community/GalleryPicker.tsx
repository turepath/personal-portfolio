
import React from 'react';

interface GalleryPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export const GalleryPicker: React.FC<GalleryPickerProps> = ({ onSelect, onClose }) => {
  return (
    <div className="absolute inset-x-0 bottom-[80px] bg-white border-t border-earth-border p-6 shadow-2xl animate-in slide-in-from-bottom-5 duration-300 z-50">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-earth-text">Select Media</h4>
        <button onClick={onClose} className="text-earth-text-sec hover:text-earth-danger p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg>
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <button 
            key={i} 
            onClick={() => onSelect(`https://picsum.photos/seed/gal-${i}/400/400`)}
            className="aspect-square rounded-lg overflow-hidden border border-earth-border hover:opacity-80 transition-opacity"
          >
            <img src={`https://picsum.photos/seed/gal-${i}/200/200`} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};
