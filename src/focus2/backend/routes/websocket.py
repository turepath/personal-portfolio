from flask import Blueprint, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_jwt_extended import decode_token
from app import socketio, db
from models.user import User

# 存储房间内的用户信息
room_users = {}

websocket_bp = Blueprint('websocket', __name__)

# 存储用户会话信息
session_info = {}

# SocketIO event handlers
@socketio.on('connect')
def handle_connect():
    """处理WebSocket连接"""
    try:
        # 从查询参数中获取 token
        token = request.args.get('token')
        
        if not token:
            emit('error', {'message': 'Missing authentication token'})
            return
        
        # 验证 token
        decoded = decode_token(token)
        user_id = decoded['sub']
        
        # 存储用户信息到会话
        session_info[request.sid] = {'user_id': user_id}
        
        print(f"User {user_id} connected via WebSocket (SID: {request.sid})")
        emit('connected', {'message': 'Connected successfully'})
    except Exception as e:
        print(f"WebSocket connection failed: {e}")
        emit('error', {'message': 'Authentication failed'})

@socketio.on('disconnect')
def handle_disconnect():
    """处理WebSocket断开连接"""
    # 清理会话信息
    if request.sid in session_info:
        user_id = session_info[request.sid].get('user_id')
        print(f"User {user_id} disconnected (SID: {request.sid})")
        del session_info[request.sid]
    else:
        print("Client disconnected (SID: {request.sid})")

# 获取当前用户ID的辅助函数
def get_current_user_id():
    """从会话中获取当前用户ID"""
    session = session_info.get(request.sid)
    if not session:
        raise Exception('Session not found')
    return session.get('user_id')

@socketio.on('join_room')
def handle_join_room(data):
    """处理加入房间事件"""
    try:
        room_id = data.get('room_id')
        if not room_id:
            emit('error', {'message': 'Missing room_id'})
            return
        
        # 从会话中获取用户ID
        user_id = get_current_user_id()
        
        join_room(room_id)
        print(f"User {user_id} joined room {room_id}")
        
        # 获取用户信息
        user = User.query.filter_by(id=user_id).first()
        user_info = {
            'user_id': user_id,
            'username': user.username if user else f'User_{user_id}',
            'avatar': user.avatar if user else f'https://picsum.photos/seed/{user_id}/400/400'
        }
        
        # 初始化房间用户列表
        if room_id not in room_users:
            room_users[room_id] = []
        
        # 向新用户广播房间内现有用户的信息
        existing_users = room_users[room_id]
        emit('existing_users', {'users': existing_users}, to=request.sid)
        
        # 将新用户添加到房间用户列表
        room_users[room_id].append(user_info)
        
        emit('joined_room', {'room_id': room_id, 'user_info': user_info}, room=room_id)
        # 广播用户加入活动
        emit('user_activity', {
            'user_id': user_id,
            'username': user.username if user else f'User_{user_id}',
            'avatar': user.avatar if user else f'https://picsum.photos/seed/{user_id}/400/400',
            'activity': 'joined',
            'timestamp': data.get('timestamp', None)
        }, room=room_id)
    except Exception as e:
        print(f"Error joining room: {e}")
        emit('error', {'message': 'Failed to join room'})

@socketio.on('leave_room')
def handle_leave_room(data):
    """处理离开房间事件"""
    try:
        room_id = data.get('room_id')
        if not room_id:
            emit('error', {'message': 'Missing room_id'})
            return
        
        # 从会话中获取用户ID
        user_id = get_current_user_id()
        
        leave_room(room_id)
        print(f"User {user_id} left room {room_id}")
        
        # 从房间用户列表中移除用户
        if room_id in room_users:
            room_users[room_id] = [user for user in room_users[room_id] if user['user_id'] != user_id]
        
        emit('left_room', {'user_id': user_id, 'room_id': room_id}, room=room_id)
    except Exception as e:
        print(f"Error leaving room: {e}")
        emit('error', {'message': 'Failed to leave room'})

@socketio.on('send_message')
def handle_send_message(data):
    """处理发送消息事件"""
    try:
        room_id = data.get('room_id')
        message = data.get('message')
        if not room_id or not message:
            emit('error', {'message': 'Missing room_id or message'})
            return
        
        # 从会话中获取用户ID
        user_id = get_current_user_id()
        
        ## 获取用户信息
        user = User.query.filter_by(id=user_id).first()
        username = user.username if user else f'User_{user_id}'
        
        # 广播消息到房间
        emit('new_message', {
            'user_id': user_id,
            'username': username,
            'message': message,
            'timestamp': data.get('timestamp')
        }, room=room_id)
    except Exception as e:
        print(f"Error sending message: {e}")
        emit('error', {'message': 'Failed to send message'})

@socketio.on('user_activity')
def handle_user_activity(data):
    """处理用户活动事件"""
    try:
        room_id = data.get('room_id')
        activity = data.get('activity')
        if not room_id or not activity:
            emit('error', {'message': 'Missing room_id or activity'})
            return
        
        # 从会话中获取用户ID
        user_id = get_current_user_id()
        
        # 广播活动到房间
        emit('user_activity', {
            'user_id': user_id,
            'activity': activity,
            'timestamp': data.get('timestamp')
        }, room=room_id)
    except Exception as e:
        print(f"Error handling user activity: {e}")
        emit('error', {'message': 'Failed to broadcast activity'})

@socketio.on('video_feed')
def handle_video_feed(data):
    """处理视频流事件"""
    try:
        room_id = data.get('room_id')
        sdp = data.get('sdp')
        type = data.get('type')
        if not room_id or not sdp or not type:
            emit('error', {'message': 'Missing room_id, sdp, or type'})
            return
        
        # 从会话中获取用户ID
        user_id = get_current_user_id()
        
        # 广播视频流信息到房间
        emit('video_feed', {
            'user_id': user_id,
            'sdp': sdp,
            'type': type
        }, room=room_id, include_self=False)
    except Exception as e:
        print(f"Error handling video feed: {e}")
        emit('error', {'message': 'Failed to process video feed'})

@socketio.on('ice_candidate')
def handle_ice_candidate(data):
    """处理ICE候选事件"""
    try:
        room_id = data.get('room_id')
        candidate = data.get('candidate')
        if not room_id or not candidate:
            emit('error', {'message': 'Missing room_id or candidate'})
            return
        
        # 从会话中获取用户ID
        user_id = get_current_user_id()
        
        # 广播ICE候选到房间
        emit('ice_candidate', {
            'user_id': user_id,
            'candidate': candidate
        }, room=room_id, include_self=False)
    except Exception as e:
        print(f"Error handling ICE candidate: {e}")
        emit('error', {'message': 'Failed to process ICE candidate'})
