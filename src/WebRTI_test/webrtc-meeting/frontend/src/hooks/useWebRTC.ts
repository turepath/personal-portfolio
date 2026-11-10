import { useState, useEffect, useRef } from "react";
import socket from "../utils/socket";

interface User {
  sid: string;
  username: string;
}

interface OfferData {
  offer: RTCSessionDescriptionInit;
  senderSid: string;
}

interface AnswerData {
  answer: RTCSessionDescriptionInit;
  senderSid: string;
}

interface CandidateData {
  candidate: RTCIceCandidateInit;
  senderSid: string;
}

interface ExistingUsersData {
  users: User[];
}

interface UserJoinedData {
  senderSid: string;
  username: string;
}

const useWebRTC = (username: string, roomId: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<
    Record<string, MediaStream>
  >({});
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const localStreamRef = useRef<MediaStream | null>(null);

  // 获取本地媒体流
  const getLocalStream = async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error("Error getting local stream:", error);
      alert("无法访问摄像头或麦克风，请检查权限设置");
      return null;
    }
  };

  // 创建新的peer connection
  const createPeerConnection = (targetSid: string): RTCPeerConnection => {
    // 配置STUN服务器
    const configuration: RTCConfiguration = {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    // 添加本地流到peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // 处理远程流
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStreams((prev) => ({
          ...prev,
          [targetSid]: event.streams[0],
        }));
      }
    };

    // 处理ICE候选
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("candidate", {
          targetSid,
          candidate: event.candidate,
          roomId,
        });
      }
    };

    // 处理连接状态变化
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
    };

    peerConnectionsRef.current[targetSid] = pc;
    return pc;
  };

  // 发送offer
  const sendOffer = async (targetSid: string) => {
    const pc = createPeerConnection(targetSid);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", {
        targetSid,
        offer,
        roomId,
      });
    } catch (error) {
      console.error("Error sending offer:", error);
    }
  };

  // 处理offer
  const handleOffer = async (data: OfferData) => {
    const { offer, senderSid } = data;
    const pc = createPeerConnection(senderSid);
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", {
        targetSid: senderSid,
        answer,
        roomId,
      });
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  // 处理answer
  const handleAnswer = async (data: AnswerData) => {
    const { answer, senderSid } = data;
    const pc = peerConnectionsRef.current[senderSid];
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    }
  };

  // 处理ICE候选
  const handleCandidate = async (data: CandidateData) => {
    const { candidate, senderSid } = data;
    const pc = peerConnectionsRef.current[senderSid];
    if (pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error handling candidate:", error);
      }
    }
  };

  // 切换音频静音状态
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !isAudioMuted;
      });
      setIsAudioMuted(!isAudioMuted);
      socket.emit("toggle-audio", {
        roomId,
        isMuted: !isAudioMuted,
      });
    }
  };

  // 切换视频状态
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
      socket.emit("toggle-video", {
        roomId,
        isVideoOff: !isVideoOff,
      });
    }
  };

  // 离开会议
  const leaveMeeting = () => {
    // 关闭所有peer connections
    Object.values(peerConnectionsRef.current).forEach((pc) => {
      pc.close();
    });
    peerConnectionsRef.current = {};

    // 停止本地流
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      setLocalStream(null);
      localStreamRef.current = null;
    }

    // 清空远程流
    setRemoteStreams({});

    // 重置状态
    setIsAudioMuted(false);
    setIsVideoOff(false);

    // 通知服务器离开房间
    socket.emit("leave", {
      roomId,
    });
  };

  // 初始化
  useEffect(() => {
    if (username && roomId) {
      // 获取本地流
      getLocalStream();

      // 监听socket事件
      socket.on("existing-users", (data: ExistingUsersData) => {
        // 向现有用户发送offer
        data.users.forEach((user) => {
          sendOffer(user.sid);
        });

        // 更新用户映射
        const newUserMap: Record<string, string> = {};
        data.users.forEach((user) => {
          newUserMap[user.sid] = user.username;
        });
        setUserMap(newUserMap);
      });

      socket.on("user-joined", (data: UserJoinedData) => {
        // 新用户加入，发送offer
        sendOffer(data.senderSid);

        // 更新用户映射
        setUserMap((prev) => ({
          ...prev,
          [data.senderSid]: data.username,
        }));
      });

      socket.on("offer", handleOffer);
      socket.on("answer", handleAnswer);
      socket.on("candidate", handleCandidate);

      socket.on("user-left", (data: { username: string }) => {
        // 用户离开，移除对应的远程流
        setRemoteStreams((prev) => {
          const newStreams = { ...prev };
          // 找到对应的sid并删除
          Object.entries(newStreams).forEach(([sid]) => {
            delete newStreams[sid];
          });
          return newStreams;
        });

        // 从用户映射中移除
        setUserMap((prev) => {
          const newUserMap = { ...prev };
          Object.entries(newUserMap).forEach(([sid, name]) => {
            if (name === data.username) {
              delete newUserMap[sid];
            }
          });
          return newUserMap;
        });

        // 关闭对应的peer connection
        Object.entries(peerConnectionsRef.current).forEach(([sid, pc]) => {
          pc.close();
          delete peerConnectionsRef.current[sid];
        });
      });

      // 加入房间
      socket.emit("join", {
        username,
        roomId,
      });

      // 清理函数
      return () => {
        socket.off("existing-users");
        socket.off("user-joined");
        socket.off("offer");
        socket.off("answer");
        socket.off("candidate");
        socket.off("user-left");
      };
    }
  }, [username, roomId]);

  return {
    localStream,
    remoteStreams,
    userMap,
    isAudioMuted,
    isVideoOff,
    toggleAudio,
    toggleVideo,
    leaveMeeting,
  };
};

export default useWebRTC;
