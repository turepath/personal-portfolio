import React, { useState } from 'react';

interface JoinFormProps {
  onJoin: (data: { username: string; roomId: string }) => void;
}

const JoinForm: React.FC<JoinFormProps> = ({ onJoin }) => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证输入
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }
    
    if (!roomId.trim()) {
      setError('请输入房间号');
      return;
    }
    
    // 清除错误
    setError('');
    
    // 调用加入回调
    onJoin({ username, roomId });
  };

  return (
    <div className="join-form-container">
      <div className="join-form">
        <h2>加入会议</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入您的姓名"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="roomId">房间号</label>
            <input
              type="text"
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="请输入房间号"
              required
            />
          </div>
          
          <button type="submit" className="join-button">
            加入会议
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinForm;