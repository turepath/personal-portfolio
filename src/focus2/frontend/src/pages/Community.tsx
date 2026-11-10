import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ForumFeed } from "../components/community/ForumFeed";
import { PostComposer } from "../components/community/PostComposer";
import { MessagesPanel } from "../components/community/MessagesPanel";
import { ChatWindow } from "../components/community/ChatWindow";
import { PostDetailModal } from "../components/community/PostDetailModal";
import { useCommunity } from "../hooks/useCommunity";
import { useChat } from "../hooks/useChat";
import { useNotifications } from "../hooks/useNotifications";
import "../assets/design-tokens-community.css";

export const Community: React.FC = () => {
  // 获取通知中心的添加方法
  const { addNotification } = useNotifications();

  // 将 addNotification 作为回调传递给 useCommunity
  // 这样在社区执行的操作会实时同步到 Activity 板块
  const {
    posts,
    searchQuery,
    setSearchQuery,
    addPost,
    addComment,
    getComments,
    likePost,
    savePost,
    getPostStatus,
    sharePost,
    interact,
    activeCategory,
    setActiveCategory,
    myLikes,
    myFavorites,
  } = useCommunity(addNotification);

  const { friends, messagesByUserId, sendMessage, addFriend, clearUnread } =
    useChat();
  const location = useLocation();

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [deepLinkedPostId, setDeepLinkedPostId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const postId = params.get("post");
    if (postId) {
      setDeepLinkedPostId(postId);
    }
  }, [location.search]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        document.getElementById("forum-search")?.focus();
      }
      if (
        e.key.toLowerCase() === "n" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        setIsComposerOpen(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const activeFriend = friends.find((f) => f.id === activeChatId);
  const linkedPost = posts.find((p) => p.id === deepLinkedPostId);

  return (
    <div className="h-full max-h-[calc(100vh-var(--header-height)-40px)] animate-in fade-in duration-700">
      <div className="flex flex-col gap-6 overflow-y-auto scrollbar-hide pr-2 max-w-3xl mx-auto">
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
          onLike={likePost} 
          onComment={() => {}} 
          onFavorite={savePost} 
          onShare={sharePost} 
          onAddComment={addComment}
          onStudyWithMe={(uid) => {
            setActiveChatId(uid);
            clearUnread(uid);
          }}
          getComments={getComments}
          myLikes={myLikes}
          myFavorites={myFavorites}
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
          friendName={activeFriend.username}
          messages={messagesByUserId[activeChatId] || []}
          onClose={() => setActiveChatId(null)}
          onAcceptRequest={(uid) => console.log("Accept request:", uid)}
          onSend={(txt, type, rid, furl, fname) => {
            try {
              // Convert type to match expected types
              const messageType =
                type === "image" ? "file" : type === "task" ? "text" : type;
              sendMessage(activeChatId, txt, messageType, rid, furl, fname);
            } catch (err: any) {
              alert(err.message);
            }
          }}
        />
      )}

      {linkedPost && (
        <PostDetailModal
          isOpen={true}
          onClose={() => setDeepLinkedPostId(null)}
          post={linkedPost}
          onLike={() => likePost(linkedPost.id)}
          onFavorite={() => savePost(linkedPost.id)}
          onShare={() => sharePost(linkedPost.id)}
          onComment={addComment}
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
