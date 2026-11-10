
import React from 'react';
import { MOCK_USER } from '../constants';
import { Badge, Button } from '../components/Common';
import { NavLink } from 'react-router-dom';

export const My: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500 w-full max-w-4xl mx-auto">
      <div className="bg-earth-card rounded-xl border border-earth-border overflow-hidden shadow-sm mb-8">
        <div className="h-32 bg-earth-accent/20"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <img src={MOCK_USER.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-earth-bg shadow-md" />
            <div className="flex gap-2">
              <Button variant="secondary" className="px-6 py-1.5 text-xs font-bold uppercase tracking-wider">Edit Profile</Button>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-earth-text">{MOCK_USER.name}</h2>
              {MOCK_USER.isPro && <Badge color="accent">Pro Member</Badge>}
            </div>
            <p className="text-earth-text-sec text-sm mb-6">Productivity enthusiast & Computer Science student.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-earth-bg border border-earth-border p-4 rounded-lg text-center">
                <p className="text-xs text-earth-text-sec uppercase font-bold mb-1 tracking-wider">Points</p>
                <p className="text-xl font-bold text-earth-accent">{MOCK_USER.points}</p>
              </div>
              <div className="bg-earth-bg border border-earth-border p-4 rounded-lg text-center">
                <p className="text-xs text-earth-text-sec uppercase font-bold mb-1 tracking-wider">Focus Time</p>
                <p className="text-xl font-bold text-earth-accent">142h</p>
              </div>
              <div className="bg-earth-bg border border-earth-border p-4 rounded-lg text-center">
                <p className="text-xs text-earth-text-sec uppercase font-bold mb-1 tracking-wider">Sessions</p>
                <p className="text-xl font-bold text-earth-accent">54</p>
              </div>
              <div className="bg-earth-bg border border-earth-border p-4 rounded-lg text-center">
                <p className="text-xs text-earth-text-sec uppercase font-bold mb-1 tracking-wider">Rank</p>
                <p className="text-xl font-bold text-earth-accent">#42</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-bold text-earth-text flex items-center gap-2">
            <svg className="w-5 h-5 text-earth-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Recent Activity
          </h3>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-earth-card p-4 rounded-lg border border-earth-border flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Deep Work Session</p>
                <p className="text-xs text-earth-text-sec">Oct {20+i}, 2024 • 2h 15m</p>
              </div>
              <Badge color="success">+25 pts</Badge>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-earth-text flex items-center gap-2">
            <svg className="w-5 h-5 text-earth-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
            Saved Rooms
          </h3>
          {[1, 2].map(i => (
            <div key={i} className="bg-earth-card p-4 rounded-lg border border-earth-border flex items-center gap-3">
              <div className="w-12 h-12 bg-earth-border rounded overflow-hidden">
                <img src={`https://picsum.photos/seed/room${i}/100/100`} alt="Room" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Saved Room {i}</p>
                <p className="text-xs text-earth-text-sec">15 participants</p>
              </div>
              <button className="text-earth-text-sec hover:text-earth-accent">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
