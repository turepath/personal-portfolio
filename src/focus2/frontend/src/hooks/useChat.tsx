import { useState, useCallback } from "react";
import { User, ChatMessage } from "../utils/types";

export type FriendStatus =
  | "friend"
  | "pending_sent"
  | "pending_received"
  | "stranger";

export interface Friend extends User {
  lastMessage?: string;
  lastTime?: string;
  lastTimestamp?: number;
  unreadCount: number;
  status: FriendStatus;
}

export const useChat = () => {
  const [friends, setFriends] = useState<Friend[]>([
    {
      id: "u2",
      username: "Sarah J.",
      avatar: "https://picsum.photos/seed/sarah/100/100",
      isPro: false,
      points: 450,
      unreadCount: 2,
      lastMessage: "Pomodoro session soon?",
      lastTime: "10:42 AM",
      lastTimestamp: Date.now() - 1000 * 60 * 10,
      status: "friend",
      accountID: "12345678",
    },
    {
      id: "u3",
      username: "James Wilson",
      avatar: "https://picsum.photos/seed/james/100/100",
      isPro: true,
      points: 2100,
      unreadCount: 0,
      lastMessage: "Good luck!",
      lastTime: "Yesterday",
      lastTimestamp: Date.now() - 1000 * 60 * 60 * 24,
      status: "friend",
      accountID: "87654321",
    },
    {
      id: "u7",
      username: "Elena Rodriguez",
      avatar: "https://picsum.photos/seed/elena/100/100",
      isPro: false,
      points: 560,
      unreadCount: 1,
      lastMessage: "Can you review my code?",
      lastTime: "1h ago",
      lastTimestamp: Date.now() - 1000 * 60 * 60,
      status: "friend",
      accountID: "11223344",
    },
    {
      id: "u10",
      username: "Hiroshi Tanaka",
      avatar: "https://picsum.photos/seed/hiro/100/100",
      isPro: false,
      points: 230,
      unreadCount: 0,
      lastMessage: "Focusing on Kanji today.",
      lastTime: "8h ago",
      lastTimestamp: Date.now() - 1000 * 60 * 60 * 8,
      status: "friend",
      accountID: "55667788",
    },
    {
      id: "u21",
      username: "Stranger Scholar",
      avatar: "https://picsum.photos/seed/stranger/100/100",
      isPro: false,
      points: 10,
      unreadCount: 0,
      status: "stranger",
      accountID: "99009900",
    },
  ]);

  const [messagesByUserId, setMessagesByUserId] = useState<
    Record<string, ChatMessage[]>
  >({
    u2: [
      {
        id: "m1",
        senderId: "u2",
        text: "Hey, are you free to study?",
        timestamp: "10:40 AM",
        type: "text",
      },
      {
        id: "m2",
        senderId: "u2",
        text: "Pomodoro session soon?",
        timestamp: "10:42 AM",
        type: "text",
      },
    ],
    u21: [
      {
        id: "req-1",
        senderId: "u21",
        text: "Hello! I saw your post and wanted to study together.",
        timestamp: "11:00 AM",
        type: "text",
      },
      {
        id: "req-2",
        senderId: "u21",
        text: "I would like to be your friend!",
        timestamp: "11:01 AM",
        type: "friend_request",
      },
    ],
  });

  const sendMessage = useCallback(
    (
      recipientId: string,
      text: string,
      type: ChatMessage["type"] = "text",
      roomId?: string,
      fileUrl?: string,
      fileName?: string,
    ) => {
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: "me",
        text,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type,
        roomId,
        fileUrl,
        fileName,
      };

      setMessagesByUserId((prev) => ({
        ...prev,
        [recipientId]: [...(prev[recipientId] || []), newMessage],
      }));

      setFriends((prev) =>
        prev.map((f) =>
          f.id === recipientId
            ? {
                ...f,
                lastMessage:
                  type === "file"
                    ? `📁 ${fileName}`
                    : type === "friend_request"
                      ? "Sent a friend request"
                      : text,
                lastTime: "Just now",
                lastTimestamp: Date.now(),
              }
            : f,
        ),
      );
    },
    [],
  );

  const sendFriendRequest = useCallback(
    (userId: string) => {
      sendMessage(
        userId,
        "I'd like to be your study friend!",
        "friend_request",
      );
      setFriends((prev) =>
        prev.map((f) =>
          f.id === userId ? { ...f, status: "pending_sent" } : f,
        ),
      );
    },
    [sendMessage],
  );

  const acceptFriendRequest = useCallback(
    (userId: string) => {
      setFriends((prev) =>
        prev.map((f) => (f.id === userId ? { ...f, status: "friend" } : f)),
      );
      sendMessage(
        userId,
        "I've accepted your friend request! Let's focus together. 🎉",
        "text",
      );
    },
    [sendMessage],
  );

  const addFriend = useCallback(
    (search: string) => {
      // Search by ID or exact Name (case insensitive)
      const existing = friends.find(
        (f) =>
          f.id.toLowerCase() === search.toLowerCase() ||
          f.username.toLowerCase() === search.toLowerCase(),
      );

      if (existing) return existing.id;

      // Simulate creating a new entry for a discovered scholar
      const newId = search.includes("@") ? `u-email-${Date.now()}` : search;
      /* Added missing accountID */
      const newFriend: Friend = {
        id: newId,
        username: search.includes("@") ? search.split("@")[0] : search,
        avatar: `https://picsum.photos/seed/${search}/100/100`,
        isPro: false,
        points: 0,
        unreadCount: 0,
        status: "stranger",
        accountID: Math.floor(10000000 + Math.random() * 90000000).toString(),
        lastTimestamp: Date.now(),
      };

      setFriends((prev) => [newFriend, ...prev]);
      return newId;
    },
    [friends],
  );

  const startRandomMatch = useCallback(() => {
    const newId = `match-${Date.now()}`;
    /* Added missing accountID */
    const newFriend: Friend = {
      id: newId,
      username: `Scholar_${Math.floor(Math.random() * 900) + 100}`,
      avatar: `https://picsum.photos/seed/${newId}/100/100`,
      isPro: false,
      points: 0,
      unreadCount: 0,
      status: "stranger",
      accountID: Math.floor(10000000 + Math.random() * 90000000).toString(),
      lastTimestamp: Date.now(),
    };
    setFriends((prev) => [newFriend, ...prev]);
    return newId;
  }, []);

  const clearUnread = useCallback((friendId: string) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === friendId ? { ...f, unreadCount: 0 } : f)),
    );
  }, []);

  return {
    friends,
    messagesByUserId,
    sendMessage,
    sendFriendRequest,
    acceptFriendRequest,
    addFriend,
    clearUnread,
    startRandomMatch,
  };
};
