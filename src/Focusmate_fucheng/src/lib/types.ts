// Domain types for users and calls

export type UserId = string;

export interface UserProfile {
  id: UserId;
  displayName: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

export type CallId = string;

export type MediaState = {
  micEnabled: boolean;
  cameraEnabled: boolean;
};

export interface CallParticipant {
  user: UserProfile;
  media: MediaState;
}

export type CallStatus =
  | "idle"
  | "ringing"
  | "connecting"
  | "in-call"
  | "ended"
  | "failed";

export interface CallSession {
  id: CallId;
  caller: CallParticipant;
  callee: CallParticipant;
  status: CallStatus;
  startedAt?: number;
  endedAt?: number;
}


