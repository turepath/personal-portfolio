import React, { useState } from "react";
import { Post, Comment } from "../../utils/types";
import { Button } from "../Common";

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onLike: () => void;
  onFavorite: () => void;
  onShare: () => void;
  onComment: (postId: string, text: string) => void;
  onStudyWithMe: (userId: string) => void;
  isLiked: boolean;
  isFavorited: boolean;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  isOpen,
  onClose,
  post,
  onLike,
  onFavorite,
  onShare,
  onComment,
  onStudyWithMe,
  isLiked,
  isFavorited,
}) => {
  const [commentText, setCommentText] = useState("");

  if (!isOpen) return null;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      await onComment(post.id, commentText.trim());
      setCommentText("");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in"
        onClick={onClose}
      ></div>
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-earth-border bg-earth-bg/20">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-earth-card rounded-full text-earth-text-sec"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div>
                <h2 className="text-sm font-bold text-earth-text">
                  {post.author.username}
                </h2>
                <p className="text-xs text-earth-text-sec">{post.timestamp}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-sm font-medium text-earth-text leading-relaxed">
            {post.content}
          </p>
          {post.media && post.media.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {post.media.map((media, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-2xl overflow-hidden border border-earth-border"
                >
                  <img src={media} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
          {post.replies && post.replies.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-earth-border">
              <h3 className="text-xs font-black text-earth-text uppercase tracking-widest">
                Comments
              </h3>
              {post.replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-3">
                  <img
                    src={reply.user.avatar}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xs font-bold text-earth-text">
                        {reply.user.username}
                      </h4>
                      <span className="text-[9px] text-earth-text-sec">
                        {reply.timestamp || new Date(reply.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-earth-text leading-relaxed">
                      {reply.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="p-6 border-t border-earth-border">
          <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Write a comment..."
              className="flex-1 p-3 rounded-2xl border border-earth-border focus:outline-none focus:ring-1 focus:ring-earth-accent"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-earth-accent text-white rounded-2xl font-bold text-xs hover:scale-105 transition-all"
              disabled={!commentText.trim()}
            >
              Post
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onLike}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl hover:bg-earth-bg transition-all flex-1 justify-center"
            >
              <i
                className={`fas fa-heart ${isLiked ? "text-earth-danger" : "text-earth-text-sec hover:text-earth-danger"} transition-colors`}
              />
              <span className="text-xs font-bold text-earth-text-sec">
                {post.likes}
              </span>
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-2xl hover:bg-earth-bg transition-all flex-1 justify-center"
            >
              <i className="fas fa-comment text-earth-text-sec hover:text-earth-accent transition-colors" />
              <span className="text-xs font-bold text-earth-text-sec">
                {post.comments}
              </span>
            </button>
            <button
              onClick={onShare}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl hover:bg-earth-bg transition-all flex-1 justify-center"
            >
              <i className="fas fa-share text-earth-text-sec hover:text-earth-accent transition-colors" />
              <span className="text-xs font-bold text-earth-text-sec">
                {post.shares}
              </span>
            </button>
            <button
              onClick={onFavorite}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl hover:bg-earth-bg transition-all flex-1 justify-center"
            >
              <i
                className={`fas fa-bookmark ${isFavorited ? "text-earth-warning" : "text-earth-text-sec hover:text-earth-warning"} transition-colors`}
              />
              <span className="text-xs font-bold text-earth-text-sec">
                {post.saves}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
