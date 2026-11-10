import React, { useEffect, useRef, useState } from "react";
import { Badge } from "../Common";
import { MOCK_USER } from "../../utils/constants";

interface VideoPaneProps {
  id: string;
  name: string;
  isMe?: boolean;
  isVirtual?: boolean;
  isMasked?: boolean;
  isMuted?: boolean;
  isEnlarged?: boolean;
  avatar?: string;
  virtualEmoji?: string;
  stream?: MediaStream | null;
  onEnlarge: (id: string) => void;
}

declare const FaceDetection: any;

export const VideoPane: React.FC<VideoPaneProps> = ({
  id,
  name,
  isMe,
  isVirtual,
  isMasked,
  isMuted,
  isEnlarged,
  avatar,
  virtualEmoji = "🧐",
  stream,
  onEnlarge,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sticker Tracking States
  const [stickerPos, setStickerPos] = useState({ x: 50, y: 45, scale: 1 });
  const detectorRef = useRef<any>(null);
  const requestRef = useRef<number>(0);
  const smoothedPos = useRef({ x: 50, y: 45 });
  const smoothedScale = useRef(1.2);

  useEffect(() => {
    if (videoRef.current && stream && (isMe || !isVirtual)) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isVirtual, isMe]);

  // Face Tracking Logic
  useEffect(() => {
    if (isMe && (isMasked || isVirtual) && videoRef.current) {
      const faceDetection = new FaceDetection({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
      });

      faceDetection.setOptions({
        model: "short",
        minDetectionConfidence: 0.5,
      });

      faceDetection.onResults((results: any) => {
        if (results.detections && results.detections.length > 0) {
          const detection = results.detections[0];
          const { xCenter, yCenter, width } = detection.boundingBox;

          const lerpAmount = 0.22;
          smoothedPos.current.x =
            smoothedPos.current.x +
            (xCenter * 100 - smoothedPos.current.x) * lerpAmount;
          smoothedPos.current.y =
            smoothedPos.current.y +
            (yCenter * 100 - smoothedPos.current.y) * lerpAmount;

          const targetScale = Math.max(0.9, width * 5.8);
          smoothedScale.current =
            smoothedScale.current +
            (targetScale - smoothedScale.current) * 0.15;

          setStickerPos({
            x: smoothedPos.current.x,
            y: smoothedPos.current.y,
            scale: smoothedScale.current,
          });
        }
      });

      detectorRef.current = faceDetection;

      const detectFrame = async () => {
        if (
          videoRef.current &&
          detectorRef.current &&
          (isMasked || isVirtual)
        ) {
          if (videoRef.current.readyState >= 2) {
            try {
              await detectorRef.current.send({ image: videoRef.current });
            } catch (e) {}
          }
        }
        requestRef.current = requestAnimationFrame(detectFrame);
      };

      detectFrame();
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (detectorRef.current) {
        try {
          detectorRef.current.close();
        } catch (e) {}
      }
    };
  }, [isMe, isMasked, isVirtual]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement &&
          document.fullscreenElement === containerRef.current,
      );
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleNativeFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .catch((err) => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const displayAvatar = isMe
    ? MOCK_USER.avatar
    : avatar || `https://picsum.photos/seed/${id}/400/400`;
  const isCustomImage =
    virtualEmoji?.startsWith("data:image") || virtualEmoji?.length > 10;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-[#1A1A1A] shadow-2xl transition-all duration-700 ease-in-out group ${
        isFullscreen
          ? "w-screen h-screen rounded-none z-[1000]"
          : `rounded-[2rem] ${isEnlarged ? "w-full h-full" : "aspect-video w-full"}`
      }`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {isVirtual ? (
          <div className="w-full h-full bg-gradient-to-br from-[#2C2824] via-[#1A1A1A] to-black flex flex-col items-center justify-center overflow-hidden p-0 relative">
            {/* 如果当前贴纸是自定义 3D 形象 */}
            {isCustomImage ? (
              <div
                className="absolute pointer-events-none transition-transform duration-100"
                style={{
                  left: `${100 - stickerPos.x}%`,
                  top: `${stickerPos.y}%`,
                  transform: `translate(-50%, -50%) scale(${stickerPos.scale})`,
                  width: "80%",
                  height: "80%",
                }}
              >
                <img
                  src={virtualEmoji}
                  className="w-full h-full object-contain animate-sticker-float"
                  alt="Persona"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="w-32 aspect-square rounded-full border-4 border-white/20 overflow-hidden shadow-2xl">
                  <img
                    src={displayAvatar}
                    className="w-full h-full object-cover"
                    alt="User"
                  />
                </div>
                <div className="mt-6 text-4xl drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  {virtualEmoji}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] transition-all duration-700 ${isMasked ? "opacity-100" : "opacity-90 group-hover:opacity-100"}`}
            />

            {isMasked && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${100 - stickerPos.x}%`,
                  top: `${stickerPos.y}%`,
                  transform: `translate(-50%, -50%) scale(${stickerPos.scale})`,
                }}
              >
                <div className="relative">
                  {isCustomImage ? (
                    <img
                      src={virtualEmoji}
                      className="w-full h-full object-contain animate-sticker-float"
                      alt="Mask"
                    />
                  ) : (
                    <div className="text-[140px] drop-shadow-[0_15px_40px_rgba(0,0,0,0.4)] animate-sticker-float select-none">
                      {virtualEmoji}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isMe && !stream && (
              <img
                src={displayAvatar}
                className="w-full h-full object-cover absolute inset-0"
                alt={name}
              />
            )}
          </>
        )}
      </div>

      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none transition-opacity duration-700 ${isFullscreen ? "opacity-40" : "opacity-100"}`}
      ></div>

      <div
        className={`absolute left-4 flex items-center gap-2 transition-all duration-700 ${isFullscreen ? "bottom-8" : "bottom-4"}`}
      >
        <div className="bg-black/50 backdrop-blur-xl px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
          <span className="text-xs font-black text-white tracking-[0.2em] uppercase">
            {name} {isMe && "(YOU)"}
          </span>
        </div>
        {isMuted && <Badge color="danger">Silent</Badge>}
        {isMasked && <Badge color="accent">Tracking</Badge>}
        {isVirtual && isMe && isCustomImage && (
          <Badge color="success">3D PRO</Badge>
        )}
      </div>

      <div
        className={`absolute top-6 right-6 flex gap-2 transition-all duration-500 opacity-0 group-hover:opacity-100 ${isFullscreen ? "translate-y-[-10px] group-hover:translate-y-0" : "translate-y-2 group-hover:translate-y-0"}`}
      >
        <button
          onClick={toggleNativeFullscreen}
          className={`p-3 backdrop-blur-md text-white rounded-xl transition-all shadow-xl border border-white/10 ${isFullscreen ? "bg-earth-danger/40 hover:bg-earth-danger" : "bg-white/10 hover:bg-earth-accent"}`}
          title={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isFullscreen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            )}
          </svg>
        </button>

        {!isFullscreen && (
          <button
            onClick={() => onEnlarge(id)}
            className="p-3 bg-white/10 backdrop-blur-md hover:bg-earth-accent text-white rounded-xl transition-all shadow-xl border border-white/10"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isEnlarged ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M19 9l-7 7-7-7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 15l7-7 7 7"
                />
              )}
            </svg>
          </button>
        )}
      </div>

      <style>{`
        @keyframes sticker-float {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        .animate-sticker-float {
          animation: sticker-float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};