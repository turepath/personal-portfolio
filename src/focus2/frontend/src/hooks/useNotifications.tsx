import { useState, useCallback } from "react";
import { Notification, User } from "../utils/types";
import { MOCK_USER } from "../utils/constants";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "n1",
      type: "like",
      fromUser: {
        id: "u2",
        username: "Sarah J.",
        name: "Sarah J.",
        avatar: "https://picsum.photos/seed/sarah/100/100",
        isPro: false,
        points: 450,
        accountID: "12345678",
      },
      postTitle: "Deep Work Tips",
      timestamp: "10m ago",
      isUnread: true,
    },
    {
      id: "n2",
      type: "comment",
      fromUser: {
        id: "u3",
        username: "James W.",
        name: "James W.",
        avatar: "https://picsum.photos/seed/james/100/100",
        isPro: true,
        points: 2100,
        accountID: "87654321",
      },
      postTitle: "Deep Work Tips",
      content: "Great advice on the Pomodoro technique!",
      timestamp: "1h ago",
      isUnread: true,
    },
    {
      id: "n3",
      type: "favorite",
      fromUser: {
        id: "u4",
        username: "Emma L.",
        name: "Emma L.",
        avatar: "https://picsum.photos/seed/emma/100/100",
        isPro: false,
        points: 120,
        accountID: "11223344",
      },
      postTitle: "Accountability Buddy Wanted",
      timestamp: "3h ago",
      isUnread: true,
    },
  ]);

  const counts = {
    likes: notifications.filter((n) => n.type === "like" && n.isUnread).length,
    comments: notifications.filter((n) => n.type === "comment" && n.isUnread)
      .length,
    favorites: notifications.filter((n) => n.type === "favorite" && n.isUnread)
      .length,
    total: notifications.filter((n) => n.isUnread).length,
  };

  const markAllRead = useCallback((type?: "like" | "favorite" | "comment") => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (!type || n.type === type) return { ...n, isUnread: false };
        return n;
      }),
    );
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n)),
    );
  }, []);

  // 动态同步通知核心方法
  const addNotification = useCallback(
    (
      type: "like" | "favorite" | "comment",
      fromUser: User,
      postTitle: string,
      content?: string,
    ) => {
      const newNotif: Notification = {
        id: `n-realtime-${Date.now()}`,
        type,
        fromUser, // 如果 fromUser.id === MOCK_USER.id，UI 将显示为 "You"
        postTitle,
        content,
        timestamp: "Just now",
        isUnread: true,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    [],
  );

  return { notifications, counts, markAllRead, markAsRead, addNotification };
};
