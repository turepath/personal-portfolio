
import React, { useState } from 'react';
import { Button } from '../Common';

interface AccountSecurityPanelProps {
  settings: any;
  onChange: (delta: any) => void;
  onReset: () => void;
}

export const AccountSecurityPanel: React.FC<AccountSecurityPanelProps> = ({ settings, onChange, onReset }) => {
  const account = settings.account || { displayName: 'Alex Rivera', bio: 'Flow state enthusiast.' };
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });

  const getPasswordStrength = () => {
    if (password.next.length === 0) return 0;
    if (password.next.length < 6) return 1;
    if (password.next.length < 10) return 2;
    return 3;
  };

  const strengthColors = ['bg-earth-border', 'bg-earth-danger', 'bg-earth-warning', 'bg-earth-success'];
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-earth-text">Account & Security</h3>
          <p className="text-earth-text-sec text-sm">Manage your profile and protect your credentials.</p>
        </div>
        <button onClick={onReset} className="text-xs font-bold text-earth-accent hover:underline">Reset profile</button>
      </div>

      <section className="space-y-8">
        {/* Profile */}
        <div className="space-y-4">
          <label className="block text-xs font-bold text-earth-text-sec uppercase tracking-widest">Public Profile</label>
          <div className="flex items-center gap-6 p-6 bg-earth-card rounded-xl border border-earth-border">
            <div className="relative group cursor-pointer">
              <img src="https://picsum.photos/seed/alex/150/150" className="w-20 h-20 rounded-full border-2 border-earth-border group-hover:opacity-70 transition-opacity" alt="Avatar" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <svg className="w-6 h-6 text-earth-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <input 
                type="text" 
                value={account.displayName} 
                onChange={(e) => onChange({ account: { ...account, displayName: e.target.value } })}
                className="w-full bg-earth-bg border border-earth-border rounded-lg p-2 text-sm focus:border-earth-accent outline-none font-bold"
                placeholder="Display Name"
                aria-label="Display Name"
              />
              <textarea 
                value={account.bio} 
                onChange={(e) => onChange({ account: { ...account, bio: e.target.value } })}
                className="w-full bg-earth-bg border border-earth-border rounded-lg p-2 text-xs focus:border-earth-accent outline-none resize-none h-20"
                placeholder="Bio (Short description of yourself)"
                maxLength={160}
                aria-label="Bio"
              />
              <div className="text-right">
                 <span className="text-[10px] text-earth-text-sec font-mono">{(account.bio || '').length}/160</span>
              </div>
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-4">
           <label className="block text-xs font-bold text-earth-text-sec uppercase tracking-widest">Security</label>
           <div className="p-6 bg-earth-card rounded-xl border border-earth-border space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <input type="password" placeholder="Current Password" className="bg-earth-bg border border-earth-border rounded-lg p-2 text-sm focus:border-earth-accent outline-none" aria-label="Current Password" />
                 <div className="space-y-2">
                    <input 
                      type="password" 
                      placeholder="New Password" 
                      className="w-full bg-earth-bg border border-earth-border rounded-lg p-2 text-sm focus:border-earth-accent outline-none" 
                      onChange={(e) => setPassword({ ...password, next: e.target.value })}
                      aria-label="New Password"
                    />
                    <div className="h-1 w-full bg-earth-border rounded-full flex gap-1 overflow-hidden">
                       <div className={`h-full transition-all duration-500 ${strengthColors[getPasswordStrength()]}`} style={{ width: `${(getPasswordStrength()/3)*100}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-earth-text-sec">{strengthLabels[getPasswordStrength()]}</span>
                 </div>
              </div>
              <Button variant="primary" className="w-full sm:w-auto text-xs py-2 px-6">Update Password</Button>
           </div>
        </div>

        {/* Login Device Management */}
        <div className="space-y-4">
           <label className="block text-xs font-bold text-earth-text-sec uppercase tracking-widest">Active Sessions</label>
           <div className="space-y-3">
              {[
                { name: 'MacBook Pro 14', ip: '192.168.1.1', last: 'Now', current: true },
                { name: 'iPhone 15', ip: '172.56.2.1', last: '2h ago', current: false },
              ].map((device, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-earth-card rounded-xl border border-earth-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-earth-bg rounded-lg flex items-center justify-center text-earth-text-sec">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                         <span className="text-sm font-bold text-earth-text">{device.name}</span>
                         {device.current && <span className="text-[8px] bg-earth-success/10 text-earth-success px-1.5 py-0.5 rounded font-bold uppercase">Current</span>}
                      </div>
                      <p className="text-[10px] text-earth-text-sec">{device.ip} • {device.last}</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-earth-danger hover:underline">Revoke</button>
                </div>
              ))}
              <button className="w-full py-3 text-xs font-bold text-earth-text-sec hover:text-earth-danger border border-dashed border-earth-border rounded-xl transition-colors">Sign out all other devices</button>
           </div>
        </div>
      </section>
    </div>
  );
};
