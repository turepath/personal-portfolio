
import React, { useState } from 'react';
import { Post } from '../../types';
import { Button, Badge } from '../Common';
import { ChatWindow } from './ChatWindow';
import { SharePostModal } from './SharePostModal';
import { useChat } from '../../hooks/useChat';

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onLike: () => void;
  onFavorite: () => void;
  onShare: () => void;
  onAddComment: (postId: string, text: string) => void;
  onStudyWithMe: (userId: string) => void;
  isLiked?: boolean;
  isFavorited?: boolean;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ 
  isOpen, onClose, post, onLike, onFavorite, onShare, onAddComment, onStudyWithMe, isLiked, isFavorited 
}) => {
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const { sendMessage, messagesByUserId, friends } = useChat();

  if (!isOpen) return null;

  const parts = post.content.split('\n\n');
  const title = parts[0];
  const body = parts.slice(1).join('\n\n');
  const hasMedia = post.media && post.media.length > 0;

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    onAddComment(post.id, commentInput);
    setCommentInput('');
  };

  const handleShareToFriend = (friendId: string) => {
    sendMessage(friendId, `Hey, check out this post: "${title}"`, 'text');
    sendMessage(friendId, `Link: ${window.location.origin}/#/community?post=${post.id}`, 'text');
    onShare(); 
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}></div>
      
      <button 
        onClick={onClose} 
        className="fixed top-8 right-8 z-[700] w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-all border border-white/20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
      </button>

      <div className={`relative bg-white w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 slide-in-from-bottom-10 duration-500`}>
        {/* Left Column (Media) - Only rendered if media exists */}
        {hasMedia && (
          <div className="md:w-3/5 bg-black flex items-center justify-center relative group">
             <img src={post.media![0]} className="w-full h-full object-contain" alt="Content" />
          </div>
        )}

        {/* Right Content/Interactions Column */}
        <div className={`flex-1 flex flex-col h-full bg-[#FCFAF7] ${!hasMedia ? 'w-full' : ''}`}>
           {/* Header */}
           <div className={`p-8 border-b border-earth-border flex items-center justify-between bg-white ${!hasMedia ? 'px-12 md:px-24' : ''}`}>
              <div className="flex items-center gap-4">
                 <img src={post.author.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="" />
                 <div>
                    <h4 className="font-black text-earth-text">{post.author.name}</h4>
                    <div className="flex gap-2 mt-0.5">
                       <Badge color={post.category === 'sharing' ? 'success' : 'accent'}>{post.category}</Badge>
                       <span className="text-[10px] text-earth-text-sec uppercase font-black tracking-widest">{post.timestamp}</span>
                    </div>
                 </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsMessageOpen(true)}
                  className="w-10 h-10 bg-white rounded-full border border-earth-border flex items-center justify-center text-earth-accent hover:bg-earth-accent hover:text-white transition-all shadow-sm"
                  title="Send Private Message"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeWidth="2.5"/></svg>
                </button>
              </div>
           </div>

           {/* Scrollable Post Content & All Comments */}
           <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className={`p-8 space-y-6 ${!hasMedia ? 'max-w-4xl mx-auto md:px-24' : ''}`}>
                <h3 className={`font-black text-earth-text leading-tight ${!hasMedia ? 'text-4xl mb-6' : 'text-2xl'}`}>{title}</h3>
                <p className={`text-earth-text-sec leading-relaxed whitespace-pre-line ${!hasMedia ? 'text-xl opacity-90' : 'text-base opacity-80'}`}>{body}</p>
                
                <div className="flex items-center gap-6 py-6 border-y border-earth-border/30">
                   <button onClick={onLike} className={`flex items-center gap-2 text-xs font-black transition-colors ${isLiked ? 'text-earth-danger' : 'text-earth-text-sec hover:text-earth-danger'}`}>
                      <svg className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeWidth="2.5"/></svg>
                      {post.likes} Likes
                   </button>
                   <button onClick={onFavorite} className={`flex items-center gap-2 text-xs font-black transition-colors ${isFavorited ? 'text-earth-warning' : 'text-earth-text-sec hover:text-earth-warning'}`}>
                      <svg className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeWidth="2.5"/></svg>
                      {post.favorites} Saves
                   </button>
                   <button onClick={() => setIsShareOpen(true)} className="flex items-center gap-2 text-xs font-black text-earth-text-sec hover:text-earth-accent transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6L15.316 7.684m1.77 11.632a3 3 0 100-6 3 3 0 000 6zM15.316 7.684a3 3 0 110-2.684 3 3 0 010 2.684z" strokeWidth="2.5"/></svg>
                      {post.shares} Shares
                   </button>
                </div>

                {/* All Comments Section */}
                <div className="space-y-8 pt-4 pb-12">
                  <h4 className="text-[10px] font-black uppercase text-earth-text tracking-[0.4em] opacity-40">All Comments ({post.comments})</h4>
                  <div className="space-y-8">
                    {post.replies?.map((reply) => (
                      <div key={reply.id} className="flex gap-4 group animate-in slide-in-from-left-2 fade-in duration-300">
                        <img src={reply.author.avatar} className="w-10 h-10 rounded-full border border-earth-border shadow-sm shrink-0" alt="" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm font-black text-earth-text">{reply.author.name}</span>
                            <span className="text-[9px] font-bold text-earth-text-sec uppercase tracking-widest opacity-60">{reply.timestamp}</span>
                          </div>
                          <p className="text-sm text-earth-text-sec leading-relaxed">{reply.text}</p>
                          <div className="flex gap-4 mt-2.5">
                             <button className="text-[9px] font-black uppercase text-earth-text-sec hover:text-earth-danger transition-colors flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeWidth="2"/></svg>
                                Like
                             </button>
                             <button className="text-[9px] font-black uppercase text-earth-text-sec hover:text-earth-accent transition-colors">Reply</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!post.replies || post.replies.length === 0) && (
                      <p className="text-center py-12 text-xs italic text-earth-text-sec opacity-40">No comments yet. Be the first to share your thoughts!</p>
                    )}
                  </div>
                </div>
              </div>
           </div>

           {/* Comment Input Footer */}
           <div className={`p-6 border-t border-earth-border bg-white space-y-4 ${!hasMedia ? 'px-12 md:px-24' : ''}`}>
              <div className="flex gap-3 max-w-3xl mx-auto w-full">
                 <input 
                  type="text" 
                  placeholder="Share your thoughts..." 
                  className="flex-1 bg-earth-bg border border-earth-border rounded-2xl px-6 py-3.5 text-sm focus:border-earth-accent outline-none transition-all shadow-inner"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                 />
                 <button 
                  onClick={handleAddComment}
                  disabled={!commentInput.trim()}
                  className="w-12 h-12 bg-earth-accent text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                 >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 </button>
              </div>
              <div className="flex justify-center">
                 <Button variant="ghost" className="text-[10px] font-black uppercase tracking-[0.3em] px-10 rounded-full h-10 hover:bg-earth-accent hover:text-white transition-all" onClick={() => onStudyWithMe(post.author.id)}>Join Partner Session</Button>
              </div>
           </div>
        </div>
      </div>

      {isMessageOpen && (
        <ChatWindow 
          friendId={post.author.id} 
          friendName={post.author.name} 
          messages={messagesByUserId[post.author.id] || []} 
          onClose={() => setIsMessageOpen(false)} 
          onSend={(text) => sendMessage(post.author.id, text)} 
        />
      )}

      <SharePostModal 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        post={post}
        friends={friends}
        onShareToFriend={handleShareToFriend}
      />
    </div>
  );
};
