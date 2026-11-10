import React, { useState, useEffect } from 'react';
import socket from '../utils/socket';

interface UserListProps {
  username: string;
}

interface User {
  username: string;
}

const UserList: React.FC<UserListProps> = ({ username }) => {
  const [users, setUsers] = useState<User[]>([]);

  // 监听用户列表更新
  useEffect(() => {
    const handleUserList = (data: { users: User[] }) => {
      setUsers(data.users);
    };

    socket.on('user-list', handleUserList);

    return () => {
      socket.off('user-list', handleUserList);
    };
  }, []);

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>在线用户 ({users.length})</h3>
      </div>
      <div className="user-list-content">
        {users.map((user, index) => (
          <div key={index} className={`user-item ${user.username === username ? 'current-user' : ''}`}>
            <span className="user-status">●</span>
            <span className="user-name">
              {user.username}
              {user.username === username && ' (我)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;