
import React, { useState } from 'react';
import { Friend } from '../../hooks/useChat';
import { FriendRow } from './FriendRow';

interface MessagesPanelProps {
  friends: Friend[];
  onFriendSelect: (id: string) => void;
  onSearchAccount: (query: string) => void;
}

export const MessagesPanel: React.FC<MessagesPanelProps> = ({ friends, onFriendSelect, onSearchAccount }) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    onSearchAccount(searchInput.trim());
    setSearchInput('');
  };

  return (
    <div className="bg-post-card-bg rounded-2xl border border-post-card-border overflow-hidden h-full flex flex-col shadow-sm">
      <div className="p-6 border-b border-earth-border bg-earth-bg/30">
        {/* User Search Input */}
        <div className="relative mb-6 group">
           <input 
            type="text" 
            placeholder="Search by Email or Account ID..." 
            className="w-full bg-white border border-earth-border rounded-2xl px-12 py-3 text-xs focus:ring-1 focus:ring-earth-accent outline-none shadow-inner transition-all"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
           />
           <svg className="w-5 h-5 absolute left-4 top-3 text-earth-text-sec group-focus-within:text-earth-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
           </svg>
           {searchInput && (
             <button onClick={handleSearch} className="absolute right-4 top-3 text-[10px] font-black text-earth-accent uppercase tracking-widest hover:underline">
               Find
             </button>
           )}
        </div>

        {/* Quick Counters */}
        <div className="grid grid-cols-3 gap-3">
           <button className="flex flex-col items-center gap-1 group">
              <div className="relative">
                 <div className="w-10 h-10 bg-earth-accent/10 rounded-xl flex items-center justify-center text-earth-accent group-hover:bg-earth-accent group-hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeWidth="2.5"/></svg>
                 </div>
                 <span className="absolute -top-1 -right-1 bg-earth-danger text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white">12</span>
              </div>
              <span className="text-[9px] font-black uppercase text-earth-text-sec">Likes</span>
           </button>
           <button className="flex flex-col items-center gap-1 group">
              <div className="w-10 h-10 bg-earth-warning/10 rounded-xl flex items-center justify-center text-earth-warning group-hover:bg-earth-warning group-hover:text-white transition-all">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeWidth="2.5"/></svg>
              </div>
              <span className="text-[9px] font-black uppercase text-earth-text-sec">Saved</span>
           </button>
           <button className="flex flex-col items-center gap-1 group">
              <div className="w-10 h-10 bg-earth-success/10 rounded-xl flex items-center justify-center text-earth-success group-hover:bg-earth-success group-hover:text-white transition-all">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" strokeWidth="2.5"/></svg>
              </div>
              <span className="text-[9px] font-black uppercase text-earth-text-sec">Fans</span>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide py-2 px-3 space-y-1">
         <h4 className="px-3 py-3 text-[10px] font-black text-earth-text uppercase tracking-widest opacity-40">Messages</h4>
         {friends.map(friend => (
            <FriendRow 
              key={friend.id} 
              friend={friend} 
              onClick={() => onFriendSelect(friend.id)} 
            />
         ))}
      </div>
    </div>
  );
};
