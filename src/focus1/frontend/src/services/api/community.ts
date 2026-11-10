import axios from "axios";
import { Post, PostCategory } from "../../types";

export interface CreatePostData {
  content: string;
  category: PostCategory;
  tags: string[];
  location?: string;
  images: string[];
  videos: string[];
}

export interface PostResponse {
  id: number;
  account_id: string;
  content: string;
  images: string[];
  videos: string[];
  location: string | null;
  tags: string[];
  category: string;
  created_at: string;
  updated_at: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  is_deleted: boolean;
  user: {
    accountID: string;
    name: string;
    avatar: string;
    isPro: boolean;
  };
}

export interface PaginatedPostsResponse {
  items: PostResponse[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export const communityApi = {
  uploadFile: async (token: string, file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post("/api/upload", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  createPost: async (token: string, data: CreatePostData): Promise<PostResponse> => {
    const response = await axios.post("/api/posts", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getPosts: async (
    token: string,
    page: number = 1,
    perPage: number = 10,
    category?: string,
    tag?: string,
    sortBy: string = "created_at",
    order: string = "desc"
  ): Promise<PaginatedPostsResponse> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("per_page", perPage.toString());
    if (category) params.append("category", category);
    if (tag) params.append("tag", tag);
    params.append("sort_by", sortBy);
    params.append("order", order);

    const response = await axios.get(`/api/posts?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getPost: async (token: string, postId: number): Promise<PostResponse> => {
    const response = await axios.get(`/api/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updatePost: async (
    token: string,
    postId: number,
    data: Partial<CreatePostData>
  ): Promise<PostResponse> => {
    const response = await axios.put(`/api/posts/${postId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  deletePost: async (token: string, postId: number): Promise<{ message: string }> => {
    const response = await axios.delete(`/api/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  likePost: async (token: string, postId: number): Promise<{ likes: number }> => {
    const response = await axios.post(`/api/posts/${postId}/like`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  savePost: async (token: string, postId: number): Promise<{ saves: number }> => {
    const response = await axios.post(`/api/posts/${postId}/save`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  sharePost: async (token: string, postId: number): Promise<{ shares: number }> => {
    const response = await axios.post(`/api/posts/${postId}/share`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
