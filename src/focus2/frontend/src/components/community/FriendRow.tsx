import React from 'react';
import { Friend } from '../../hooks/useChat';

interface FriendRowProps {
  friend: Friend;
  onClick: () => void;
  onAddFriend: (e: React.MouseEvent, id: string) => void;
}

export const FriendRow: React.FC<FriendRowProps> = ({ friend, onClick, onAddFriend }) => {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-2xl hover:bg-white transition-all cursor-pointer group border border-transparent hover:border-earth-border"
    >
      <div className="relative">
        <img src={friend.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
        {friend.status === 'friend' && (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-earth-success rounded-full ring-2 ring-white"></span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-earth-text truncate">{friend.username}</h3>
          {friend.unreadCount > 0 && (
            <span className="bg-earth-accent text-white text-[10px] font-black rounded-full px-2 py-0.5">{friend.unreadCount}</span>
          )}
        </div>
        <p className="text-xs text-earth-text-sec truncate">{friend.lastMessage || 'No messages yet'}</p>
        <p className="text-[9px] font-black text-earth-text-sec uppercase mt-0.5 opacity-60 tracking-widest">{friend.lastTimestamp ? new Date(friend.lastTimestamp).toLocaleTimeString() : ''}</p>
      </div>
      {friend.status === 'pending_received' && (
        <button 
          onClick={(e) => onAddFriend(e, friend.id)}
          className="px-3 py-1.5 bg-earth-accent/10 text-earth-accent text-[10px] font-black rounded-full hover:bg-earth-accent hover:text-white transition-all whitespace-nowrap"
        >
          Add
        </button>
      )}
    </div>
  );
};