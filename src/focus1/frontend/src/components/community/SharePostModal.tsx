
import React, { useState } from 'react';
import { Friend } from '../../hooks/useChat';
import { Post } from '../../types';
import { Button } from '../Common';

interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  friends: Friend[];
  onShareToFriend: (friendId: string) => void;
}

export const SharePostModal: React.FC<SharePostModalProps> = ({ isOpen, onClose, post, friends, onShareToFriend }) => {
  const [search, setSearch] = useState('');
  const [sharedIds, setSharedIds] = useState<Set<string>>(new Set());
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  const filteredFriends = friends.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) && f.status === 'friend'
  );

  const postUrl = `${window.location.origin}/#/community?post=${post.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleInternalShare = (friendId: string) => {
    onShareToFriend(friendId);
    setSharedIds(prev => new Set(prev).add(friendId));
  };

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]">
        <div className="p-8 border-b border-earth-border flex justify-between items-center bg-earth-card">
          <div>
            <h3 className="text-xl font-black text-earth-text tracking-tight">Share Post</h3>
            <p className="text-[10px] font-black text-earth-accent uppercase tracking-widest mt-1">Spread the knowledge</p>
          </div>
          <button onClick={onClose} className="text-earth-text-sec hover:text-earth-danger p-2 rounded-full hover:bg-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto scrollbar-hide space-y-6">
          {/* External Link Section */}
          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-[0.2em]">External Link</label>
             <div className="flex gap-2 p-2 bg-earth-bg border border-earth-border rounded-2xl items-center">
                <input 
                  type="text" 
                  readOnly 
                  value={postUrl}
                  className="flex-1 bg-transparent text-xs font-medium px-2 outline-none truncate"
                />
                <button 
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copySuccess ? 'bg-earth-success text-white' : 'bg-earth-accent text-white hover:opacity-90'}`}
                >
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
             </div>
          </div>

          {/* Internal Friends Section */}
          <div className="space-y-4">
             <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-[0.2em]">Send to Friends</label>
                <div className="relative">
                   <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-32 bg-earth-bg border border-earth-border rounded-full px-4 py-1 text-[10px] focus:w-48 transition-all outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                   />
                </div>
             </div>

             <div className="space-y-1">
                {filteredFriends.length > 0 ? (
                  filteredFriends.map(friend => (
                    <div key={friend.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-earth-bg transition-all group">
                       <div className="flex items-center gap-3">
                          <img src={friend.avatar} className="w-10 h-10 rounded-full border border-earth-border" alt="" />
                          <span className="text-sm font-black text-earth-text">{friend.name}</span>
                       </div>
                       <button 
                        onClick={() => handleInternalShare(friend.id)}
                        disabled={sharedIds.has(friend.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          sharedIds.has(friend.id) 
                            ? 'bg-earth-border text-earth-text-sec cursor-default' 
                            : 'bg-white border border-earth-border text-earth-text hover:border-earth-accent hover:text-earth-accent'
                        }`}
                       >
                         {sharedIds.has(friend.id) ? 'Sent' : 'Send'}
                       </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-xs italic text-earth-text-sec opacity-40">No friends found to share with.</p>
                )}
             </div>
          </div>
        </div>

        <div className="p-6 border-t border-earth-border bg-earth-card">
           <Button variant="outline" className="w-full font-black uppercase tracking-widest" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
};
