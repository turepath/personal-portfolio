
import React, { useState, useEffect, useMemo } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { useChat, Friend } from '../../hooks/useChat';
import { FriendRow } from './FriendRow';
import { ChatWindow } from './ChatWindow';
import { Badge, Button } from '../Common';

interface NotificationCenterProps {
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const { notifications, counts: notifCounts, markAllRead, markAsRead } = useNotifications();
  const { friends, messagesByUserId, sendMessage, addFriend, clearUnread, startRandomMatch } = useChat();
  
  const [activeTab, setActiveTab] = useState<'chats' | 'activity'>('chats');
  const [chatView, setChatView] = useState<'recent' | 'friends'>('recent');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [notifFilter, setNotifFilter] = useState<'like' | 'favorite' | 'comment' | null>(null);

  const activeFriend = friends.find(f => f.id === activeChatId);
  const filteredNotifs = notifFilter ? notifications.filter(n => n.type === notifFilter) : notifications;

  // Alphabetical grouping logic for friends
  const groupedFriends = useMemo(() => {
    const sorted = [...friends].sort((a, b) => a.name.localeCompare(b.name));
    return sorted.reduce((acc, friend) => {
      const firstLetter = friend.name.charAt(0).toUpperCase();
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(friend);
      return acc;
    }, {} as Record<string, Friend[]>);
  }, [friends]);

  const sortedLetters = useMemo(() => Object.keys(groupedFriends).sort(), [groupedFriends]);

  // Mark all read when switching to activity tab
  useEffect(() => {
    if (activeTab === 'activity') {
      markAllRead();
    }
  }, [activeTab, markAllRead]);

  const handleSearchFriend = () => {
    const email = prompt("Enter scholar email or UID:");
    if (email) addFriend(email);
  };

  const handleRandomMatch = () => {
    const id = startRandomMatch();
    setActiveChatId(id);
    setActiveTab('chats');
    setChatView('recent');
    clearUnread(id);
  };

  const hasChatUnread = friends.some(f => f.unreadCount > 0);

  return (
    <div 
      className="fixed inset-0 bg-earth-text/50 backdrop-blur-xl z-[1000] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-7xl h-full rounded-[3.5rem] shadow-[0_50px_120px_rgba(0,0,0,0.3)] border border-earth-border overflow-hidden flex animate-in slide-in-from-bottom-20 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Sidebar */}
        <div className="w-[420px] border-r border-earth-border flex flex-col bg-earth-bg/40">
           <div className="p-10 space-y-10">
              <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black text-earth-text tracking-tighter">Inbox Hub</h2>
                <button onClick={onClose} className="p-3 hover:bg-earth-bg rounded-full transition-all text-earth-text-sec">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
              
              {/* Main Tabs */}
              <div className="flex bg-white rounded-[2rem] p-1.5 border border-earth-border shadow-sm">
                 <button 
                  onClick={() => setActiveTab('chats')}
                  className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all relative ${activeTab === 'chats' ? 'bg-earth-accent text-white shadow-lg' : 'text-earth-text-sec hover:bg-earth-bg'}`}
                 >
                   Chats
                   {hasChatUnread && <span className="absolute top-3 right-5 w-2.5 h-2.5 bg-earth-danger rounded-full ring-2 ring-white"></span>}
                 </button>
                 <button 
                  onClick={() => setActiveTab('activity')}
                  className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all relative ${activeTab === 'activity' ? 'bg-earth-accent text-white shadow-lg' : 'text-earth-text-sec hover:bg-earth-bg'}`}
                 >
                   Activity
                   {notifCounts.total > 0 && <span className="absolute top-3 right-5 w-2.5 h-2.5 bg-earth-danger rounded-full ring-2 ring-white"></span>}
                 </button>
              </div>

              {/* Action Grid */}
              {activeTab === 'chats' ? (
                <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2">
                  <button 
                    onClick={handleSearchFriend}
                    className="flex flex-col items-center justify-center gap-2.5 p-5 bg-white border border-earth-border rounded-3xl hover:border-earth-accent transition-all group shadow-sm"
                  >
                    <div className="w-9 h-9 rounded-full bg-earth-bg flex items-center justify-center text-earth-text-sec group-hover:text-earth-accent border border-earth-border">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3"/></svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-earth-text">Search</span>
                  </button>
                  <button 
                    onClick={() => setChatView(chatView === 'friends' ? 'recent' : 'friends')}
                    className={`flex flex-col items-center justify-center gap-2.5 p-5 border rounded-3xl transition-all shadow-sm ${chatView === 'friends' ? 'bg-earth-accent text-white border-earth-accent' : 'bg-white border-earth-border text-earth-text hover:border-earth-accent'}`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${chatView === 'friends' ? 'bg-white/20' : 'bg-earth-bg text-earth-text-sec'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" strokeWidth="2.5"/></svg>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${chatView === 'friends' ? 'text-white' : 'text-earth-text'}`}>Friends</span>
                  </button>
                  <button 
                    onClick={handleRandomMatch}
                    className="flex flex-col items-center justify-center gap-2.5 p-5 bg-earth-accent text-white rounded-3xl hover:opacity-90 transition-all shadow-md"
                  >
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="3"/></svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Match</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2">
                   <div className="bg-white border border-earth-border rounded-3xl p-4 text-center shadow-sm">
                      <p className="text-[10px] font-black uppercase text-earth-text-sec mb-1 tracking-widest">Likes</p>
                      <p className="text-2xl font-black text-earth-danger">{notifCounts.likes}</p>
                   </div>
                   <div className="bg-white border border-earth-border rounded-3xl p-4 text-center shadow-sm">
                      <p className="text-[10px] font-black uppercase text-earth-text-sec mb-1 tracking-widest">Saved</p>
                      <p className="text-2xl font-black text-earth-warning">{notifCounts.favorites}</p>
                   </div>
                   <div className="bg-white border border-earth-border rounded-3xl p-4 text-center shadow-sm">
                      <p className="text-[10px] font-black uppercase text-earth-text-sec mb-1 tracking-widest">Talks</p>
                      <p className="text-2xl font-black text-earth-accent">{notifCounts.comments}</p>
                   </div>
                </div>
              )}
           </div>

           {/* List Viewport */}
           <div className="flex-1 overflow-y-auto px-6 pb-12 scrollbar-hide">
              {activeTab === 'chats' ? (
                 friends.length > 0 ? (
                    chatView === 'friends' ? (
                      <div className="space-y-10 pt-4">
                        {sortedLetters.map(letter => (
                          <div key={letter} className="space-y-4">
                            <div className="px-6 py-2 sticky top-0 bg-white/50 backdrop-blur-md z-10 rounded-2xl border border-white/20">
                              <span className="text-sm font-black text-earth-accent uppercase tracking-[0.3em]">{letter}</span>
                            </div>
                            <div className="space-y-1">
                              {groupedFriends[letter].map(f => (
                                <FriendRow 
                                   key={f.id} 
                                   friend={f} 
                                   onClick={() => { setActiveChatId(f.id); clearUnread(f.id); }} 
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1 pt-4">
                        {friends.map(f => (
                          <FriendRow 
                             key={f.id} 
                             friend={f} 
                             onClick={() => { setActiveChatId(f.id); clearUnread(f.id); }} 
                          />
                        ))}
                      </div>
                    )
                 ) : (
                    <div className="py-24 text-center opacity-20 italic text-sm">No conversations yet</div>
                 )
              ) : (
                 <div className="space-y-4 pt-4">
                    <div className="flex gap-2 mb-4 px-2">
                       {(['like', 'favorite', 'comment'] as const).map(f => (
                          <button 
                             key={f}
                             onClick={() => setNotifFilter(notifFilter === f ? null : f)}
                             className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${notifFilter === f ? 'bg-earth-accent border-earth-accent text-white' : 'bg-white border-earth-border text-earth-text-sec'}`}
                          >
                             {f}s
                          </button>
                       ))}
                    </div>
                    {filteredNotifs.map(n => (
                       <div 
                        key={n.id} 
                        onClick={() => markAsRead(n.id)}
                        className={`flex gap-5 p-5 rounded-[2rem] hover:bg-white transition-all group cursor-pointer relative ${n.isUnread ? 'bg-earth-accent/5 ring-1 ring-earth-accent/10' : ''}`}
                       >
                          <img src={n.fromUser.avatar} className="w-12 h-12 rounded-full shrink-0 border-2 border-white shadow-sm" />
                          <div className="flex-1 min-w-0">
                             <p className="text-sm text-earth-text leading-tight">
                                <span className="font-black">{n.fromUser.name}</span> {n.type === 'like' ? 'liked' : 'interacted with'} your post <span className="text-earth-accent font-black group-hover:underline transition-all">"{n.postTitle}"</span>
                             </p>
                             <p className="text-[10px] font-black text-earth-text-sec uppercase mt-2 opacity-60 tracking-wider">{n.timestamp}</p>
                          </div>
                          {n.isUnread && (
                            <div className="absolute top-6 right-6 w-2.5 h-2.5 bg-earth-danger rounded-full ring-2 ring-white shadow-sm"></div>
                          )}
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>

        {/* Chat Window Port */}
        <div className="flex-1 bg-white relative">
           {activeChatId && activeFriend ? (
              <div className="h-full flex flex-col animate-in fade-in duration-500">
                 <div className="px-12 py-8 border-b border-earth-border flex items-center justify-between bg-earth-bg/5">
                    <div className="flex items-center gap-6">
                       <img src={activeFriend.avatar} className="w-16 h-16 rounded-full border-4 border-white shadow-xl" />
                       <div>
                          <h3 className="text-2xl font-black text-earth-text leading-none mb-1.5">{activeFriend.name}</h3>
                          <div className="flex items-center gap-2">
                             <div className="w-2.5 h-2.5 bg-earth-success rounded-full animate-pulse"></div>
                             <span className="text-[11px] font-black text-earth-success uppercase tracking-[0.2em]">Active Now</span>
                          </div>
                       </div>
                    </div>
                    <Button variant="ghost" onClick={() => setActiveChatId(null)} className="text-earth-danger font-black uppercase tracking-widest text-xs px-8">Close Chat</Button>
                 </div>
                 
                 <div className="flex-1 relative overflow-hidden bg-[#FCFAF7]">
                    <ChatWindow 
                      friendId={activeChatId}
                      friendName={activeFriend.name}
                      messages={messagesByUserId[activeChatId] || []}
                      onClose={() => setActiveChatId(null)}
                      onSend={(txt, type, rid, furl, fname) => {
                         try {
                            sendMessage(activeChatId, txt, type, rid, furl, fname);
                         } catch (e: any) {
                            alert(e.message);
                         }
                      }}
                    />
                 </div>
              </div>
           ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-24 opacity-30 select-none animate-in zoom-in duration-700">
                 <div className="w-56 h-56 bg-earth-accent/5 rounded-full flex items-center justify-center mb-14 ring-2 ring-earth-accent/10">
                    <svg className="w-28 h-28 text-earth-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeWidth="1.2"/></svg>
                 </div>
                 <h2 className="text-4xl font-black text-earth-text uppercase tracking-[0.6em] mb-6">Inbox Hub</h2>
                 <p className="max-w-md text-xl font-medium leading-relaxed">Select a scholar to start collaborating or check your latest social activity.</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
