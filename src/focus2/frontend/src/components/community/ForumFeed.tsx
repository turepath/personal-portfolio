import React from "react";
import { Post, PostCategory } from "../../utils/types";
import { PostCard } from "./PostCard";

interface ForumFeedProps {
  posts: Post[];
  activeCategory: PostCategory | "all";
  onCategoryChange: (category: PostCategory | "all") => void;
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onShare: (postId: string) => void;
  onFavorite: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onStudyWithMe: (userId: string) => void;
  getComments: (postId: string) => Promise<any[]>;
  myLikes: Set<string>;
  myFavorites: Set<string>;
}

export const ForumFeed: React.FC<ForumFeedProps> = ({
  posts,
  activeCategory,
  onCategoryChange,
  onLike,
  onComment,
  onShare,
  onFavorite,
  onAddComment,
  onStudyWithMe,
  getComments,
  myLikes,
  myFavorites,
}) => {
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={onLike}
          onComment={onAddComment}
          onShare={onShare}
          onFavorite={onFavorite}
          isLiked={myLikes.has(post.id)}
          isFavorited={myFavorites.has(post.id)}
          getComments={getComments}
        />
      ))}
    </div>
  );
};
