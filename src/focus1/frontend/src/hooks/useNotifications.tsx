
import { useState, useCallback } from 'react';
import { Notification } from '../types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 'n1', type: 'like', fromUser: { id: 'u2', name: 'Sarah J.', avatar: 'https://picsum.photos/seed/sarah/100/100', isPro: false, points: 450 }, postTitle: 'Deep Work Tips', timestamp: '10m ago', isUnread: true },
    { id: 'n2', type: 'comment', fromUser: { id: 'u3', name: 'James W.', avatar: 'https://picsum.photos/seed/james/100/100', isPro: true, points: 2100 }, postTitle: 'Deep Work Tips', content: 'Great advice on the Pomodoro technique!', timestamp: '1h ago', isUnread: true },
    { id: 'n3', type: 'favorite', fromUser: { id: 'u4', name: 'Emma L.', avatar: 'https://picsum.photos/seed/emma/100/100', isPro: false, points: 120 }, postTitle: 'Accountability Buddy Wanted', timestamp: '3h ago', isUnread: true },
  ]);

  const counts = {
    likes: notifications.filter(n => n.type === 'like' && n.isUnread).length,
    comments: notifications.filter(n => n.type === 'comment' && n.isUnread).length,
    favorites: notifications.filter(n => n.type === 'favorite' && n.isUnread).length,
    total: notifications.filter(n => n.isUnread).length
  };

  const markAllRead = useCallback((type?: 'like' | 'favorite' | 'comment') => {
    setNotifications(prev => prev.map(n => {
      if (!type || n.type === type) return { ...n, isUnread: false };
      return n;
    }));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: false } : n));
  }, []);

  return { notifications, counts, markAllRead, markAsRead };
};
