
export type LayoutType = 'Layout1' | 'Layout2' | 'Layout3';

export type RoomType = '1:1' | '1:many' | '1:pro';

export interface Room {
  id: string;
  title: string;
  type: RoomType;
  participants: number;
  maxParticipants: number;
  tags: string[];
  status: 'live' | 'idle' | 'scheduled';
  virtualAllowed: boolean;
  thumbnail: string;
  isPaid: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  isPro: boolean;
  points: number;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
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
  themeMode: 'light' | 'dark' | 'sepia';
  whiteNoiseDefault: string;
  notifications: boolean;
  fontSize: 'sm' | 'base' | 'lg';
}
