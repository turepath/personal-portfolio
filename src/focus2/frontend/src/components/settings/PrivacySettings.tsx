
import React from 'react';
import { useEntryPermissions } from '../../hooks/useEntryPermissions';
import { Button, Badge } from '../Common';

export const PrivacySettings: React.FC = () => {
  const { clearAll } = useEntryPermissions();

  const handleReset = () => {
    if (confirm('This will clear all saved room and global media preferences. You will be asked for permission again upon next entry.')) {
      clearAll();
      alert('Permissions reset successfully.');
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-xl font-bold text-earth-text">Privacy & Security</h3>
        <p className="text-earth-text-sec text-sm">Manage hardware access and saved room preferences.</p>
      </div>

      <section className="space-y-6">
        <div className="p-6 bg-earth-card rounded-xl border border-earth-border">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-earth-text">Media Permission History</p>
              <p className="text-xs text-earth-text-sec">Clear remembered "Join Room" choices for camera and microphone.</p>
            </div>
            <Badge color="neutral">Active Persistence</Badge>
          </div>
          
          <div className="bg-earth-bg p-4 rounded-lg border border-earth-border mb-6">
            <p className="text-[11px] text-earth-text leading-relaxed">
              When you select "Remember my choice" while joining a room, we save your preference locally to speed up your next session. Revoking this will restore the permission dialog.
            </p>
          </div>

          <Button variant="danger" className="w-full sm:w-auto px-8" onClick={handleReset}>
            Reset All Media Preferences
          </Button>
        </div>

        <div className="space-y-4">
           <label className="block text-xs font-bold text-earth-text-sec uppercase tracking-widest">Global Hardware Check</label>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-earth-border rounded-xl bg-earth-card flex items-center gap-3">
                 <div className="w-10 h-10 bg-earth-accent/10 rounded-full flex items-center justify-center text-earth-accent">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14" strokeWidth="2"/></svg>
                 </div>
                 <div className="flex-1">
                    <p className="text-xs font-bold text-earth-text">Camera Privacy</p>
                    <p className="text-[10px] text-earth-text-sec">Hardware indicator enabled</p>
                 </div>
              </div>
              <div className="p-4 border border-earth-border rounded-xl bg-earth-card flex items-center gap-3">
                 <div className="w-10 h-10 bg-earth-accent/10 rounded-full flex items-center justify-center text-earth-accent">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" strokeWidth="2"/></svg>
                 </div>
                 <div className="flex-1">
                    <p className="text-xs font-bold text-earth-text">Mic Encryption</p>
                    <p className="text-[10px] text-earth-text-sec">End-to-end signal processing</p>
                 </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};
