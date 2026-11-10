import { useState, useCallback, useMemo, useEffect } from "react";
import { Post, PostCategory, User, Comment } from "../types";
import { useAuth } from "../context/AuthContext";
import { communityApi, CreatePostData } from "../services/api/community";

export const useCommunity = () => {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<PostCategory | "all">(
    "all",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [myLikes, setMyLikes] = useState<Set<string>>(new Set());
  const [myFavorites, setMyFavorites] = useState<Set<string>>(new Set());

  // 从API获取帖子
  const fetchPosts = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const category = activeCategory === "all" ? undefined : activeCategory;
      const response = await communityApi.getPosts(token, pageNum, 10, category);
      
      const formattedPosts: Post[] = response.items.map(post => ({
        id: post.id.toString(),
        author: {
          id: post.account_id,
          accountID: post.user.accountID,
          name: post.user.name,
          avatar: post.user.avatar,
          isPro: post.user.isPro,
          points: 0, // API未返回points，默认为0
        },
        category: post.category as PostCategory,
        content: post.content,
        likes: post.likes,
        comments: post.comments,
        favorites: post.saves, // API使用saves字段
        shares: post.shares,
        timestamp: new Date(post.created_at).toLocaleString(),
        media: [...post.images, ...post.videos], // 合并图片和视频
        tags: post.tags,
        location: post.location || undefined,
        replies: [], // API未返回评论，默认为空
      }));
      
      if (reset) {
        setPosts(formattedPosts);
      } else {
        setPosts(prev => [...prev, ...formattedPosts]);
      }
      
      setHasMore(formattedPosts.length > 0);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [token, activeCategory]);

  // 初始加载帖子
  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  // 当分类变化时重新加载帖子
  useEffect(() => {
    setPage(1);
    fetchPosts(1, true);
  }, [activeCategory, fetchPosts]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (post) =>
          post.content.toLowerCase().includes(lowerQuery) ||
          post.author.name.toLowerCase().includes(lowerQuery),
      );
    }
    return result;
  }, [posts, searchQuery]);

  const addPost = useCallback(
    async (
      title: string,
      content: string,
      category: PostCategory,
      tags: string[],
      location: string,
      media: string[],
    ) => {
      if (!token) throw new Error("Not authenticated");
      
      try {
        setIsLoading(true);
        
        // 分离图片和视频（这里简化处理，实际项目中需要根据文件类型判断）
        const images = media.filter(url => url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.jpeg'));
        const videos = media.filter(url => url.endsWith('.mp4') || url.endsWith('.avi') || url.endsWith('.mov'));
        
        const postData: CreatePostData = {
          content: `${title}\n\n${content}`,
          category,
          tags,
          location,
          images,
          videos,
        };
        
        const response = await communityApi.createPost(token, postData);
        
        const newPost: Post = {
          id: response.id.toString(),
          author: {
            id: response.account_id,
            accountID: response.user.accountID,
            name: response.user.name,
            avatar: response.user.avatar,
            isPro: response.user.isPro,
            points: 0,
          },
          category: response.category as PostCategory,
          content: response.content,
          likes: response.likes,
          comments: response.comments,
          favorites: response.saves,
          shares: response.shares,
          timestamp: new Date(response.created_at).toLocaleString(),
          media: [...response.images, ...response.videos],
          tags: response.tags,
          location: response.location || undefined,
          replies: [],
        };
        
        setPosts(prev => [newPost, ...prev]);
        return newPost;
      } catch (err) {
        console.error("Failed to create post:", err);
        setError("Failed to create post. Please try again.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [token],
  );

  const addComment = useCallback(
    (postId: string, text: string) => {
      // TODO: 实现添加评论的API调用
      console.log("Add comment not implemented yet");
      return Promise.resolve();
    },
    [],
  );

  const interact = useCallback(
    async (postId: string, type: "likes" | "favorites" | "shares") => {
      if (!token) throw new Error("Not authenticated");
      
      try {
        const postNumId = parseInt(postId);
        let updatedValue: number;
        
        switch (type) {
          case "likes":
            const likeResponse = await communityApi.likePost(token, postNumId);
            updatedValue = likeResponse.likes;
            break;
          case "favorites":
            const saveResponse = await communityApi.savePost(token, postNumId);
            updatedValue = saveResponse.saves;
            break;
          case "shares":
            const shareResponse = await communityApi.sharePost(token, postNumId);
            updatedValue = shareResponse.shares;
            break;
          default:
            return;
        }
        
        setPosts(prev =>
          prev.map(p =>
            p.id === postId ? { ...p, [type]: updatedValue } : p
          )
        );
        
        // 更新本地状态
        if (type === "likes" || type === "favorites") {
          const state = type === "likes" ? myLikes : myFavorites;
          const setState = type === "likes" ? setMyLikes : setMyFavorites;
          const newState = new Set(state);
          if (!newState.has(postId)) {
            newState.add(postId);
          } else {
            newState.delete(postId);
          }
          setState(newState);
        }
      } catch (err) {
        console.error(`Failed to ${type} post:`, err);
        setError(`Failed to ${type} post. Please try again.`);
      }
    },
    [token, myLikes, myFavorites],
  );

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchPosts(page + 1);
    }
  }, [isLoading, hasMore, page, fetchPosts]);

  return {
    posts: filteredPosts,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    addPost,
    addComment,
    interact,
    myLikes,
    myFavorites,
    isLoading,
    error,
    loadMore,
    hasMore,
  };
};
