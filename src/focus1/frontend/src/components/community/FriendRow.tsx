import React from "react";
import { Friend } from "../../hooks/useChat";

interface FriendRowProps {
  friend: Friend;
  onClick: () => void;
  onAddFriend?: (e: React.MouseEvent, id: string) => void;
  onAcceptFriend?: (id: string) => void;
  onRejectFriend?: (id: string) => void;
}

export const FriendRow: React.FC<FriendRowProps> = ({
  friend,
  onClick,
  onAddFriend,
  onAcceptFriend,
  onRejectFriend,
}) => {
  const isStranger = friend.status === "stranger";
  const isPendingSent = friend.status === "pending_sent";
  const isPendingReceived = friend.status === "pending_received";
  const isFriend = friend.status === "friend";

  return (
    <div className="relative group px-1">
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left relative overflow-hidden ${isStranger ? "bg-earth-bg/30 border border-earth-border/50 hover:bg-earth-accent/5" : "hover:bg-earth-accent/5"}`}
      >
        <div className="relative shrink-0">
          <img
            src={friend.avatar}
            className={`w-11 h-11 rounded-full border border-earth-border group-hover:border-earth-accent transition-colors shadow-sm ${isStranger ? "grayscale-[0.5]" : ""}`}
            alt={friend.name}
          />
          {isFriend && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-earth-success border-2 border-white rounded-full"></div>
          )}
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <div className="flex justify-between items-center mb-0.5">
            <span
              className={`text-[13px] font-black truncate ${isStranger ? "text-earth-text/80" : "text-earth-text"}`}
            >
              {friend.name}
            </span>
            {isFriend && friend.lastTime && (
              <span className="text-[9px] font-bold text-earth-text-sec uppercase tracking-tighter whitespace-nowrap ml-2 opacity-60">
                {friend.lastTime}
              </span>
            )}
          </div>
          <p className="text-[11px] text-earth-text-sec truncate leading-tight opacity-70">
            {isStranger
              ? "Discovered Scholar"
              : isPendingSent
                ? "Friend request sent"
                : isPendingReceived
                  ? "Friend request received"
                  : friend.lastMessage || "No messages yet"}
          </p>
        </div>

        {friend.unreadCount > 0 && (
          <div className="w-2.5 h-2.5 bg-earth-danger rounded-full ring-4 ring-white absolute top-4 right-4 shadow-sm"></div>
        )}

        {/* Action Buttons */}
        <div className="shrink-0 ml-1 flex gap-1">
          {/* 陌生人状态：显示"加好友"按钮 */}
          {isStranger && onAddFriend && (
            <button
              onClick={(e) => onAddFriend(e, friend.id)}
              className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-earth-accent text-white hover:bg-earth-accent-hover shadow-sm active:scale-95"
            >
              加好友
            </button>
          )}

          {/* 已发送请求状态：显示"Pending"按钮 */}
          {isPendingSent && (
            <button
              disabled
              className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-earth-border text-earth-text-sec cursor-default"
            >
              Pending
            </button>
          )}

          {/* 收到请求状态：显示"接受"和"拒绝"按钮 */}
          {isPendingReceived && onAcceptFriend && onRejectFriend && (
            <>
              <button
                onClick={() => onAcceptFriend(friend.id)}
                className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-earth-success text-white hover:bg-earth-success/90 shadow-sm active:scale-95"
              >
                Accept
              </button>
              <button
                onClick={() => onRejectFriend(friend.id)}
                className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-earth-danger text-white hover:bg-earth-danger/90 shadow-sm active:scale-95"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </button>
    </div>
  );
};
