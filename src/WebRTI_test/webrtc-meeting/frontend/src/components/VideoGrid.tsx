import React, { useRef, useEffect } from "react";

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  userMap: Record<string, string>;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  remoteStreams,
  userMap,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // 处理本地视频流
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // 处理远程视频流的ref
  const handleRemoteVideoRef = (
    el: HTMLVideoElement | null,
    stream: MediaStream,
  ) => {
    if (el) {
      el.srcObject = stream;
      el.autoplay = true;
      el.playsInline = true;
    }
  };

  return (
    <div className="video-grid">
      {/* 本地视频小窗 */}
      {localStream && (
        <div className="video-container local-video">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="video-element"
          />
          <div className="video-overlay">
            <span className="video-label">我</span>
          </div>
        </div>
      )}

      {/* 远程视频 */}
      {Object.entries(remoteStreams).map(([sid, stream]) => (
        <div key={sid} className="video-container remote-video">
          <video
            ref={(el) => handleRemoteVideoRef(el, stream)}
            className="video-element"
          />
          <div className="video-overlay">
            <span className="video-label">
              {userMap[sid] || `参与者 ${sid.substring(0, 5)}`}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
