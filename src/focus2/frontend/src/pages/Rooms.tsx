import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_ROOMS } from "../utils/constants";
import { RoomCard } from "../components/RoomCard";
import { Modal, Button, Badge } from "../components/Common";
import { Room } from "../utils/types";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/index";

const CreateRoomModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (room: any) => void;
  isLoading: boolean;
  error: string | null;
}> = ({ isOpen, onClose, onCreate, isLoading, error }) => {
  const [title, setTitle] = useState("");
  const [capacity, setCapacity] = useState(2);
  const [duration, setDuration] = useState(25);
  const [type, setType] = useState<"1:1" | "1:many">("1:1");
  const [isVirtual, setIsVirtual] = useState(true);
  const [showDurationTip, setShowDurationTip] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      room_name: title || `${type.toUpperCase()} Focus Session`,
      room_type: type === "1:many" ? "group" : "one-on-one",
      population_max: capacity,
      Avatars: isVirtual,
      sessionDuration: duration,
    });
  };

  if (!isOpen) return null;

  const PRESET_TAGS = [
    "Deep Work",
    "Exam Prep",
    "Coding",
    "Reading",
    "Pomodoro",
  ];

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in"
        onClick={onClose}
      ></div>
      <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
        <div className="p-10 border-b border-earth-border bg-earth-bg/30">
          <h3 className="text-3xl font-black text-earth-text tracking-tighter uppercase">
            Customize Space
          </h3>
          <p className="text-sm text-earth-text-sec mt-1">
            Configure your personal focus environment.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-widest px-1">
              Room Theme / Title
            </label>
            <input
              type="text"
              placeholder="e.g. Midterm Grind, Design Sprint..."
              className="w-full bg-earth-bg border border-earth-border rounded-2xl px-6 py-4 text-sm font-bold focus:border-earth-accent outline-none transition-all shadow-inner"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTitle(tag)}
                  className="px-3 py-1 bg-earth-card rounded-full text-[10px] font-bold text-earth-text hover:bg-earth-accent hover:text-white transition-all border border-earth-border"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-widest px-1">
                Layout
              </label>
              <div className="flex flex-col gap-2">
                {(["1:1", "1:many"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-3 px-4 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all ${type === t ? "border-earth-accent bg-earth-accent/5 text-earth-accent shadow-sm" : "border-earth-border text-earth-text-sec hover:bg-earth-bg"}`}
                  >
                    {t === "1:1" ? "One-on-One" : "Group Study"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 px-2 pt-2">
                <input
                  type="checkbox"
                  id="v-allowed"
                  checked={isVirtual}
                  onChange={(e) => setIsVirtual(e.target.checked)}
                  className="w-4 h-4 accent-earth-accent"
                />
                <label
                  htmlFor="v-allowed"
                  className="text-[10px] font-bold text-earth-text uppercase"
                >
                  Allow Virtual Avatars
                </label>
              </div>
            </div>
            <div className="space-y-4">
              {type === "1:many" && (
                <>
                  <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-widest px-1">
                    Capacity: {capacity}
                  </label>
                  <div className="bg-earth-bg p-4 rounded-2xl border border-earth-border shadow-inner">
                    <input
                      type="range"
                      min="2"
                      max="30"
                      className="w-full accent-earth-accent cursor-pointer"
                      value={capacity}
                      onChange={(e) => setCapacity(parseInt(e.target.value))}
                    />
                    <div className="flex justify-between text-[8px] font-black uppercase mt-2 opacity-60">
                      <span>2 Scholars</span>
                      <span>30 Scholars</span>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2">
                <div className="flex items-center justify-between px-1 mb-2">
                  <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-widest">
                    Duration: {duration}m
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setShowDurationTip(true)}
                      onMouseLeave={() => setShowDurationTip(false)}
                      onClick={() => setShowDurationTip(!showDurationTip)}
                      className="w-4 h-4 rounded-full bg-earth-accent/20 text-earth-accent flex items-center justify-center text-[10px] hover:bg-earth-accent hover:text-white transition-all"
                    >
                      i
                    </button>
                    {showDurationTip && (
                      <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-earth-border rounded-xl p-3 shadow-xl z-50 animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <p className="text-[9px] font-black text-earth-accent uppercase tracking-widest mb-2">
                          Focus Advice
                        </p>
                        <ul className="space-y-2 text-[10px] text-earth-text-sec leading-tight font-medium">
                          <li>
                            <span className="font-bold text-earth-text">
                              25m:
                            </span>{" "}
                            Classic Pomodoro. Perfect for quick tasks.
                          </li>
                          <li>
                            <span className="font-bold text-earth-text">
                              50m:
                            </span>{" "}
                            Deep Work sweet spot. Optimized retention.
                          </li>
                          <li>
                            <span className="font-bold text-earth-text">
                              90m:
                            </span>{" "}
                            Ultradian rhythm. Best for complex solving.
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-earth-bg p-4 rounded-2xl border border-earth-border shadow-inner">
                  <input
                    type="range"
                    min="25"
                    max="90"
                    step="5"
                    className="w-full accent-earth-accent cursor-pointer"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                  />
                  <div className="flex justify-between text-[8px] font-black uppercase mt-2 opacity-60">
                    <span>25 Min</span>
                    <span>90 Min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-14 uppercase font-black tracking-widest"
              onClick={onClose}
              type="button"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="flex-1 h-14 uppercase font-black shadow-lg tracking-widest"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Generate ID"}
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-earth-danger/10 border border-earth-danger rounded-xl">
              <p className="text-xs font-black text-earth-danger uppercase tracking-widest">
                {error}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export const Rooms: React.FC = () => {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createdRoomData, setCreatedRoomData] = useState<Partial<Room> | null>(
    null,
  );
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const navigate = useNavigate();

  const columns = [
    {
      title: "Personal (1:1)",
      subtitle: "Paired Accountability",
      filter: (r: Room) => r.type === "1:1",
    },
    {
      title: "Collective (Many)",
      subtitle: "Library Flow",
      filter: (r: Room) => r.type === "1:many",
    },
    {
      title: "Artificial (AI)",
      subtitle: "Smart Study Buddy",
      filter: (r: Room) => r.type === "1:ai",
    },
  ];

  const handleEnterRoom = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleCreateRoom = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create room");
      }

      const roomData = await response.json();
      setCreatedRoomData(roomData);
      setIsCreating(false);

      // 刷新房间列表，显示新创建的房间
      const roomsResponse = await apiClient.get("/api/rooms");
      setRooms(roomsResponse.data.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while creating the room",
      );
      console.error("Error creating room:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.length >= 8) {
      navigate(`/room/${searchId}`);
    }
  };

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoadingRooms(true);
      try {
        const response = await apiClient.get("/api/rooms");
        setRooms(response.data.items);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        // 出错时使用模拟数据作为 fallback
        setRooms(MOCK_ROOMS);
      } finally {
        setIsLoadingRooms(false);
      }
    };

    fetchRooms();
  }, []);

  const copyId = () => {
    if (createdRoomData?.id) {
      navigator.clipboard.writeText(createdRoomData.id);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const handleDeleteRoom = async (room: Room) => {
    try {
      // 发送DELETE请求删除房间
      await apiClient.delete(`/api/rooms/${room.id}`);

      // 刷新房间列表
      const response = await apiClient.get("/api/rooms");
      setRooms(response.data.items);
    } catch (err) {
      console.error("Error deleting room:", err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 py-12 border-b border-earth-border/50">
        <div className="text-center lg:text-left flex-1">
          <h2 className="text-5xl font-black text-earth-text tracking-tighter uppercase">
            Focus Ecosystem
          </h2>
          <p className="text-earth-text-sec text-lg font-medium mt-2">
            All rooms are open access. Join your flow.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Join by ID Search Bar */}
          <form
            onSubmit={handleSearchJoin}
            className="relative group w-full sm:w-80"
          >
            <input
              type="text"
              maxLength={8}
              placeholder="Search 8-digit Room ID..."
              className="w-full h-16 bg-white border-2 border-earth-border rounded-2xl px-12 py-2 text-sm font-black tracking-widest focus:border-earth-accent focus:bg-earth-bg/30 outline-none transition-all shadow-sm"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.replace(/\D/g, ""))}
            />
            <svg
              className="w-5 h-5 absolute left-4 top-5.5 text-earth-text-sec group-focus-within:text-earth-accent transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchId.length >= 8 && (
              <button
                type="submit"
                className="absolute right-2 top-2 h-12 px-5 bg-earth-accent text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-earth-accent-hover transition-all animate-in fade-in slide-in-from-right-2"
              >
                Join
              </button>
            )}
          </form>

          <Button
            variant="primary"
            className="h-16 px-10 rounded-2xl shadow-xl hover:scale-105 transition-all font-black uppercase tracking-widest flex items-center gap-3 bg-[#1A1A1A] hover:bg-black text-white shrink-0 w-full sm:w-auto"
            onClick={() => setIsCreating(true)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 4v16m8-8H4" strokeWidth="3" />
            </svg>
            New Space
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {columns.map((col, idx) => (
          <div key={idx} className="flex flex-col gap-6">
            <div className="px-1 border-b border-earth-border pb-4 flex justify-between items-end">
              <div>
                <h3 className="text-lg font-black text-earth-text uppercase tracking-widest">
                  {col.title}
                </h3>
                <p className="text-[10px] text-earth-text-sec uppercase font-bold opacity-60 tracking-[0.2em] mt-1">
                  {col.subtitle}
                </p>
              </div>
              <Badge color="neutral">FREE</Badge>
            </div>
            <div className="space-y-6">
              {isLoadingRooms ? (
                <div className="bg-earth-card/20 border border-dashed border-earth-border rounded-2xl py-12 text-center opacity-40">
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    Loading Sessions...
                  </p>
                </div>
              ) : (
                <>
                  {rooms.filter(col.filter).map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onEnter={handleEnterRoom}
                      onDelete={handleDeleteRoom}
                      currentUserId={user?.id || ""}
                    />
                  ))}
                  {rooms.filter(col.filter).length === 0 && (
                    <div className="bg-earth-card/20 border border-dashed border-earth-border rounded-2xl py-12 text-center opacity-40">
                      <p className="text-[10px] font-black uppercase tracking-widest">
                        No Sessions Found...
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <CreateRoomModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onCreate={handleCreateRoom}
        isLoading={isLoading}
        error={error}
      />

      {createdRoomData?.id && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xl animate-in fade-in"
            onClick={() => setCreatedRoomData(null)}
          ></div>
          <div className="relative bg-white w-full max-w-md rounded-[3rem] p-12 text-center animate-in zoom-in duration-500 shadow-2xl border border-white/20">
            <div className="w-24 h-24 bg-earth-success/10 text-earth-success rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce duration-[2s]">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-earth-text tracking-tighter mb-4 uppercase">
              Room Deployed
            </h3>
            <p className="text-sm text-earth-text-sec mb-10 leading-relaxed font-medium">
              Your unique 8-digit identifier is active. Share it with your
              scholars.
            </p>

            <div className="flex flex-col gap-4">
              <div className="bg-earth-bg border-2 border-earth-border p-6 rounded-3xl flex items-center justify-between group transition-all hover:border-earth-accent">
                <span className="font-mono text-3xl font-black tracking-[0.4em] text-earth-text">
                  {createdRoomData.id}
                </span>
                <button
                  onClick={copyId}
                  className={`flex items-center gap-2 p-2 rounded-xl transition-all ${copyFeedback ? "bg-earth-success text-white" : "text-earth-accent hover:bg-earth-accent/10"}`}
                >
                  {copyFeedback ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 13l4 4L19 7" strokeWidth="4" />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        strokeWidth="2.5"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {copyFeedback && (
                <p className="text-xs font-black text-earth-success uppercase tracking-widest animate-pulse">
                  Successfully Copied!
                </p>
              )}

              <Button
                className="h-16 font-black uppercase tracking-widest shadow-xl mt-4 rounded-2xl"
                onClick={() => {
                  const room = createdRoomData;
                  setCreatedRoomData(null);
                  // 通过 state 传递时长
                  navigate(`/room/${room.id}`, {
                    state: { duration: room.sessionDuration },
                  });
                }}
              >
                Enter Session
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
        title="Ready to Focus?"
      >
        <div className="text-center p-4">
          <h4 className="font-black text-2xl mb-2 text-earth-text uppercase tracking-tight">
            {selectedRoom?.title}
          </h4>
          <div className="flex justify-center gap-2 mb-8">
            <Badge color={selectedRoom?.virtualAllowed ? "success" : "warning"}>
              {selectedRoom?.virtualAllowed
                ? "Avatar Supported"
                : "Authentic Video Only"}
            </Badge>
            <Badge color="neutral">Public Access</Badge>
          </div>
          <p className="text-earth-text-sec text-sm mb-10 leading-relaxed font-medium">
            Join {selectedRoom?.participants} others in this space. All features
            are free of charge.
          </p>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setSelectedRoom(null)}
              className="flex-1 h-14 font-black uppercase tracking-widest"
            >
              Back
            </Button>
            <Button
              variant="primary"
              className="flex-1 h-14 font-black uppercase shadow-lg tracking-widest"
              onClick={() => navigate(`/room/${selectedRoom?.id}`)}
            >
              Enter Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
