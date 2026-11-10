import { useState, useCallback, useEffect, useRef } from "react";
import { User, ChatMessage } from "../types";
import WebSocketManager from "../utils/WebSocketManager";
import { getToken } from "../services/api/auth";

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
  const [friends, setFriends] = useState<Friend[]>([]);
  const [messagesByUserId, setMessagesByUserId] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketListenerRef = useRef<{ [key: string]: (data: any) => void }>({});

  // 加载好友列表
  const loadFriends = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch("/api/friends", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load friends");

      const data = await response.json();
      setFriends(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load friends");
      console.error("Failed to load friends:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载消息历史
  const loadMessages = useCallback(async (friendId: string) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/messages/${friendId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load messages");

      const data = await response.json();
      setMessagesByUserId((prev) => ({
        ...prev,
        [friendId]: data,
      }));
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, []);

  // 发送消息
  const sendMessage = useCallback(
    async (
      recipientId: string,
      text: string,
      type: ChatMessage["type"] = "text",
      roomId?: string,
      fileUrl?: string,
      fileName?: string,
    ) => {
      try {
        const token = getToken();
        if (!token) throw new Error("Not authenticated");

        // 通过WebSocket发送消息
        WebSocketManager.send("private_message", {
          recipient_id: recipientId,
          content: text,
          type,
          file_url: fileUrl,
          file_name: fileName,
          room_id: roomId,
        });

        // 本地更新消息列表
        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: "me", // 本地使用'me'表示当前用户
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

        // 更新好友列表中的最后一条消息
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
      } catch (err) {
        console.error("Failed to send message:", err);
        throw err;
      }
    },
    [],
  );

  // 发送好友请求
  const sendFriendRequest = useCallback((userId: string) => {
    WebSocketManager.send("friend_request", {
      recipient_id: userId,
      content: "I'd like to be your study friend!",
    });

    // 更新本地状态
    setFriends((prev) =>
      prev.map((f) => (f.id === userId ? { ...f, status: "pending_sent" } : f)),
    );
  }, []);

  // 接受好友请求
  const acceptFriendRequest = useCallback(
    (userId: string) => {
      WebSocketManager.send("accept_friend_request", {
        friend_id: userId,
      });

      // 更新本地状态
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

  // 拒绝好友请求
  const rejectFriendRequest = useCallback((userId: string) => {
    // 更新本地状态，从好友列表中移除
    setFriends((prev) => prev.filter((f) => f.id !== userId));
  }, []);

  // 添加好友
  const addFriend = useCallback(
    async (search: string) => {
      try {
        const token = getToken();
        if (!token) throw new Error("Not authenticated");

        // 搜索用户
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(search)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) throw new Error("Failed to search users");

        const users = await response.json();
        if (users.length === 0) {
          throw new Error("User not found");
        }

        const user = users[0];
        const existingFriend = friends.find((f) => f.id === user.id);

        // 检查是否是当前用户
        const currentUserId = localStorage.getItem("user_id");
        if (user.id === currentUserId) {
          throw new Error("Cannot add yourself as a friend");
        }

        if (!existingFriend) {
          // 添加到好友列表
          const newFriend: Friend = {
            ...user,
            lastMessage: undefined,
            lastTime: undefined,
            lastTimestamp: Date.now(),
            unreadCount: 0,
            status: "stranger",
          };

          setFriends((prev) => [newFriend, ...prev]);
          return newFriend.id;
        }

        return existingFriend.id;
      } catch (err) {
        console.error("Failed to add friend:", err);
        throw err;
      }
    },
    [friends],
  );

  // 随机匹配用户
  const startRandomMatch = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch("/api/users/match/random", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to find match");

      const matchedUser = await response.json();
      const newFriend: Friend = {
        ...matchedUser,
        lastMessage: undefined,
        lastTime: undefined,
        lastTimestamp: Date.now(),
        unreadCount: 0,
        status: "stranger",
      };

      // 添加到好友列表
      setFriends((prev) => [newFriend, ...prev]);
      return newFriend.id;
    } catch (err) {
      console.error("Failed to start random match:", err);
      throw err;
    }
  }, []);

  // 标记消息为已读
  const clearUnread = useCallback(async (friendId: string) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      await fetch(`/api/messages/${friendId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 更新本地状态
      setFriends((prev) =>
        prev.map((f) => (f.id === friendId ? { ...f, unreadCount: 0 } : f)),
      );
    } catch (err) {
      console.error("Failed to clear unread messages:", err);
    }
  }, []);

  // 初始化WebSocket连接
  useEffect(() => {
    // 连接WebSocket
    WebSocketManager.connect();

    // 监听连接状态
    const handleConnect = () => {
      setIsConnected(true);

      // 连接成功后，加载好友列表
      loadFriends();

      // 获取用户ID并加入用户房间
      const userId = localStorage.getItem("user_id");
      if (userId) {
        WebSocketManager.send("join_room", { room_id: `user_${userId}` });
      }
    };
    const handleDisconnect = () => setIsConnected(false);
    const handleError = (error: any) =>
      setError(error.message || "WebSocket error");

    WebSocketManager.on("connect", handleConnect);
    WebSocketManager.on("disconnect", handleDisconnect);
    WebSocketManager.on("error", handleError);

    // 保存监听器到ref
    socketListenerRef.current.connect = handleConnect;
    socketListenerRef.current.disconnect = handleDisconnect;
    socketListenerRef.current.error = handleError;

    return () => {
      // 移除监听器
      WebSocketManager.off("connect", handleConnect);
      WebSocketManager.off("disconnect", handleDisconnect);
      WebSocketManager.off("error", handleError);

      // 断开WebSocket连接
      WebSocketManager.disconnect();
    };
  }, [loadFriends]);

  // 监听新消息
  useEffect(() => {
    const handleNewPrivateMessage = (data: any) => {
      const {
        sender_id,
        recipient_id,
        content,
        type,
        file_url,
        file_name,
        room_id,
        created_at,
      } = data;

      // 转换为前端使用的消息格式
      const newMessage: ChatMessage = {
        id: data.message_id,
        senderId: sender_id,
        text: content,
        timestamp: new Date(created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: type as ChatMessage["type"],
        roomId: room_id,
        fileUrl: file_url,
        fileName: file_name,
      };

      // 更新消息列表
      // 确定聊天的对方ID
      const friendId = sender_id; // 因为消息来自对方
      setMessagesByUserId((prev) => ({
        ...prev,
        [friendId]: [...(prev[friendId] || []), newMessage],
      }));

      // 更新好友列表中的最后一条消息
      setFriends((prev) =>
        prev.map((f) => {
          if (f.id === friendId) {
            return {
              ...f,
              lastMessage:
                type === "file"
                  ? `📁 ${file_name}`
                  : type === "friend_request"
                    ? "Sent a friend request"
                    : content,
              lastTime: "Just now",
              lastTimestamp: Date.now(),
              unreadCount: f.unreadCount + 1, // 增加未读计数
            };
          }
          return f;
        }),
      );
    };

    WebSocketManager.on("new_private_message", handleNewPrivateMessage);
    socketListenerRef.current.new_private_message = handleNewPrivateMessage;

    return () => {
      WebSocketManager.off("new_private_message", handleNewPrivateMessage);
    };
  }, []);

  // 监听好友请求
  useEffect(() => {
    const handleNewFriendRequest = async (data: any) => {
      const { sender_id, request_id, content, created_at } = data;

      // 调用API获取发送者的详细信息
      try {
        const token = getToken();
        if (!token) throw new Error("Not authenticated");

        // 搜索用户
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(sender_id)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) throw new Error("Failed to search user");

        const users = await response.json();
        if (users.length === 0) throw new Error("User not found");

        const sender = users[0];

        // 更新好友列表，添加发送者为pending_received状态
        setFriends((prev) => {
          // 检查是否已经存在
          const existing = prev.find((f) => f.id === sender_id);
          if (existing) return prev;

          // 添加到好友列表
          const newFriend: Friend = {
            ...sender,
            lastMessage: undefined,
            lastTime: undefined,
            lastTimestamp: Date.now(),
            unreadCount: 0,
            status: "pending_received",
          };

          return [newFriend, ...prev];
        });
      } catch (err) {
        console.error("Failed to handle new friend request:", err);
      }
    };

    const handleFriendRequestAccepted = async (data: any) => {
      const { friend_id } = data;

      // 调用API获取好友的详细信息
      try {
        const token = getToken();
        if (!token) throw new Error("Not authenticated");

        // 搜索用户
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(friend_id)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) throw new Error("Failed to search user");

        const users = await response.json();
        if (users.length === 0) throw new Error("User not found");

        const friend = users[0];

        // 更新好友列表，将好友状态更新为friend
        setFriends((prev) =>
          prev.map((f) =>
            f.id === friend_id
              ? {
                  ...f,
                  ...friend,
                  status: "friend",
                }
              : f,
          ),
        );
      } catch (err) {
        console.error("Failed to handle friend request accepted:", err);
      }
    };

    WebSocketManager.on("new_friend_request", handleNewFriendRequest);
    WebSocketManager.on("friend_request_accepted", handleFriendRequestAccepted);
    socketListenerRef.current.new_friend_request = handleNewFriendRequest;
    socketListenerRef.current.friend_request_accepted =
      handleFriendRequestAccepted;

    return () => {
      WebSocketManager.off("new_friend_request", handleNewFriendRequest);
      WebSocketManager.off(
        "friend_request_accepted",
        handleFriendRequestAccepted,
      );
    };
  }, []);

  return {
    friends,
    messagesByUserId,
    isConnected,
    loading,
    error,
    sendMessage,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    addFriend,
    clearUnread,
    startRandomMatch,
    loadMessages,
  };
};
