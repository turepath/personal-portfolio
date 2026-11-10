import React, { useState, useEffect, useMemo } from "react";
import { useChat, Friend } from "../hooks/useChat";
import { useNotifications } from "../hooks/useNotifications";
import { FriendRow } from "../components/community/FriendRow";
import { ChatWindow } from "../components/community/ChatWindow";
import { Badge, Button, Modal } from "../components/Common";

const SearchUserModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSearch: (val: string) => void;
}> = ({ isOpen, onClose, onSearch }) => {
  const [query, setQuery] = useState("");
  const isValid =
    (query.length === 8 && !isNaN(Number(query))) || query.includes("@");

  const handleAction = () => {
    if (isValid) {
      onSearch(query);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in"
        onClick={onClose}
      ></div>
      <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-300">
        <h3 className="text-2xl font-black text-earth-text tracking-tighter mb-2">
          Find Scholar
        </h3>
        <p className="text-xs text-earth-text-sec mb-8">
          Enter 8-digit account ID or user email to search.
        </p>

        <input
          autoFocus
          type="text"
          placeholder="e.g. 12345678 or scholar@edu.com"
          className="w-full bg-earth-bg border-2 border-earth-border rounded-2xl px-6 py-4 text-sm font-bold focus:border-earth-accent outline-none transition-all mb-6"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAction()}
        />

        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1 shadow-lg uppercase tracking-widest font-black"
            onClick={handleAction}
            disabled={!isValid}
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export const Messages: React.FC = () => {
  const {
    friends,
    messagesByUserId,
    sendMessage,
    sendFriendRequest,
    acceptFriendRequest,
    addFriend,
    clearUnread,
    startRandomMatch,
  } = useChat();
  const { notifications, counts, markAllRead } = useNotifications();

  const [activeTab, setActiveTab] = useState<"chats" | "notifications">(
    "chats",
  );
  const [chatView, setChatView] = useState<"recent" | "friends">("recent");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [notifFilter, setNotifFilter] = useState<
    "like" | "favorite" | "comment" | null
  >(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const activeFriend = friends.find((f) => f.id === activeChatId);
  const filteredNotifs = notifFilter
    ? notifications.filter((n) => n.type === notifFilter)
    : notifications;

  useEffect(() => {
    if (activeTab === "notifications") {
      markAllRead();
    }
  }, [activeTab, markAllRead]);

  const sortedRecentFriends = useMemo(() => {
    return [...friends].sort(
      (a, b) => (b.lastTimestamp || 0) - (a.lastTimestamp || 0),
    );
  }, [friends]);

  const groupedFriends = useMemo(() => {
    const sorted = [...friends].sort((a, b) =>
      a.username.localeCompare(b.username),
    );
    return sorted.reduce(
      (acc, friend) => {
        const firstLetter = friend.username.charAt(0).toUpperCase();
        if (!acc[firstLetter]) acc[firstLetter] = [];
        acc[firstLetter].push(friend);
        return acc;
      },
      {} as Record<string, Friend[]>,
    );
  }, [friends]);

  const sortedLetters = useMemo(
    () => Object.keys(groupedFriends).sort(),
    [groupedFriends],
  );

  const handleAddRequest = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    sendFriendRequest(id);
  };

  const handleAccept = (uid: string) => {
    acceptFriendRequest(uid);
  };

  /* Added missing handleRandomMatch function */
  const handleRandomMatch = () => {
    const id = startRandomMatch();
    setActiveChatId(id);
    setActiveTab("chats");
    setChatView("recent");
    clearUnread(id);
  };

  return (
    <div className="max-w-7xl mx-auto h-[700px] bg-white rounded-[2.5rem] border border-earth-border shadow-2xl flex overflow-hidden animate-in fade-in duration-500">
      <div className="w-[380px] border-r border-earth-border flex flex-col bg-earth-bg/20 shrink-0 h-full overflow-hidden">
        <div className="p-8 pb-4 space-y-6 flex-shrink-0">
          <h2 className="text-2xl font-black text-earth-text tracking-tighter">
            Inbox
          </h2>

          <div className="flex bg-white rounded-2xl p-1 border border-earth-border shadow-sm">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === "chats" ? "bg-earth-accent text-white shadow-lg" : "text-earth-text-sec hover:bg-earth-bg"}`}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all relative ${activeTab === "notifications" ? "bg-earth-accent text-white shadow-lg" : "text-earth-text-sec hover:bg-earth-bg"}`}
            >
              Activity
              {counts.total > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 bg-earth-danger rounded-full ring-2 ring-white"></span>
              )}
            </button>
          </div>

          {activeTab === "chats" ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setIsSearchModalOpen(true)}
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-earth-border rounded-2xl hover:border-earth-accent transition-all group shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-earth-bg flex items-center justify-center text-earth-text-sec group-hover:text-earth-accent">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 4v16m8-8H4" strokeWidth="3" />
                    </svg>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-earth-text">
                    Search
                  </span>
                </button>
                <button
                  onClick={() =>
                    setChatView(chatView === "friends" ? "recent" : "friends")
                  }
                  className={`flex-col items-center justify-center gap-2.5 p-4 border rounded-2xl transition-all shadow-sm ${chatView === "friends" ? "bg-earth-accent text-white border-earth-accent" : "bg-white border-earth-border text-earth-text hover:border-earth-accent"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${chatView === "friends" ? "bg-white/20" : "bg-earth-bg text-earth-text-sec"}`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"
                        strokeWidth="2.5"
                      />
                    </svg>
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest ${chatView === "friends" ? "text-white" : "text-earth-text"}`}
                  >
                    Friends
                  </span>
                </button>
                <button
                  onClick={handleRandomMatch}
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-earth-accent text-white rounded-2xl hover:opacity-90 transition-all shadow-md"
                >
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="3" />
                    </svg>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Match
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-white border border-earth-border rounded-2xl p-3 text-center shadow-sm">
                <p className="text-[9px] font-black uppercase text-earth-text-sec mb-1 tracking-widest">
                  Likes
                </p>
                <p className="text-xl font-black text-earth-danger">
                  {counts.likes}
                </p>
              </div>
              <div className="bg-white border border-earth-border rounded-2xl p-3 text-center shadow-sm">
                <p className="text-[9px] font-black uppercase text-earth-text-sec mb-1 tracking-widest">
                  Saved
                </p>
                <p className="text-xl font-black text-earth-warning">
                  {counts.favorites}
                </p>
              </div>
              <div className="bg-white border border-earth-border rounded-2xl p-3 text-center shadow-sm">
                <p className="text-[9px] font-black uppercase text-earth-text-sec mb-1 tracking-widest">
                  Talks
                </p>
                <p className="text-xl font-black text-earth-accent">
                  {counts.comments}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8 scrollbar-hide scroll-smooth h-full">
          {activeTab === "chats" ? (
            friends.length > 0 ? (
              chatView === "friends" ? (
                <div className="space-y-6 pt-2">
                  {sortedLetters.map((letter) => (
                    <div key={letter} className="space-y-1">
                      <div className="px-4 py-1.5 sticky top-0 bg-white/80 backdrop-blur-md z-10 rounded-lg shadow-sm border border-earth-border/20">
                        <span className="text-[10px] font-black text-earth-accent uppercase tracking-[0.2em]">
                          {letter}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {groupedFriends[letter].map((f) => (
                          <FriendRow
                            key={f.id}
                            friend={f}
                            onClick={() => {
                              setActiveChatId(f.id);
                              clearUnread(f.id);
                            }}
                            onAddFriend={handleAddRequest}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1 pt-2">
                  {sortedRecentFriends.map((f) => (
                    <FriendRow
                      key={f.id}
                      friend={f}
                      onClick={() => {
                        setActiveChatId(f.id);
                        clearUnread(f.id);
                      }}
                      onAddFriend={handleAddRequest}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="py-20 text-center opacity-20 italic text-sm">
                No scholars found
              </div>
            )
          ) : (
            <div className="space-y-4 pt-4">
              <div className="flex gap-2 mb-4 px-2">
                {(["like", "favorite", "comment"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setNotifFilter(notifFilter === f ? null : f)}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${notifFilter === f ? "bg-earth-accent border-earth-accent text-white" : "bg-white border-earth-border text-earth-text-sec"}`}
                  >
                    {f}s
                  </button>
                ))}
              </div>
              {filteredNotifs.map((n) => (
                <div
                  key={n.id}
                  className="flex gap-4 p-4 rounded-2xl hover:bg-white transition-all group"
                >
                  <img
                    src={n.fromUser.avatar}
                    className="w-10 h-10 rounded-full shrink-0 border border-white shadow-sm"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-earth-text leading-tight">
                      <span className="font-black">{n.fromUser.username}</span>{" "}
                      {n.type === "like" ? "liked" : "intered with"} your post{" "}
                      <span className="text-earth-accent font-bold group-hover:underline transition-all">
                        "{n.postTitle}"
                      </span>
                    </p>
                    <p className="text-[9px] font-black text-earth-text-sec uppercase mt-1 opacity-60 tracking-widest">
                      {n.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white relative h-full">
        {activeChatId && activeFriend ? (
          <div className="h-full animate-in fade-in duration-500">
            <ChatWindow
              inline
              friendId={activeChatId}
              friendName={activeFriend.username}
              messages={messagesByUserId[activeChatId] || []}
              onClose={() => setActiveChatId(null)}
              onAcceptRequest={handleAccept}
              onSend={(txt, type, rid, furl, fname) => {
                try {
                  // Convert type to match expected types
                  const messageType =
                    type === "image" ? "file" : type === "task" ? "text" : type;
                  sendMessage(activeChatId, txt, messageType, rid, furl, fname);
                } catch (e: any) {
                  alert(e.message);
                }
              }}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-30 select-none">
            <div className="w-32 h-32 bg-earth-accent/5 rounded-full flex items-center justify-center mb-8 ring-2 ring-earth-accent/10">
              <svg
                className="w-16 h-16 text-earth-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <h3 className="text-xl font-black text-earth-text uppercase tracking-[0.4em] mb-4">
              Focus Chat
            </h3>
            <p className="max-w-md text-sm font-medium leading-relaxed">
              Select a scholar from the list or start a random match to find a
              study partner.
            </p>
          </div>
        )}
      </div>

      <SearchUserModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSearch={(query) => {
          const id = addFriend(query);
          setActiveChatId(id);
          clearUnread(id);
        }}
      />
    </div>
  );
};
