
import React, { useState, useEffect, useRef } from 'react';
import { Button, Toggle, Badge } from '../Common';
import { MediaPreferences, PermissionSaveOptions } from '../../hooks/useEntryPermissions';

interface EntryPermissionModalProps {
  roomId: string;
  onJoin: (opts: PermissionSaveOptions) => Promise<void>;
  onCancel: () => void;
}

export const EntryPermissionModal: React.FC<EntryPermissionModalProps> = ({ roomId, onJoin, onCancel }) => {
  const [camera, setCamera] = useState(true);
  const [mic, setMic] = useState(true);
  const [rememberRoom, setRememberRoom] = useState(false);
  const [rememberGlobal, setRememberGlobal] = useState(false);
  
  // Task state
  const [tasks, setTasks] = useState<string[]>([]);
  const [taskInput, setTaskInput] = useState('');
  
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<'denied' | 'not-found' | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    const focusableElements = modalRef.current?.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
    if (focusableElements && focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }, []);

  const handleAddTask = () => {
    if (taskInput.trim()) {
      setTasks([...tasks, taskInput.trim()]);
      setTaskInput('');
    }
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleJoin = async () => {
    setIsRequesting(true);
    setError(null);
    try {
      await onJoin({ camera, mic, rememberRoom, rememberGlobal, initialTasks: tasks });
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('not-found');
      } else {
        setError('denied');
      }
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-earth-text/60 backdrop-blur-md animate-in fade-in duration-500" onClick={onCancel}></div>
      
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="perm-title"
        className="relative bg-white w-full max-w-[560px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 flex flex-col max-h-[90vh]"
      >
        <div className="px-10 py-8 border-b border-earth-border bg-earth-bg/30">
          <h2 id="perm-title" className="text-2xl font-black text-earth-text tracking-tight mb-2 uppercase tracking-tighter">Preparing Session</h2>
          <p className="text-sm text-earth-text-sec leading-relaxed">
            Configure your focus tools and privacy settings before entering the room.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
          {/* Tasks Section */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-[0.2em] px-1">Session Goals (+0.5 pts each)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="What are you working on?" 
                className="flex-1 bg-earth-bg border border-earth-border rounded-2xl px-5 py-3 text-sm font-bold focus:border-earth-accent outline-none transition-all"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTask())}
              />
              <button 
                onClick={handleAddTask}
                className="w-12 h-12 bg-earth-accent text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3" /></svg>
              </button>
            </div>
            {tasks.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {tasks.map((task, i) => (
                  <div key={i} className="flex items-center gap-2 bg-earth-accent/10 border border-earth-accent/20 px-3 py-1.5 rounded-xl group animate-in zoom-in">
                    <span className="text-xs font-bold text-earth-accent">{task}</span>
                    <button onClick={() => removeTask(i)} className="text-earth-accent/40 hover:text-earth-danger">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-earth-text-sec italic px-1 opacity-50">No tasks set. You can also add them inside the room.</p>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-[0.2em] px-1">Media Permissions</label>
            <div className="flex items-center justify-between p-5 bg-earth-bg rounded-[1.5rem] border border-earth-border transition-all hover:border-earth-accent/30">
              <div className="flex-1">
                <p className="text-sm font-black text-earth-text uppercase tracking-widest">Enable camera</p>
                <p className="text-[11px] text-earth-text-sec">Live video feed for accountability.</p>
              </div>
              <Toggle enabled={camera} onChange={() => setCamera(!camera)} aria-label="Camera toggle" />
            </div>

            <div className="flex items-center justify-between p-5 bg-earth-bg rounded-[1.5rem] border border-earth-border transition-all hover:border-earth-accent/30">
              <div className="flex-1">
                <p className="text-sm font-black text-earth-text uppercase tracking-widest">Enable microphone</p>
                <p className="text-[11px] text-earth-text-sec">Voice communication if needed.</p>
              </div>
              <Toggle enabled={mic} onChange={() => setMic(!mic)} aria-label="Microphone toggle" />
            </div>
          </div>

          {/* Persistence */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={rememberRoom}
                onChange={() => setRememberRoom(!rememberRoom)}
                className="w-4 h-4 accent-earth-accent rounded"
              />
              <span className="text-[11px] font-bold text-earth-text-sec group-hover:text-earth-text uppercase tracking-widest">Remember choice for this room</span>
            </label>

            {(camera || mic) && (
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={rememberGlobal}
                  onChange={() => setRememberGlobal(!rememberGlobal)}
                  className="w-4 h-4 accent-earth-accent rounded"
                />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-earth-text-sec group-hover:text-earth-text uppercase tracking-widest">Always apply globally</span>
                  <p className="text-[9px] text-earth-warning font-black uppercase tracking-tighter mt-0.5">Customizable in Settings</p>
                </div>
              </label>
            )}
          </div>

          {/* Error Feedback */}
          {error && (
            <div className="p-5 bg-earth-danger/5 border border-earth-danger/20 rounded-[1.5rem] animate-in fade-in slide-in-from-top-2">
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 text-earth-danger mt-0.5">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-earth-danger uppercase tracking-widest mb-1">
                    {error === 'denied' ? 'Permission Denied' : 'Device Not Found'}
                  </p>
                  <p className="text-[11px] text-earth-text-sec leading-relaxed">
                    {error === 'denied' 
                      ? 'Your browser blocked access. Please check your address bar to allow media.' 
                      : 'Could not find the selected hardware. Ensure your devices are connected.'}
                  </p>
                  <div className="flex gap-4 mt-4">
                    <button onClick={handleJoin} className="text-[10px] font-black uppercase tracking-widest text-earth-accent hover:underline underline-offset-4">Retry</button>
                    <button onClick={() => onJoin({ camera: false, mic: false })} className="text-[10px] font-black uppercase tracking-widest text-earth-text-sec hover:underline underline-offset-4">Join Without Media</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-earth-card border-t border-earth-border flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="flex-1 font-black uppercase tracking-widest h-14 rounded-2xl" onClick={onCancel} disabled={isRequesting}>
            Cancel
          </Button>
          <Button variant="primary" className="flex-1 font-black uppercase tracking-widest shadow-lg h-14 rounded-2xl" onClick={handleJoin} isLoading={isRequesting}>
            Enter Flow
          </Button>
        </div>
      </div>
    </div>
  );
};
