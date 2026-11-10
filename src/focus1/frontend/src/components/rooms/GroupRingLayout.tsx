import React, { useState, useMemo } from "react";
import { VideoPane } from "./VideoPane";

interface GroupRingLayoutProps {
  localStream: MediaStream | null;
  isVirtualActive: boolean;
  participants: any[];
  remoteStreams: Map<string, MediaStream>;
}

export const GroupRingLayout: React.FC<GroupRingLayoutProps> = ({
  localStream,
  isVirtualActive,
  participants,
  remoteStreams,
}) => {
  const [centerId, setCenterId] = useState<string>("me");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const all = useMemo(
    () => [
      { id: "me", name: localStorage.getItem("username") || "You", isMe: true },
      ...participants,
    ],
    [participants],
  );

  const currentCenterData = useMemo(
    () => all.find((p) => p.id === centerId) || all[0],
    [centerId, all],
  );
  const ringParticipants = useMemo(
    () => all.filter((p) => p.id !== centerId),
    [all, centerId],
  );

  const visibleRing = useMemo(
    () => ringParticipants.slice(page * pageSize, (page + 1) * pageSize),
    [ringParticipants, page],
  );

  const handleInteraction = (id: string) => {
    setCenterId(id);
  };

  const getRemoteStream = (participantId: string) => {
    const userId = participantId.replace("user-", "");
    return (
      remoteStreams.get(userId) || remoteStreams.get(String(userId)) || null
    );
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center animate-in zoom-in duration-700">
      {/* Center Main Stage */}
      <div className="w-[50%] md:w-[45%] max-w-[800px] aspect-video z-20 shadow-[0_80px_160px_rgba(0,0,0,0.6)] rounded-2xl transition-all duration-700">
        <VideoPane
          id={centerId}
          name={currentCenterData.name}
          isMe={centerId === "me"}
          isVirtual={
            centerId === "me"
              ? isVirtualActive
              : (currentCenterData as any).isVirtual
          }
          isEnlarged={false}
          stream={centerId === "me" ? localStream : getRemoteStream(centerId)}
          onEnlarge={() => {}}
        />
      </div>

      {/* Pagination Controls for Ring */}
      {ringParticipants.length > pageSize && (
        <div className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50 pointer-events-auto">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="w-10 h-10 rounded-full bg-black/30 border border-white/20 text-white flex items-center justify-center hover:bg-black/50 disabled:opacity-20 transition-all"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M5 15l7-7 7 7" strokeWidth="2.5" />
            </svg>
          </button>
          <button
            disabled={(page + 1) * pageSize >= ringParticipants.length}
            onClick={() => setPage((p) => p + 1)}
            className="w-10 h-10 rounded-full bg-black/30 border border-white/20 text-white flex items-center justify-center hover:bg-black/50 disabled:opacity-20 transition-all"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" strokeWidth="2.5" />
            </svg>
          </button>
        </div>
      )}

      {/* The Polar Ring */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-full h-full">
          {visibleRing.map((p, i) => {
            const count = visibleRing.length;
            const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
            const radiusX = 40; // in %
            const radiusY = 36; // in %
            const x = 50 + Math.cos(angle) * radiusX;
            const y = 50 + Math.sin(angle) * radiusY;

            return (
              <div
                key={p.id}
                className="absolute w-44 sm:w-48 h-28 sm:h-30 pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 hover:scale-110 hover:z-50 shadow-2xl"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <VideoPane
                  {...p}
                  isMe={p.id === "me"}
                  isVirtual={
                    p.id === "me" ? isVirtualActive : (p as any).isVirtual
                  }
                  stream={p.id === "me" ? localStream : getRemoteStream(p.id)}
                  onEnlarge={handleInteraction}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
