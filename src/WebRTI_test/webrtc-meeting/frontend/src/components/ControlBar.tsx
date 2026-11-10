import React from 'react';

interface ControlBarProps {
  isAudioMuted: boolean;
  isVideoOff: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onLeaveMeeting: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({ isAudioMuted, isVideoOff, onToggleAudio, onToggleVideo, onLeaveMeeting }) => {
  return (
    <div className="control-bar">
      <button
        className={`control-button ${isAudioMuted ? 'active' : ''}`}
        onClick={onToggleAudio}
        title={isAudioMuted ? '取消静音' : '静音'}
      >
        <span className="control-icon">
          {isAudioMuted ? '🔇' : '🎙️'}
        </span>
        <span className="control-label">
          {isAudioMuted ? '已静音' : '麦克风'}
        </span>
      </button>

      <button
        className={`control-button ${isVideoOff ? 'active' : ''}`}
        onClick={onToggleVideo}
        title={isVideoOff ? '开启摄像头' : '关闭摄像头'}
      >
        <span className="control-icon">
          {isVideoOff ? '📷' : '🎥'}
        </span>
        <span className="control-label">
          {isVideoOff ? '摄像头关闭' : '摄像头'}
        </span>
      </button>

      <button
        className="control-button leave-button"
        onClick={onLeaveMeeting}
        title="离开会议"
      >
        <span className="control-icon">
          📵
        </span>
        <span className="control-label">
          离开会议
        </span>
      </button>
    </div>
  );
};

export default ControlBar;