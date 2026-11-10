
import React from 'react';
import { Room, Post, User, WhiteNoiseTrack } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  accountID: '88776655',
  name: 'Alex Rivera',
  avatar: 'https://picsum.photos/seed/alex/100/100',
  isPro: false,
  points: 1250,
  bio: 'Productivity enthusiast & Computer Science student.',
  birthDate: '1998-05-15'
};

export const MOCK_ROOMS: Room[] = [
  { id: 'r1', title: 'Deep Work Duo', type: '1:1', participants: 1, maxParticipants: 2, tags: ['live'], status: 'live', virtualAllowed: true, thumbnail: 'https://picsum.photos/seed/room1/400/300', isPaid: false },
  { id: 'r2', title: 'Authentic Flow', type: '1:1', participants: 0, maxParticipants: 2, tags: ['idle'], status: 'idle', virtualAllowed: false, thumbnail: 'https://picsum.photos/seed/room2/400/300', isPaid: false },
  { id: 'r3', title: 'Library Vibe', type: '1:many', participants: 12, maxParticipants: 30, tags: ['live'], status: 'live', virtualAllowed: true, thumbnail: 'https://picsum.photos/seed/room3/400/300', isPaid: false },
  { id: 'r4', title: 'Real Faces Study', type: '1:many', participants: 8, maxParticipants: 20, tags: ['live'], status: 'live', virtualAllowed: false, thumbnail: 'https://picsum.photos/seed/room4/400/300', isPaid: false },
  { id: 'r5', title: 'Executive Retreat', type: '1:1', participants: 1, maxParticipants: 2, tags: ['pro'], status: 'live', virtualAllowed: false, thumbnail: 'https://picsum.photos/seed/room5/400/300', isPaid: true },
  { id: 'r6', title: 'Private 1:1 Coaching', type: '1:1', participants: 1, maxParticipants: 2, tags: ['scheduled'], status: 'scheduled', virtualAllowed: true, thumbnail: 'https://picsum.photos/seed/room6/400/300', isPaid: true },
];

export const MOCK_POSTS: Post[] = [
  { id: 'p1', author: { ...MOCK_USER, name: 'Alex Rivera' }, content: "Just finished a 4-hour deep work block! The coffee shop noise track is perfect today. ☕️🚀", likes: 24, comments: 3, timestamp: '2h ago', category: 'sharing', favorites: 5, shares: 2 },
  { id: 'p2', author: { id: 'u2', name: 'Sarah J.', avatar: 'https://picsum.photos/seed/sarah/100/100', isPro: false, points: 450, accountID: '12345678' }, content: "Anyone want to join a Pomodoro session in 10 minutes? Looking for some accountability buddies!", likes: 12, comments: 8, timestamp: '4h ago', category: 'discussion', favorites: 10, shares: 3 },
];

export const WHITE_NOISE_TRACKS: WhiteNoiseTrack[] = [
  { id: 'rain', name: 'Soft Rain', icon: '🌧️', color: '#A5B4FC' },
  { id: 'waves', name: 'Ocean Waves', icon: '🌊', color: '#7DD3FC' },
  { id: 'cafe', name: 'Cafe Ambient', icon: '☕', color: '#FCD34D' },
  { id: 'wind', name: 'Mountain Wind', icon: '🌬️', color: '#94A3B8' },
];

export const DESIGN_TOKENS = {
  colors: {
    bg: '#F8F5F1',
    card: '#EFEAE2',
    accent: '#8A9B6E',
    text: '#5C5246'
  },
  typography: {
    h1: '28px',
    h2: '22px',
    h3: '18px',
    base: '16px'
  }
};
