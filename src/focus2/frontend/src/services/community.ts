import { apiClient } from './index';

export interface CreatePostPayload {
  title: string;
  content: string;
  tags?: string[];
  location?: string;
  images?: string[];
  videos?: string[];
}

export const communityApi = {
  createPost: async (payload: CreatePostPayload) => {
    const res = await apiClient.post('/api/posts', payload);
    return res.data;
  },

  fetchPosts: async () => {
    const res = await apiClient.get('/api/posts');
    return res.data;
  },

  getPostComments: async (postId: string) => {
    const res = await apiClient.get(`/api/posts/${postId}/comments`);
    return res.data;
  },

  createComment: async (postId: string, content: string) => {
    const res = await apiClient.post(`/api/posts/${postId}/comments`, { content });
    return res.data;
  },

  likePost: async (postId: string) => {
    const res = await apiClient.post(`/api/posts/${postId}/like`);
    return res.data;
  },

  savePost: async (postId: string) => {
    const res = await apiClient.post(`/api/posts/${postId}/save`);
    return res.data;
  },

  getPostStatus: async (postId: string) => {
    const res = await apiClient.get(`/api/posts/${postId}/status`);
    return res.data;
  },

  sharePost: async (postId: string) => {
    const res = await apiClient.post(`/api/posts/${postId}/share`);
    return res.data;
  },
};
