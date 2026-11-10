
import React, { useState } from 'react';
import { Post } from '../../types';
import { Badge, Button } from '../Common';
import { PostDetailModal } from './PostDetailModal';
import { SharePostModal } from './SharePostModal';
import { useChat } from '../../hooks/useChat';

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onFavorite: () => void;
  onShare: () => void;
  onAddComment: (postId: string, text: string) => void;
  onStudyWithMe: (userId: string) => void;
  isLiked?: boolean;
  isFavorited?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, onLike, onFavorite, onShare, onAddComment, onStudyWithMe, isLiked, isFavorited 
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { friends, sendMessage } = useChat();

  const parts = post.content.split('\n\n');
  const title = parts.length > 1 ? parts[0] : 'Community Discussion';
  const body = parts.length > 1 ? parts.slice(1).join('\n\n') : post.content;
  const hasMedia = post.media && post.media.length > 0;

  const handleShareToFriend = (friendId: string) => {
    sendMessage(friendId, `Hey, check out this post: "${title}"`, 'text');
    sendMessage(friendId, `Link: ${window.location.origin}/#/community?post=${post.id}`, 'text');
    onShare(); // Increment counter
  };

  return (
    <>
      <div 
        onClick={() => setIsDetailOpen(true)}
        className={`bg-post-card-bg rounded-[2rem] border border-post-card-border p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group cursor-pointer ${!hasMedia ? 'bg-gradient-to-br from-white to-earth-bg/30' : ''}`}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
            <div className="relative">
              <img src={post.author.avatar} alt={post.author.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
              <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-earth-success rounded-full border-2 border-white"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-[15px] text-earth-text">{post.author.name}</span>
                <Badge color={post.category === 'sharing' ? 'success' : 'accent'}>
                  {post.category}
                </Badge>
              </div>
              <span className="text-[10px] text-earth-text-sec uppercase font-black tracking-widest">{post.timestamp}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <h3 className={`font-black text-earth-text leading-tight group-hover:text-earth-accent transition-colors ${!hasMedia ? 'text-2xl' : 'text-xl'}`}>
            {title}
          </h3>
          
          {hasMedia && (
            <div className="post-media-container group/media rounded-[1.5rem] overflow-hidden">
              <img src={post.media![0]} className="w-full h-full object-cover group-hover/media:scale-110 transition-transform duration-[1.5s]" alt="Post media" />
              <div className="absolute inset-0 bg-black/10 group-hover/media:bg-transparent transition-all"></div>
            </div>
          )}

          <p className={`text-earth-text-sec leading-relaxed opacity-80 ${!hasMedia ? 'text-lg line-clamp-4' : 'text-[15px] line-clamp-2'}`}>
            {body}
          </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-earth-border/50">
          <div className="flex items-center gap-6">
            <button 
              onClick={(e) => { e.stopPropagation(); onLike(); }}
              className={`flex items-center gap-2 text-xs font-black transition-colors group/stat ${isLiked ? 'text-earth-danger' : 'text-earth-text-sec hover:text-earth-danger'}`}
            >
              <svg className={`w-5 h-5 group-hover/stat:scale-125 transition-transform ${isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              {post.likes}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onFavorite(); }}
              className={`flex items-center gap-2 text-xs font-black transition-colors group/stat ${isFavorited ? 'text-earth-warning' : 'text-earth-text-sec hover:text-earth-warning'}`}
            >
              <svg className={`w-5 h-5 group-hover/stat:scale-125 transition-transform ${isFavorited ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
              {post.favorites}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsShareOpen(true); }}
              className="flex items-center gap-2 text-xs font-black text-earth-text-sec hover:text-earth-accent transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6L15.316 7.684m1.77 11.632a3 3 0 100-6 3 3 0 000 6zM15.316 7.684a3 3 0 110-2.684 3 3 0 010 2.684z"/></svg>
              {post.shares}
            </button>
          </div>
          
          <Button 
            variant="ghost" 
            className="text-[10px] font-black uppercase tracking-[0.2em] h-10 px-6 rounded-full hover:bg-earth-accent hover:text-white transition-all shadow-sm"
            onClick={(e) => { e.stopPropagation(); onStudyWithMe(post.author.id); }}
          >
            Study With Me
          </Button>
        </div>
      </div>

      <PostDetailModal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        post={post}
        onLike={onLike}
        onFavorite={onFavorite}
        onShare={() => setIsShareOpen(true)}
        onAddComment={onAddComment}
        onStudyWithMe={onStudyWithMe}
        isLiked={isLiked}
        isFavorited={isFavorited}
      />

      <SharePostModal 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        post={post}
        friends={friends}
        onShareToFriend={handleShareToFriend}
      />
    </>
  );
};
