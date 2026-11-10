
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ForumFeed } from '../components/community/ForumFeed';
import { PostComposer } from '../components/community/PostComposer';
import { MessagesPanel } from '../components/community/MessagesPanel';
import { ChatWindow } from '../components/community/ChatWindow';
import { PostDetailModal } from '../components/community/PostDetailModal';
import { useCommunity } from '../hooks/useCommunity';
import { useChat } from '../hooks/useChat';
import '../assets/styles/design-tokens-community.css';

export const Community: React.FC = () => {
  const { posts, searchQuery, setSearchQuery, addPost, addComment, interact, activeCategory, setActiveCategory, myLikes, myFavorites } = useCommunity();
  const { friends, messagesByUserId, sendMessage, addFriend, clearUnread } = useChat();
  const location = useLocation();
  
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [deepLinkedPostId, setDeepLinkedPostId] = useState<string | null>(null);

  // Deep linking logic: open post modal if ?post=id is in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const postId = params.get('post');
    if (postId) {
      setDeepLinkedPostId(postId);
    }
  }, [location.search]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.getElementById('forum-search')?.focus();
      }
      if (e.key.toLowerCase() === 'n' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        setIsComposerOpen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const activeFriend = friends.find(f => f.id === activeChatId);
  const linkedPost = posts.find(p => p.id === deepLinkedPostId);

  return (
    <div className="community-grid h-full max-h-[calc(100vh-var(--header-height)-40px)] animate-in fade-in duration-700">
      {/* Forum Column */}
      <div className="flex flex-col gap-6 overflow-y-auto scrollbar-hide pr-2">
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-earth-border sticky top-0 z-20 shadow-sm">
           <button 
            onClick={() => setIsComposerOpen(true)}
            className="px-8 h-12 bg-earth-accent text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center gap-2 shrink-0"
           >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3.5"/></svg>
              Post
           </button>
           
           <div className="flex-1 relative">
              <input 
                id="forum-search"
                type="text" 
                placeholder="Search focus logs, tags, or authors..." 
                className="w-full h-12 bg-white border border-earth-border rounded-2xl px-12 py-2 text-sm focus:ring-1 focus:ring-earth-accent outline-none shadow-inner transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="w-5 h-5 absolute left-4 top-3.5 text-earth-text-sec" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
           </div>
        </div>

        <ForumFeed 
          posts={posts} 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onLike={(id) => interact(id, 'likes')} 
          onFavorite={(id) => interact(id, 'favorites')} 
          onShare={(id) => interact(id, 'shares')} 
          onAddComment={addComment}
          onStudyWithMe={(uid) => {
            setActiveChatId(uid);
            clearUnread(uid);
          }}
          myLikes={myLikes}
          myFavorites={myFavorites}
        />
      </div>

      {/* Messages Column */}
      <div className="hidden lg:flex flex-col sticky top-0 h-full overflow-hidden">
         <MessagesPanel 
          friends={friends} 
          onFriendSelect={(id) => {
            setActiveChatId(id);
            clearUnread(id);
          }} 
          onSearchAccount={(email) => {
             const newId = addFriend(email);
             setActiveChatId(newId);
          }}
         />
      </div>

      <PostComposer 
        isOpen={isComposerOpen} 
        onClose={() => setIsComposerOpen(false)} 
        onPublish={addPost} 
      />

      {activeChatId && activeFriend && (
        <ChatWindow 
          friendId={activeChatId}
          friendName={activeFriend.name}
          messages={messagesByUserId[activeChatId] || []}
          onClose={() => setActiveChatId(null)}
          onSend={(txt, type, rid, furl, fname) => {
            try {
              sendMessage(activeChatId, txt, type, rid, furl, fname);
            } catch (err: any) {
              alert(err.message);
            }
          }}
        />
      )}

      {/* Deep Link Modal */}
      {linkedPost && (
        <PostDetailModal 
          isOpen={true}
          onClose={() => setDeepLinkedPostId(null)}
          post={linkedPost}
          onLike={() => interact(linkedPost.id, 'likes')}
          onFavorite={() => interact(linkedPost.id, 'favorites')}
          onShare={() => interact(linkedPost.id, 'shares')}
          onAddComment={addComment}
          onStudyWithMe={(uid) => {
            setDeepLinkedPostId(null);
            setActiveChatId(uid);
          }}
          isLiked={myLikes.has(linkedPost.id)}
          isFavorited={myFavorites.has(linkedPost.id)}
        />
      )}
    </div>
  );
};
