export type LayoutType = "Layout1" | "Layout2" | "Layout3";
export type RoomType = "1:1" | "1:many" | "1:ai";
export type PostCategory = "sharing" | "discussion";

export type AICharacterId = "lin_xia" | "chen_mo" | "su_he";

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
  createdBy?: string;
  sessionDuration?: number;
  aiCharacter?: AICharacterId;
}

export interface User {
  id: string;
  accountID: string;
  username: string;
  name?: string;
  avatar: string;
  isPro: boolean;
  points: number;
  bio?: string;
  birthDate?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  useraccount_id: string;
  content: string;
  created_at: string;
  user: User;
  timestamp?: string;
}

export interface Post {
  id: string;
  author: User;
  author_id: string;
  content: string;
  title?: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  favorites: number;
  timestamp: string;
  category: "sharing" | "discussion";
  images?: string[];
  videos?: string[];
  media?: string[];
  tags?: string[];
  location?: string;
  replies?: Comment[];
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WhiteNoiseTrack {
  id: string;
  name: string;
  icon: string;
  color: string;
  isLocked?: boolean;
}

export interface RoomBackground {
  id: string;
  name: string;
  type: "image" | "gradient";
  value: string;
  isLocked?: boolean;
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

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: "text" | "file" | "friend_request" | "invite";
  roomId?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface Notification {
  id: string;
  type: "like" | "favorite" | "comment";
  fromUser: User;
  postTitle: string;
  timestamp: string;
  isUnread: boolean;
  content?: string;
}

/**
 * Configuration for the custom virtual avatar.
 */
export interface AvatarConfig {
  skinColor: string;
  faceShape: "round" | "oval" | "heart";
  eyeStyle: "sparkle_eye" | "default";
  browsStyle: "soft_arch" | "straight" | "none";
  mouthStyle: "soft_smile" | "big_grin" | "none";
  blush: boolean;
  hairStyle: "cloud_curls" | "sleek_bob" | "long_wavy" | "none";
  hairColor: string;
  hairGradientColor: string;
  outfitType: "striped_shirt" | "hoodie" | "none";
  outfitColor: string;
  accessoryColor: string;
  glasses: "none" | "round" | "square";
  headwear: "none" | "baseball_cap" | "beanie";
  prop: "none" | "backpack" | "laptop";
  expression: "smile" | "tilt_left" | "tilt_right";
  backgroundId: "grassland" | "sky" | "desk" | "flowers";
}
