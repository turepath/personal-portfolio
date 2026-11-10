// Signaling interface abstracts the transport (WebSocket, WebRTC datachannel, etc.)
export type SignalEvent =
  | { type: "offer"; fromUserId: string; toUserId: string; sdp: RTCSessionDescriptionInit }
  | { type: "answer"; fromUserId: string; toUserId: string; sdp: RTCSessionDescriptionInit }
  | { type: "ice"; fromUserId: string; toUserId: string; candidate: RTCIceCandidateInit }
  | { type: "ring"; fromUserId: string; toUserId: string }
  | { type: "accept"; fromUserId: string; toUserId: string }
  | { type: "reject"; fromUserId: string; toUserId: string }
  | { type: "end"; fromUserId: string; toUserId: string };

export interface SignalingClient {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  send: (event: SignalEvent) => Promise<void>;
  onMessage: (handler: (event: SignalEvent) => void) => void;
  offMessage: (handler: (event: SignalEvent) => void) => void;
}


