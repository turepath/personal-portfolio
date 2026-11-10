
import React, { useState } from 'react';
import { Toggle, Badge } from '../Common';

interface NotificationsPanelProps {
  settings: any;
  onChange: (delta: any) => void;
  onReset: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ settings, onChange, onReset }) => {
  const notif = settings.notifications;
  const [isPlaying, setIsPlaying] = useState(false);

  const playSample = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 800);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-earth-text">Notifications & Reminders</h3>
          <p className="text-earth-text-sec text-sm">Balanced accountability without interruption.</p>
        </div>
        <button onClick={onReset} className="text-xs font-bold text-earth-accent hover:underline">Reset to defaults</button>
      </div>

      <section className="space-y-6">
        <div className="p-4 bg-earth-card rounded-xl border border-earth-border flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-earth-text">Focus-time Do-Not-Disturb</p>
            <p className="text-xs text-earth-text-sec">Silence system alerts automatically during focus sessions.</p>
          </div>
          <Toggle 
            enabled={notif.dndEnabled} 
            onChange={() => onChange({ notifications: { ...notif, dndEnabled: !notif.dndEnabled } })}
            aria-label="Global DND toggle"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-earth-text mb-3">Rest Reminder Style</label>
          <div className="flex flex-col sm:flex-row gap-3">
            {['Visual', 'Sound', 'Off'].map(type => (
              <label 
                key={type} 
                className={`flex-1 flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${notif.restReminder === type ? 'border-earth-accent bg-earth-accent/5' : 'border-earth-border bg-earth-card hover:bg-earth-card-alt'}`}
              >
                <input 
                  type="radio" 
                  className="w-4 h-4 text-earth-accent focus:ring-earth-accent border-earth-border"
                  checked={notif.restReminder === type}
                  onChange={() => onChange({ notifications: { ...notif, restReminder: type } })}
                />
                <span className="text-sm font-medium">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-earth-text mb-1">Rest Interval</label>
            <p className="text-xs text-earth-text-sec mb-2">Remind every X minutes</p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={notif.restFrequency}
              onChange={(e) => onChange({ notifications: { ...notif, restFrequency: parseInt(e.target.value) } })}
              className="w-16 bg-earth-card border border-earth-border rounded px-2 py-1 text-sm text-center font-bold"
            />
            <span className="text-xs text-earth-text-sec font-bold">MIN</span>
          </div>
        </div>

        {notif.restReminder === 'Sound' && (
          <div className="p-3 bg-earth-bg border border-earth-border rounded-lg flex items-center justify-between">
             <div className="flex items-center gap-3">
                <button 
                  onClick={playSample}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-earth-accent text-white scale-110' : 'bg-earth-card text-earth-text-sec hover:text-earth-text'}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
                <span className="text-xs font-medium">Soft Chime (Sample)</span>
             </div>
             <input type="range" className="w-24 accent-earth-accent h-1" aria-label="Sample volume" />
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-earth-text mb-3">Task Due Reminders</label>
          <div className="space-y-2">
            {['Immediate', '30 min before', '1 hour before'].map(opt => (
              <button
                key={opt}
                onClick={() => onChange({ notifications: { ...notif, taskDueReminder: opt } })}
                className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${notif.taskDueReminder === opt ? 'border-earth-accent bg-earth-accent/5' : 'border-earth-border bg-earth-card'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Preview */}
        <div className="mt-8 pt-6 border-t border-earth-border">
          <p className="text-[10px] font-bold text-earth-text-sec uppercase tracking-widest mb-4 text-center">Notification Preview</p>
          <div className="max-w-xs mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-earth-border p-3 flex gap-3 animate-bounce">
            <div className="w-10 h-10 bg-earth-accent rounded-lg flex items-center justify-center text-white font-bold">F</div>
            <div>
              <p className="text-xs font-bold text-earth-text">Time for a break!</p>
              <p className="text-[10px] text-earth-text-sec">You've focused for {notif.restFrequency} minutes.</p>
            </div>
            <button className="ml-auto text-earth-text-sec">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
