export type LayoutType = "Layout1" | "Layout2" | "Layout3";

export type RoomType = "1:1" | "1:many" | "1:pro";

export type PostCategory = "sharing" | "discussion";

export interface Room {
  id: string;
  title: string;
  type: RoomType;
  participants: number;
  maxParticipants: number;
  tags: string[];
  status: "live" | "idle" | "scheduled";
  virtualAllowed: boolean;
  thumbnail: string;
  isPaid: boolean;
}

export interface User {
  id: string;
  accountID: string; // 8-digit fixed ID
  name: string;
  avatar: string;
  isPro: boolean;
  points: number;
  bio?: string;
  birthDate?: string;
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  timestamp: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  category: PostCategory;
  likes: number;
  comments: number;
  favorites: number;
  shares: number;
  timestamp: string;
  media?: string[];
  tags?: string[];
  location?: string;
  replies?: Comment[];
}

export interface Notification {
  id: string;
  type: "like" | "favorite" | "comment";
  fromUser: User;
  postTitle: string;
  content?: string;
  timestamp: string;
  isUnread: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: "text" | "invite" | "file" | "friend_request";
  fileUrl?: string;
  fileName?: string;
  roomId?: string;
}

export interface WhiteNoiseTrack {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface WhiteNoiseState {
  isEnabled: boolean;
  trackId: string;
  volume: number;
}

export interface AppSettings {
  reduceMotion: boolean;
  themeMode: "light" | "dark" | "sepia";
  whiteNoiseDefault: string;
  notifications: boolean;
  fontSize: "sm" | "base" | "lg";
}

export interface Settings {
  id: number;
  user_id: number;
  theme: string;
  language: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  focus_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  long_break_interval: number;
  auto_start_break: boolean;
  auto_start_focus: boolean;
  sound_enabled: boolean;
  sound_volume: number;
  notification_sound: string;
  weekly_report_enabled: boolean;
}

export interface UpdateSettingsData {
  theme?: string;
  language?: string;
  notifications_enabled?: boolean;
  email_notifications?: boolean;
  focus_duration?: number;
  short_break_duration?: number;
  long_break_duration?: number;
  long_break_interval?: number;
  auto_start_break?: boolean;
  auto_start_focus?: boolean;
  sound_enabled?: boolean;
  sound_volume?: number;
  notification_sound?: string;
  weekly_report_enabled?: boolean;
}
