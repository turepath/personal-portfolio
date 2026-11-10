import React, { useState } from "react";
import { Post, Comment } from "../../utils/types";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, commentText: string) => void;
  onShare: (postId: string) => void;
  onFavorite: (postId: string) => void;
  isLiked: boolean;
  isFavorited: boolean;
  getComments: (postId: string) => Promise<any[]>;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onFavorite,
  isLiked,
  isFavorited,
  getComments,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  const handleShare = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    // 生成分享链接
    const shareUrl = `${window.location.origin}/#/community?post=${postId}`;
    // 复制到剪贴板
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        // 显示复制成功提示
        alert("Share link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy share link:", err);
      });
    // 调用父组件的 onShare 方法以更新分享计数
    await onShare(postId);
  };

  const handleCommentClick = async () => {
    if (!showComments) {
      // 首次点击，加载评论数据
      setIsLoadingComments(true);
      setCommentsError(null);

      try {
        // 从数据库加载评论
        const comments = await getComments(post.id);
        // 这里我们假设getComments会更新全局的posts状态
        // 所以不需要在这里更新post.replies
      } catch (error) {
        console.error("Failed to load comments:", error);
        setCommentsError("Failed to load comments. Please try again.");
      } finally {
        setIsLoadingComments(false);
      }
    }

    setShowComments(!showComments);

    if (!showComments) {
      // 滚动到评论区域
      setTimeout(() => {
        const commentSection = document.getElementById(`comments-${post.id}`);
        if (commentSection) {
          commentSection.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }, 100);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onComment(post.id, commentText.trim());
        setCommentText("");
      } catch (error) {
        console.error("Failed to submit comment:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-earth-border p-6 shadow-xl hover:shadow-2xl transition-all">
      <div className="flex items-start gap-4 mb-4">
        <img
          src={
            post.author.avatar ||
            `https://picsum.photos/seed/${post.author.id}/100/100`
          }
          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-earth-text truncate">
              {post.author.username}
            </h3>
            {post.author.isPro && (
              <span className="bg-pink-100 text-pink-500 text-[9px] font-black rounded-full px-2 py-0.5 uppercase tracking-widest">
                Pro
              </span>
            )}
          </div>
          <p className="text-xs text-earth-text-sec mb-3">{post.timestamp}</p>
          {post.title && (
            <h4 className="text-base font-bold text-earth-text mb-2">
              {post.title}
            </h4>
          )}
          <p className="text-sm font-medium text-earth-text leading-relaxed mb-4">
            {post.content}
          </p>
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {post.images.map((img, index) => (
                <div
                  key={`img-${index}`}
                  className="aspect-square rounded-2xl overflow-hidden border border-earth-border"
                >
                  <img src={img} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
          {post.videos && post.videos.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {post.videos.map((video, index) => (
                <div
                  key={`video-${index}`}
                  className="aspect-square rounded-2xl overflow-hidden border border-earth-border"
                >
                  <video
                    src={video}
                    className="w-full h-full object-cover"
                    controls
                  />
                </div>
              ))}
            </div>
          )}
          {post.media && post.media.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {post.media.map((media, index) => (
                <div
                  key={`media-${index}`}
                  className="aspect-square rounded-2xl overflow-hidden border border-earth-border"
                >
                  <img src={media} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Comments Section */}
          {showComments && (
            <div
              id={`comments-${post.id}`}
              className="mt-4 space-y-4 pt-4 border-t border-earth-border"
            >
              <h4 className="text-xs font-black text-earth-text uppercase tracking-widest">
                Comments
              </h4>

              {/* Comment Input */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="flex-1 p-2 rounded-xl border border-earth-border focus:outline-none focus:ring-1 focus:ring-earth-accent text-sm"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-earth-accent text-white rounded-xl font-bold text-xs hover:scale-105 transition-all"
                  disabled={!commentText.trim() || isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              </form>

              {/* Loading State */}
              {isLoadingComments && (
                <div className="flex items-center justify-center py-4">
                  <div className="w-4 h-4 border-2 border-earth-accent border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-xs text-earth-text-sec">
                    Loading comments...
                  </span>
                </div>
              )}

              {/* Error State */}
              {commentsError && (
                <div className="p-3 bg-red-50 text-red-500 rounded-xl text-xs">
                  {commentsError}
                </div>
              )}

              {/* Comments List */}
              {!isLoadingComments && !commentsError && (
                <>
                  {post.replies && post.replies.length > 0 ? (
                    <div className="space-y-3">
                      {post.replies.map((comment) => (
                        <div
                          key={comment.id}
                          className="flex items-start gap-3"
                        >
                          <img
                            src={
                              comment.user?.avatar ||
                              `https://picsum.photos/seed/${comment.user?.id || comment.useraccount_id}/100/100`
                            }
                            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="text-xs font-bold text-earth-text truncate">
                                {comment.user?.username || "Unknown User"}
                              </h5>
                              <span className="text-[9px] text-earth-text-sec">
                                {comment.timestamp ||
                                  new Date(comment.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-earth-text leading-relaxed">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-earth-text-sec italic">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-earth-border">
            <button
              onClick={() => onLike(post.id)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-earth-bg transition-all"
            >
              <i
                className={`fas fa-heart ${isLiked ? "text-earth-danger" : "text-earth-text-sec hover:text-earth-danger"} transition-colors`}
              />
              <span className="text-xs font-bold text-earth-text-sec">
                {post.likes}
              </span>
            </button>
            <button
              onClick={handleCommentClick}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-earth-bg transition-all"
            >
              <i className="fas fa-comment text-earth-text-sec hover:text-earth-accent transition-colors" />
              <span className="text-xs font-bold text-earth-text-sec">
                {post.comments}
              </span>
              <i
                className={`fas fa-chevron-down ${showComments ? "rotate-180" : ""} text-xs text-earth-text-sec transition-transform`}
              />
            </button>
            <button
              onClick={(e) => handleShare(e, post.id)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-earth-bg transition-all"
              title="Copy share link"
            >
              <i className="fas fa-share text-earth-text-sec hover:text-earth-accent transition-colors" />
            </button>
            <button
              onClick={() => onFavorite(post.id)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-earth-bg transition-all"
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
