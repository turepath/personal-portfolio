import { useState, useCallback, useMemo, useEffect } from "react";
import { Post, PostCategory, User, Comment } from "../utils/types";
import { MOCK_USER } from "../utils/constants";
import { communityApi } from "../services/community";

// 接收通知回调以实现全量动态同步
export const useCommunity = (
  onNotify?: (
    type: "like" | "favorite" | "comment",
    fromUser: User,
    postTitle: string,
    content?: string,
  ) => void,
) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<PostCategory | "all">(
    "all",
  );
  const [isLoading, setIsLoading] = useState(false);

  const [myLikes, setMyLikes] = useState<Set<string>>(new Set());
  const [myFavorites, setMyFavorites] = useState<Set<string>>(new Set());

  // 从后端获取帖子
  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await communityApi.fetchPosts();
      // 处理后端返回的帖子数据，确保格式正确
      const fetchedPosts: Post[] = response.items.map((post: any) => ({
        id: post.id.toString(),
        author_id: post.author_id.toString(),
        content: post.content,
        title: post.title,
        likes: post.likes || 0,
        comments: post.comments || 0,
        shares: post.shares || 0,
        saves: post.saves || 0,
        timestamp: post.created_at
          ? new Date(post.created_at).toLocaleString()
          : "",
        images: post.images || [],
        videos: post.videos || [],
        media: post.media || [],
        tags: post.tags || [],
        location: post.location,
        author: post.author || MOCK_USER,
        replies: [],
      }));
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 组件挂载时获取帖子
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (post) =>
          post.content.toLowerCase().includes(lowerQuery) ||
          post.author.username.toLowerCase().includes(lowerQuery),
      );
    }
    // 规则：长期保留展示，无隐藏机制
    return result;
  }, [posts, searchQuery, activeCategory]);

  const addPost = useCallback(
    async (
      title: string,
      content: string,
      tags: string[],
      location: string,
      images: string[],
      videos: string[],
    ) => {
      // Optimistic update to keep UI responsive
      const tempId = `post-temp-${Date.now()}`;
      const optimistic: Post = {
        id: tempId,
        author: { ...MOCK_USER },
        author_id: MOCK_USER.id,
        content: content,
        title: title,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        favorites: 0,
        timestamp: "Just now",
        category: "sharing",
        images: images.length > 0 ? images : undefined,
        videos: videos.length > 0 ? videos : undefined,
        media:
          [...images, ...videos].length > 0
            ? [...images, ...videos]
            : undefined,
        tags: tags.length > 0 ? tags : undefined,
        location: location || undefined,
        replies: [],
      };

      setPosts((prev) => [optimistic, ...prev]);

      try {
        const created = await communityApi.createPost({
          title,
          content,
          tags,
          location,
          images,
          videos,
        });
        // replace optimistic post with server returned post
        setPosts((prev) => prev.map((p) => (p.id === tempId ? created : p)));
      } catch (err: any) {
        console.error("Create post failed", err);
        // remove optimistic post on failure
        setPosts((prev) => prev.filter((p) => p.id !== tempId));
        alert(err?.message || "Failed to publish post");
      }
    },
    [],
  );

  const addComment = useCallback(
    async (postId: string, text: string) => {
      try {
        const newComment = await communityApi.createComment(postId, text);
        // 转换评论格式以匹配前端类型
        const formattedComment: Comment = {
          ...newComment,
          id: newComment.id.toString(),
          post_id: newComment.post_id.toString(),
          useraccount_id: newComment.useraccount_id.toString(),
          timestamp: new Date(newComment.created_at).toLocaleString(),
        };

        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              // 同步规则：无论作者是谁，评论即同步至消息中心
              if (onNotify) {
                onNotify(
                  "comment",
                  newComment.user,
                  p.content.split("\n")[0],
                  text,
                );
              }
              return {
                ...p,
                comments: p.comments + 1,
                replies: [...(p.replies || []), formattedComment],
              };
            }
            return p;
          }),
        );
        return formattedComment;
      } catch (error) {
        console.error("Failed to add comment:", error);
        throw error;
      }
    },
    [onNotify],
  );

  const getComments = useCallback(async (postId: string) => {
    try {
      const comments = await communityApi.getPostComments(postId);
      // 转换评论格式以匹配前端类型
      const formattedComments: Comment[] = comments.map(
        (comment: any): Comment => ({
          ...comment,
          id: comment.id.toString(),
          post_id: comment.post_id.toString(),
          useraccount_id: comment.useraccount_id.toString(),
          timestamp: new Date(comment.created_at).toLocaleString(),
        }),
      );

      // 更新posts状态中的评论数据
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              replies: formattedComments,
            };
          }
          return p;
        }),
      );

      return formattedComments;
    } catch (error) {
      console.error("Failed to get comments:", error);
      throw error;
    }
  }, []);

  const likePost = useCallback(async (postId: string) => {
    try {
      const result = await communityApi.likePost(postId);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              likes: result.likes,
            };
          }
          return p;
        }),
      );
      return result.user_liked;
    } catch (error) {
      console.error("Failed to like post:", error);
      throw error;
    }
  }, []);

  const savePost = useCallback(async (postId: string) => {
    try {
      const result = await communityApi.savePost(postId);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              saves: result.saves,
            };
          }
          return p;
        }),
      );
      return result.user_saved;
    } catch (error) {
      console.error("Failed to save post:", error);
      throw error;
    }
  }, []);

  const getPostStatus = useCallback(async (postId: string) => {
    try {
      const status = await communityApi.getPostStatus(postId);
      return status;
    } catch (error) {
      console.error("Failed to get post status:", error);
      return { liked: false, saved: false };
    }
  }, []);

  const sharePost = useCallback(async (postId: string) => {
    try {
      await communityApi.sharePost(postId);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              shares: p.shares + 1,
            };
          }
          return p;
        }),
      );
    } catch (error) {
      console.error("Failed to share post:", error);
    }
  }, []);

  const interact = useCallback(
    (postId: string, type: "likes" | "favorites" | "shares") => {
      if (type === "shares") {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, shares: p.shares + 1 } : p,
          ),
        );
        return;
      }

      const state = type === "likes" ? myLikes : myFavorites;
      const setState = type === "likes" ? setMyLikes : setMyFavorites;
      const isActivating = !state.has(postId);

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            // 同步规则：用户点赞或收藏（哪怕是自己的帖子）也会实时同步动态
            if (isActivating && onNotify) {
              const notifyType = type === "likes" ? "like" : "favorite";
              onNotify(notifyType, MOCK_USER, p.content.split("\n")[0]);
            }
            return {
              ...p,
              [type]: isActivating ? p[type] + 1 : Math.max(0, p[type] - 1),
            };
          }
          return p;
        }),
      );

      setState((prev) => {
        const next = new Set(prev);
        if (isActivating) next.add(postId);
        else next.delete(postId);
        return next;
      });
    },
    [myLikes, myFavorites, onNotify],
  );

  return {
    posts: filteredPosts,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    addPost,
    addComment,
    getComments,
    likePost,
    savePost,
    getPostStatus,
    sharePost,
    interact,
    myLikes,
    myFavorites,
  };
};
