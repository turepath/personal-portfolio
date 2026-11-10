"use client";
import Image from "next/image";
import { UserProfile } from "../../lib/types";

interface UserCardProps {
  user: UserProfile;
  onCall: (userId: string) => void;
  disabled?: boolean;
}

export function UserCard({ user, onCall, disabled }: UserCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="relative">
        <Image 
          src={user.avatarUrl || "/next.svg"} 
          alt={user.displayName} 
          width={48} 
          height={48} 
          className="rounded-full object-cover" 
        />
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
          user.isOnline ? "bg-green-500" : "bg-gray-400"
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{user.displayName}</div>
        <div className="text-xs text-gray-500">
          {user.isOnline ? "🟢 在线" : "⚫ 离线"}
        </div>
      </div>
      <button 
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          disabled 
            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
        }`} 
        onClick={() => !disabled && onCall(user.id)} 
        disabled={disabled}
        aria-label={`与 ${user.displayName} 进行视频通话`}
      >
        📹 视频通话
      </button>
    </div>
  );
}


