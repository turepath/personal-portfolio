
import React, { useState, useEffect, useRef } from 'react';
import { QuickPreferences, RoomChoice, usePreferences } from '../hooks/usePreferences';
import { Toggle, Button } from './Common';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (prefs: QuickPreferences) => void;
}

const OPTIONS: { id: RoomChoice; label: string; description: string }[] = [
  { 
    id: 'duo_avatar', 
    label: '1:1 (effects allowed)', 
    description: 'Direct focus with one partner. Virtual backgrounds and avatars supported.'
  },
  { 
    id: 'group_avatar', 
    label: '1:Many (effects allowed)', 
    description: 'Library-style community study. Express yourself with effects.'
  },
  { 
    id: 'random', 
    label: 'Random', 
    description: 'Jump into any of the primary room types (1:1 or 1:Many, Avatar or Authentic).'
  },
];

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose, onSave }) => {
  const { preferences, savePreferences } = usePreferences();
  const [localPrefs, setLocalPrefs] = useState<QuickPreferences>(preferences);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setLocalPrefs(preferences);
  }, [isOpen, preferences]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    savePreferences(localPrefs);
    if (onSave) onSave(localPrefs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>

      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative bg-earth-bg w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-earth-border flex justify-between items-center bg-earth-card sticky top-0 z-10">
          <div>
            <h3 id="modal-title" className="text-lg font-bold text-earth-text">Quick Preferences</h3>
            <p className="text-[10px] text-earth-text-sec uppercase font-bold tracking-wider">Focus Now configuration</p>
          </div>
          <button onClick={onClose} className="text-earth-text-sec hover:text-earth-danger p-2 rounded-full hover:bg-earth-border transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto scrollbar-hide">
          <p className="text-sm text-earth-text-sec leading-relaxed text-center">
            Choose your preferred room type. These preferences will be used by <span className="text-earth-accent font-bold">“Focus Now”</span> to find your workspace.
          </p>

          <div className="space-y-3">
            <label className="text-xs font-black text-earth-text uppercase tracking-widest block mb-4">Preferred Session Type</label>
            <div className="grid grid-cols-1 gap-2.5">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setLocalPrefs({ ...localPrefs, roomChoice: opt.id })}
                  className={`flex flex-col gap-1 p-4 rounded-xl border transition-all text-left group ${
                    localPrefs.roomChoice === opt.id 
                      ? 'border-earth-accent bg-earth-accent/5 ring-1 ring-earth-accent/20' 
                      : 'border-earth-border bg-earth-card hover:bg-white hover:border-earth-accent/30'
                  }`}
                  aria-checked={localPrefs.roomChoice === opt.id}
                  role="radio"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${localPrefs.roomChoice === opt.id ? 'text-earth-accent' : 'text-earth-text'}`}>
                      {opt.label}
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${localPrefs.roomChoice === opt.id ? 'border-earth-accent bg-earth-accent' : 'border-earth-border'}`}>
                      {localPrefs.roomChoice === opt.id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                    </div>
                  </div>
                  <p className="text-[11px] text-earth-text-sec leading-tight opacity-75">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-earth-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-earth-text">Virtual/Avatar Effects</p>
                <p className="text-[10px] text-earth-text-sec">Enabled for all Avatar-supported rooms.</p>
              </div>
              <Toggle 
                enabled={localPrefs.effectsEnabled}
                onChange={() => setLocalPrefs({ ...localPrefs, effectsEnabled: !localPrefs.effectsEnabled })}
              />
            </div>
            
            <div className="bg-earth-card p-3 rounded-xl border border-earth-border flex items-center gap-4">
               <div className="relative w-12 h-12 rounded-lg bg-black overflow-hidden flex items-center justify-center shrink-0">
                  {localPrefs.effectsEnabled ? (
                    <div className="text-2xl animate-bounce duration-[3s]">🦊</div>
                  ) : (
                    <img src="https://picsum.photos/seed/alex-tiny/100/100" className="w-full h-full object-cover" alt="Preview" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <span className="absolute bottom-0.5 left-1 text-[6px] font-black text-white uppercase tracking-tighter">Preview</span>
               </div>
               <div className="flex-1">
                  <p className="text-[10px] font-bold text-earth-text leading-tight">Live Visual Check</p>
                  <p className="text-[9px] text-earth-text-sec">Your setup is ready for the flow state.</p>
               </div>
            </div>
          </div>

          <label className="flex items-center gap-3 p-1 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded accent-earth-accent cursor-pointer"
              checked={localPrefs.saveAsDefault}
              onChange={() => setLocalPrefs({ ...localPrefs, saveAsDefault: !localPrefs.saveAsDefault })}
            />
            <span className="text-xs text-earth-text-sec group-hover:text-earth-text transition-colors font-medium">Save these choices as my new standard</span>
          </label>
        </div>

        <div className="p-6 border-t border-earth-border flex gap-3 bg-earth-card sticky bottom-0 z-10">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="primary" className="flex-1 shadow-lg" onClick={handleSave}>Save Preference</Button>
        </div>
      </div>
    </div>
  );
};
