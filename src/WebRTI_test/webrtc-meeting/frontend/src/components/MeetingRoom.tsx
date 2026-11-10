import React from "react";
import VideoGrid from "./VideoGrid";
import ControlBar from "./ControlBar";
import ChatPanel from "./ChatPanel";
import UserList from "./UserList";
import useWebRTC from "../hooks/useWebRTC";

interface MeetingRoomProps {
  username: string;
  roomId: string;
  onLeave: () => void;
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({
  username,
  roomId,
  onLeave,
}) => {
  const {
    localStream,
    remoteStreams,
    userMap,
    isAudioMuted,
    isVideoOff,
    toggleAudio,
    toggleVideo,
    leaveMeeting,
  } = useWebRTC(username, roomId);

  // 处理离开会议
  const handleLeaveMeeting = () => {
    leaveMeeting();
    onLeave();
  };

  return (
    <div className="meeting-room">
      <div className="meeting-header">
        <h2>会议房间: {roomId}</h2>
        <div className="meeting-info">
          <span>当前用户: {username}</span>
        </div>
      </div>

      <div className="meeting-content">
        <div className="main-content">
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            userMap={userMap}
          />
          <ControlBar
            isAudioMuted={isAudioMuted}
            isVideoOff={isVideoOff}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onLeaveMeeting={handleLeaveMeeting}
          />
        </div>

        <div className="sidebar">
          <UserList username={username} />
          <ChatPanel roomId={roomId} username={username} />
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;
