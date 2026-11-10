
import React, { useState } from 'react';

interface TagsPickerProps {
  selectedTags: string[];
  onToggle: (tag: string) => void;
  onClose: () => void;
}

const SUGGESTIONS = ['DeepWork', 'StudyBuddy', 'Pomodoro', 'UIUX', 'Coding', 'Research', 'ExamWeek', 'LanguageLearning'];

export const TagsPicker: React.FC<TagsPickerProps> = ({ selectedTags, onToggle, onClose }) => {
  const [customTag, setCustomTag] = useState('');

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTag.trim()) {
      onToggle(customTag.trim());
      setCustomTag('');
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-[80px] bg-white border-t border-earth-border p-6 shadow-2xl animate-in slide-in-from-bottom-5 duration-300 z-50">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-earth-text">Add Tags</h4>
        <button onClick={onClose} className="text-earth-text-sec hover:text-earth-danger p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg>
        </button>
      </div>
      <form onSubmit={handleAddCustom} className="mb-4">
        <input 
          type="text" 
          placeholder="Type a custom tag and press Enter..." 
          className="w-full bg-earth-bg border border-earth-border rounded-lg px-3 py-2 text-sm outline-none focus:border-earth-accent"
          value={customTag}
          onChange={(e) => setCustomTag(e.target.value)}
        />
      </form>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map(tag => (
          <button 
            key={tag}
            onClick={() => onToggle(tag)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${selectedTags.includes(tag) ? 'bg-earth-accent text-white' : 'bg-earth-card hover:bg-earth-accent/10 hover:text-earth-accent'}`}
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
};
