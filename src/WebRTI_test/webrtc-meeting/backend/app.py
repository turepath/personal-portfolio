from flask import Flask, request
from flask_socketio import SocketIO, join_room, leave_room, emit
import eventlet

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

# 存储房间信息：{room_id: {sid: username, ...}}
rooms = {}

@socketio.on('connect')
def handle_connect():
    print('Client connected:', request.sid)

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected:', request.sid)
    # 从所有房间中移除用户
    for room_id, room_users in rooms.items():
        if request.sid in room_users:
            username = room_users[request.sid]
            del room_users[request.sid]
            # 广播用户离开事件
            emit('user-left', {'username': username}, room=room_id, skip_sid=request.sid)
            # 如果房间为空，删除房间
            if not room_users:
                del rooms[room_id]
            break

@socketio.on('join')
def handle_join(data):
    username = data['username']
    room_id = data['roomId']
    
    # 加入房间
    join_room(room_id)
    
    # 初始化房间
    if room_id not in rooms:
        rooms[room_id] = {}
    
    # 存储用户信息
    rooms[room_id][request.sid] = username
    
    # 广播用户加入事件
    emit('user-joined', {'username': username, 'senderSid': request.sid}, room=room_id, skip_sid=request.sid)
    
    # 发送房间内现有用户列表给新用户
    existing_users = [{'username': name, 'sid': sid} for sid, name in rooms[room_id].items() if sid != request.sid]
    emit('existing-users', {'users': existing_users})
    
    # 发送房间内所有用户列表给房间内所有人
    all_users = [{'username': name} for name in rooms[room_id].values()]
    emit('user-list', {'users': all_users}, room=room_id)
    
    print(f'{username} joined room {room_id}')

@socketio.on('leave')
def handle_leave(data):
    room_id = data['roomId']
    if room_id in rooms and request.sid in rooms[room_id]:
        username = rooms[room_id][request.sid]
        leave_room(room_id)
        del rooms[room_id][request.sid]
        # 广播用户离开事件
        emit('user-left', {'username': username}, room=room_id, skip_sid=request.sid)
        # 更新用户列表
        all_users = [{'username': name} for name in rooms[room_id].values()]
        emit('user-list', {'users': all_users}, room=room_id)
        # 如果房间为空，删除房间
        if not rooms[room_id]:
            del rooms[room_id]
        print(f'{username} left room {room_id}')

@socketio.on('offer')
def handle_offer(data):
    target_sid = data['targetSid']
    offer = data['offer']
    room_id = data['roomId']
    
    # 转发offer给目标用户
    emit('offer', {'offer': offer, 'senderSid': request.sid}, room=target_sid)
    print(f'Forwarded offer from {request.sid} to {target_sid}')

@socketio.on('answer')
def handle_answer(data):
    target_sid = data['targetSid']
    answer = data['answer']
    room_id = data['roomId']
    
    # 转发answer给目标用户
    emit('answer', {'answer': answer, 'senderSid': request.sid}, room=target_sid)
    print(f'Forwarded answer from {request.sid} to {target_sid}')

@socketio.on('candidate')
def handle_candidate(data):
    target_sid = data['targetSid']
    candidate = data['candidate']
    room_id = data['roomId']
    
    # 转发ICE候选给目标用户
    emit('candidate', {'candidate': candidate, 'senderSid': request.sid}, room=target_sid)
    print(f'Forwarded candidate from {request.sid} to {target_sid}')

@socketio.on('chat')
def handle_chat(data):
    room_id = data['roomId']
    message = data['message']
    username = rooms[room_id][request.sid]
    
    # 广播聊天消息给房间内所有人
    emit('chat-message', {
        'username': username,
        'message': message,
        'timestamp': data.get('timestamp')
    }, room=room_id)
    print(f'Chat message from {username} in room {room_id}: {message}')

@socketio.on('toggle-audio')
def handle_toggle_audio(data):
    room_id = data['roomId']
    is_muted = data['isMuted']
    username = rooms[room_id][request.sid]
    
    # 广播音频状态变更
    emit('audio-toggled', {
        'username': username,
        'isMuted': is_muted
    }, room=room_id, skip_sid=request.sid)

@socketio.on('toggle-video')
def handle_toggle_video(data):
    room_id = data['roomId']
    is_video_off = data['isVideoOff']
    username = rooms[room_id][request.sid]
    
    # 广播视频状态变更
    emit('video-toggled', {
        'username': username,
        'isVideoOff': is_video_off
    }, room=room_id, skip_sid=request.sid)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)