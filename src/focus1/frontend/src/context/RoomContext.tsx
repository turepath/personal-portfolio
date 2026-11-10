import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Room } from "../types";
import axios from "axios";
import { useAuth } from "./AuthContext";

interface RoomContextType {
  rooms: Room[];
  currentRoom: Room | null;
  isLoading: boolean;
  error: string | null;
  createRoom: (
    name: string,
    type: string,
    virtualAllowed: boolean,
  ) => Promise<Room | void>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  refreshRooms: () => Promise<void>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  // 获取房间列表
  const fetchRooms = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await axios.get("/api/rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRooms(response.data.items || []);
    } catch (err) {
      setError("Failed to fetch rooms");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 创建房间
  const createRoom = async (
    name: string,
    type: string,
    virtualAllowed: boolean,
  ): Promise<Room | void> => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      console.log("Creating room with data:", {
        name: name,
        type: type,
        virtual_allowed: virtualAllowed,
        max_participants: type === "1:many" ? 10 : 2,
      });

      const response = await axios.post(
        "/api/rooms",
        {
          name,
          type,
          virtual_allowed: virtualAllowed,
          max_participants: type === "1:many" ? 10 : 2,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Room created successfully:", response.data);
      setCurrentRoom(response.data);
      await fetchRooms();
      return response.data;
    } catch (err: any) {
      console.error("Failed to create room:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
        setError(err.response.data.error || "Failed to create room");
      } else if (err.request) {
        console.error("No response received:", err.request);
        setError("Network error - no response from server");
      } else {
        console.error("Error setting up request:", err.message);
        setError(err.message || "Failed to create room");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 删除房间
  const deleteRoom = async (roomId: string) => {
    if (!token) return;

    setIsLoading(true);
    try {
      await axios.delete(`/api/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRooms(rooms.filter((room) => room.id !== roomId));
      if (currentRoom?.id === roomId) {
        setCurrentRoom(null);
      }
    } catch (err) {
      setError("Failed to delete room");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 加入房间
  const joinRoom = async (roomId: string) => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        `/api/rooms/${roomId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setCurrentRoom(response.data);
      await fetchRooms();
    } catch (err) {
      setError("Failed to join room");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 退出房间
  const leaveRoom = async () => {
    if (!token || !currentRoom) return;

    setIsLoading(true);
    try {
      await axios.post(
        `/api/rooms/${currentRoom.id}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setCurrentRoom(null);
      await fetchRooms();
    } catch (err) {
      setError("Failed to leave room");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新房间列表
  const refreshRooms = async () => {
    await fetchRooms();
  };

  useEffect(() => {
    fetchRooms();
    // Refresh rooms every 30 seconds
    const interval = setInterval(() => {
      fetchRooms();
    }, 30000);

    return () => clearInterval(interval);
  }, [token]);

  const value: RoomContextType = {
    rooms,
    currentRoom,
    isLoading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    deleteRoom,
    refreshRooms,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
};
