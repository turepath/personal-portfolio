import { useCallback, useRef, useState } from "react";

export function useLocalMedia() {
  const [micEnabled, setMicEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const acquiringRef = useRef(false);

  const acquire = useCallback(async (): Promise<boolean> => {
    if (acquiringRef.current) return !!stream;
    acquiringRef.current = true;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setStream(s);
      setMicEnabled(true);
      setCameraEnabled(true);
      return true;
    } catch (e) {
      setStream(null);
      setMicEnabled(false);
      setCameraEnabled(false);
      return false;
    } finally {
      acquiringRef.current = false;
    }
  }, [stream]);

  const stop = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setMicEnabled(false);
    setCameraEnabled(false);
  }, [stream]);

  const toggleMic = useCallback(() => {
    if (!stream) return;
    setMicEnabled((prev) => {
      const next = !prev;
      stream.getAudioTracks().forEach((t) => (t.enabled = next));
      return next;
    });
  }, [stream]);

  const toggleCamera = useCallback(() => {
    if (!stream) return;
    setCameraEnabled((prev) => {
      const next = !prev;
      stream.getVideoTracks().forEach((t) => (t.enabled = next));
      return next;
    });
  }, [stream]);

  return { stream, micEnabled, cameraEnabled, toggleMic, toggleCamera, acquire, stop };
}


