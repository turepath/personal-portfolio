
import React from 'react';
import { Toggle, Button } from '../Common';

interface PreferencesPanelProps {
  settings: any;
  onChange: (delta: any) => void;
  onReset: () => void;
}

export const PreferencesPanel: React.FC<PreferencesPanelProps> = ({ settings, onChange, onReset }) => {
  const prefs = settings.preferences;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-earth-text">Preferences</h3>
          <p className="text-earth-text-sec text-sm">Fine-tune your daily interactions and data privacy.</p>
        </div>
        <button onClick={onReset} className="text-xs font-bold text-earth-accent hover:underline">Reset to defaults</button>
      </div>

      <section className="space-y-6">
        {/* White Noise */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div>
              <label className="block text-sm font-bold text-earth-text mb-2">White Noise Preset</label>
              <select 
                value={prefs.whiteNoisePreset}
                onChange={(e) => onChange({ preferences: { ...prefs, whiteNoisePreset: e.target.value } })}
                className="w-full bg-earth-card border border-earth-border rounded-lg p-2.5 text-sm"
                aria-label="Default white noise"
              >
                {['None', 'Rain', 'Ocean', 'Cafe', 'Brown noise'].map(p => <option key={p}>{p}</option>)}
              </select>
              <p className="mt-1 text-[10px] text-earth-text-sec">Your preferred background sound for focus sessions.</p>
           </div>
           <div className="flex items-center justify-between p-4 bg-earth-card rounded-xl border border-earth-border">
              <span className="text-sm font-medium">Auto-play on start</span>
              <Toggle 
                enabled={prefs.autoPlayNoise} 
                onChange={() => onChange({ preferences: { ...prefs, autoPlayNoise: !prefs.autoPlayNoise } })}
                aria-label="Auto-play noise"
              />
           </div>
        </div>

        {/* Default Room Type */}
        <div>
           <label className="block text-sm font-bold text-earth-text mb-3">Default Room Type</label>
           <div className="flex gap-2">
              {['1:1', '1:Many', 'Pro'].map(type => (
                <button
                  key={type}
                  onClick={() => onChange({ preferences: { ...prefs, defaultRoomType: type } })}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl border transition-all ${prefs.defaultRoomType === type ? 'border-earth-accent bg-earth-accent text-white shadow-md' : 'bg-earth-card border-earth-border text-earth-text-sec'}`}
                  aria-checked={prefs.defaultRoomType === type}
                  role="radio"
                >
                  {type}
                </button>
              ))}
           </div>
           <p className="mt-2 text-[10px] text-earth-text-sec italic text-center">We will prioritize finding these rooms in your feed.</p>
        </div>

        {/* Data & Privacy */}
        <div className="space-y-4">
           <label className="block text-xs font-bold text-earth-text-sec uppercase tracking-widest">Data & Privacy</label>
           <div className="p-6 bg-earth-card rounded-xl border border-earth-border space-y-5">
              {[
                { id: 'shareAnalytics', label: 'Anonymized Analytics', desc: 'Share usage data to help us improve.', default: false },
                { id: 'personalizedRecommendations', label: 'Personalized Tips', desc: 'Tailored study suggestions based on habits.', default: false },
                { id: 'allowTargetedSuggestions', label: 'Targeted Room Invitations', desc: 'Allow mentors to invite you to sessions.', default: false },
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between">
                   <div>
                      <p className="text-sm font-bold text-earth-text">{item.label}</p>
                      <p className="text-[10px] text-earth-text-sec leading-tight">{item.desc}</p>
                   </div>
                   <Toggle 
                    enabled={prefs.privacy[item.id as keyof typeof prefs.privacy]} 
                    onChange={() => onChange({ preferences: { ...prefs, privacy: { ...prefs.privacy, [item.id]: !prefs.privacy[item.id as keyof typeof prefs.privacy] } } })}
                   />
                </div>
              ))}
           </div>
        </div>

        {/* Import/Export */}
        <div className="grid grid-cols-2 gap-4">
           <button 
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-earth-border rounded-xl hover:bg-earth-card transition-all"
            onClick={() => alert("JSON Export logic triggered. settings.json generated.")}
           >
              <svg className="w-8 h-8 text-earth-accent mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 9l-4-4-4 4m4-4v12"></path></svg>
              <span className="text-xs font-bold uppercase tracking-wider text-earth-text">Export Settings</span>
           </button>
           <button 
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-earth-border rounded-xl hover:bg-earth-card transition-all"
            onClick={() => alert("File picker opened for settings.json")}
           >
              <svg className="w-8 h-8 text-earth-accent mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M8 12l4 4 4-4m-4 4V4"></path></svg>
              <span className="text-xs font-bold uppercase tracking-wider text-earth-text">Import Settings</span>
           </button>
        </div>
      </section>
    </div>
  );
};
