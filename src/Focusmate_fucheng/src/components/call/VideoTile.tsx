"use client";
import { useEffect, useMemo, useRef } from "react";

interface VideoTileProps {
  stream: MediaStream | null;
  placeholder: React.ReactNode;
  isLocal?: boolean;
}

export function VideoTile({ stream, placeholder, isLocal = false }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const hasVideoTrack = useMemo(() => {
    if (!stream) return false;
    const videoTracks = stream.getVideoTracks();
    return videoTracks.length > 0 && videoTracks.some(track => track.enabled);
  }, [stream]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    if (stream && hasVideoTrack) {
      console.log(`[VideoTile] Setting video stream with ${stream.getTracks().length} tracks (isLocal: ${isLocal})`);
      videoElement.srcObject = stream;
      videoElement.play().catch((error) => {
        console.error(`[VideoTile] Error playing video:`, error);
      });
    } else {
      console.log(`[VideoTile] No stream or no video track available`);
      videoElement.srcObject = null;
    }
  }, [stream, hasVideoTrack, isLocal]);

  if (!stream || !hasVideoTrack) {
    return (
      <div className="flex items-center justify-center bg-neutral-200 dark:bg-neutral-800 aspect-video rounded">
        {placeholder}
      </div>
    );
  }
  
  return (
    <video 
      ref={videoRef} 
      muted={isLocal} 
      playsInline 
      autoPlay
      className="w-full h-full rounded aspect-video object-cover" 
    />
  );
}


