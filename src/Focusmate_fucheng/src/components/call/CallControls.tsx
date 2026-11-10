"use client";

interface CallControlsProps {
  mic: boolean;
  cam: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
}

export function CallControls({ mic, cam, onToggleMic, onToggleCam }: CallControlsProps) {
  return (
    <div className="flex gap-3 justify-center">
      <button 
        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
          mic 
            ? "bg-green-600 hover:bg-green-700 text-white" 
            : "bg-gray-600 hover:bg-gray-700 text-white"
        }`} 
        onClick={onToggleMic}
        aria-label={mic ? "关闭麦克风" : "开启麦克风"}
      >
        {mic ? "🎤 麦克风开" : "🎤 麦克风关"}
      </button>
      <button 
        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
          cam 
            ? "bg-green-600 hover:bg-green-700 text-white" 
            : "bg-gray-600 hover:bg-gray-700 text-white"
        }`} 
        onClick={onToggleCam}
        aria-label={cam ? "关闭摄像头" : "开启摄像头"}
      >
        {cam ? "📹 摄像头开" : "📹 摄像头关"}
      </button>
    </div>
  );
}


