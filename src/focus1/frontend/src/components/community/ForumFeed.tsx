
import React from 'react';
import { Post, PostCategory } from '../../types';
import { PostCard } from './PostCard';

interface ForumFeedProps {
  posts: Post[];
  activeCategory: PostCategory | 'all';
  onCategoryChange: (cat: PostCategory | 'all') => void;
  onLike: (id: string) => void;
  onFavorite: (id: string) => void;
  onShare: (id: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onStudyWithMe: (userId: string) => void;
  myLikes: Set<string>;
  myFavorites: Set<string>;
}

export const ForumFeed: React.FC<ForumFeedProps> = ({ 
  posts, 
  activeCategory, 
  onCategoryChange, 
  onLike, 
  onFavorite, 
  onShare,
  onAddComment,
  onStudyWithMe,
  myLikes,
  myFavorites
}) => {
  const tabs: { id: PostCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'sharing', label: 'Sharing' },
    { id: 'discussion', label: 'Discussion' },
  ];

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex items-center justify-between px-2 bg-white/40 backdrop-blur-md p-2 rounded-2xl border border-earth-border sticky top-[72px] z-10">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onCategoryChange(tab.id)}
              className={`px-5 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-xl ${
                activeCategory === tab.id
                  ? 'bg-earth-accent text-white shadow-md shadow-earth-accent/20'
                  : 'text-earth-text-sec hover:bg-white hover:text-earth-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => onLike(post.id)}
              onFavorite={() => onFavorite(post.id)}
              onShare={() => onShare(post.id)}
              onAddComment={onAddComment}
              onStudyWithMe={onStudyWithMe}
              isLiked={myLikes.has(post.id)}
              isFavorited={myFavorites.has(post.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="1.5" />
            </svg>
            <p className="font-bold text-sm">No posts found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
