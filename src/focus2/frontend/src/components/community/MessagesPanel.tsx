import React from 'react';
import { Friend } from '../../hooks/useChat';

interface MessagesPanelProps {
  friends: Friend[];
  onFriendSelect: (friendId: string) => void;
  onSearchAccount: (email: string) => void;
}

export const MessagesPanel: React.FC<MessagesPanelProps> = ({ friends, onFriendSelect, onSearchAccount }) => {
  const recentFriends = friends
    .filter(friend => friend.lastTimestamp)
    .sort((a, b) => (b.lastTimestamp || 0) - (a.lastTimestamp || 0))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-3xl border border-earth-border p-6 shadow-xl">
      <h3 className="text-sm font-black text-earth-text tracking-tighter mb-6 uppercase">Recent Messages</h3>
      <div className="space-y-4">
        {recentFriends.length > 0 ? (
          recentFriends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => onFriendSelect(friend.id)}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-earth-bg transition-all cursor-pointer"
            >
              <div className="relative">
                <img src={friend.avatar} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                {friend.status === 'friend' && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-earth-success rounded-full ring-2 ring-white"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-earth-text truncate">{friend.username}</h4>
                  {friend.unreadCount > 0 && (
                    <span className="bg-earth-accent text-white text-[9px] font-black rounded-full px-2 py-0.5">{friend.unreadCount}</span>
                  )}
                </div>
                <p className="text-[10px] text-earth-text-sec truncate">{friend.lastMessage || 'No messages yet'}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center opacity-20 italic text-sm">
            No recent messages
          </div>
        )}
      </div>
    </div>
  );
};