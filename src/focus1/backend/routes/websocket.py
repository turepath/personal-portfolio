from flask import Blueprint, request
from flask_socketio import emit, join_room, leave_room
from app import socketio, db
from models.user import User
from models.room import Room, UserRoom
from models.message import Message
from models.friendship import Friendship
from datetime import datetime
import jwt

websocket_bp = Blueprint('websocket', __name__)


def get_user_id_from_request():
    """从请求中获取用户ID，支持多种认证方式"""
    try:
        # 尝试从query参数获取token
        token = request.args.get('token')
        if token:
            try:
                # 解码JWT token获取用户ID
                decoded = jwt.decode(token, options={"verify_signature": False})
                user_id = decoded.get('sub') or decoded.get('user_id')
                if user_id:
                    return str(user_id)
            except:
                pass
        
        # 尝试从headers获取token
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header[7:]
            try:
                decoded = jwt.decode(token, options={"verify_signature": False})
                user_id = decoded.get('sub') or decoded.get('user_id')
                if user_id:
                    return str(user_id)
            except:
                pass
        
        return None
    except Exception as e:
        print(f"Error getting user ID: {e}")
        return None


@socketio.on('connect')
def handle_connect():
    try:
        user_id = get_user_id_from_request()
        if user_id:
            print(f"User connected: {user_id}")
            emit('connected', {'message': 'Connected successfully', 'user_id': user_id})
        else:
            print("Connection without authentication")
            emit('error', {'message': 'Authentication required'})
    except Exception as e:
        print(f"Connection error: {e}")
        emit('error', {'message': 'Connection error'})


@socketio.on('join_room')
def handle_join_room(data):
    if 'room_id' not in data:
        emit('error', {'message': 'Missing room_id'})
        return

    room_id = data['room_id']
    user_id = get_user_id_from_request()
    
    # 验证用户身份
    if not user_id:
        emit('error', {'message': 'Authentication required'})
        return
    
    # 获取用户信息
    user = User.query.get(user_id)
    if not user:
        emit('error', {'message': 'User not found'})
        return
    
    # 获取房间信息
    room = Room.query.get(room_id)
    if not room:
        # 返回更具体的错误信息，包括room_id
        emit('error', {'message': 'Room not found', 'room_id': room_id})
        return
    
    # 检查房间人数限制
    current_participants = UserRoom.query.filter_by(room_id=room_id).count()
    if current_participants >= room.max_participants:
        emit('error', {'message': 'Room is full'})
        return
    
    # 检查用户是否已经在房间中
    existing_user_room = UserRoom.query.filter_by(room_id=room_id, user_id=user_id).first()
    if not existing_user_room:
        # 添加用户到房间
        new_user_room = UserRoom(
            user_id=user_id,
            room_id=room_id,
            joined_at=datetime.utcnow()
        )
        db.session.add(new_user_room)
        db.session.commit()
        existing_user_room = new_user_room
    
    # 加入Socket.IO房间
    join_room(room_id)
    
    # 创建参与者数据
    participant_data = {
        'userId': user_id,
        'name': user.username or f'User_{user_id}',
        'avatar': f'https://picsum.photos/seed/user-{user_id}/400/225',
        'isHost': user_id == room.owner_id,
        'isMuted': existing_user_room.is_muted if existing_user_room else False,
        'isCameraOn': existing_user_room.is_camera_on if existing_user_room else True,
        'joinedAt': existing_user_room.joined_at.isoformat() if existing_user_room else datetime.utcnow().isoformat()
    }
    
    # 获取所有参与者
    user_rooms = UserRoom.query.filter_by(room_id=room_id).all()
    participants = []
    for user_room in user_rooms:
        room_user = User.query.get(user_room.user_id)
        if room_user:
            participants.append({
                'userId': user_room.user_id,
                'name': room_user.username or f'User_{user_room.user_id}',
                'avatar': f'https://picsum.photos/seed/user-{user_room.user_id}/400/225',
                'isHost': user_room.user_id == room.owner_id,
                'isMuted': user_room.is_muted or False,
                'isCameraOn': user_room.is_camera_on or True,
                'joinedAt': user_room.joined_at.isoformat() if user_room.joined_at else datetime.utcnow().isoformat()
            })
    
    # 更新房间状态
    if room.status == 'waiting':
        room.status = 'active'
        db.session.commit()
    
    # 通知其他用户有新用户加入
    emit('user_joined', participant_data, room=room_id, include_self=False)
    
    # 发送房间状态给新用户
    room_state = {
        'id': room_id,
        'name': room.name,
        'ownerId': room.owner_id,
        'status': room.status,
        'type': room.type,
        'maxParticipants': room.max_participants,
        'participants': participants,
        'settings': {
            'videoEnabled': True,
            'audioEnabled': True,
            'chatEnabled': True
        },
        'createdAt': room.created_at.isoformat() if room.created_at else ''
    }
    
    emit('room_initialized', room_state)


@socketio.on('leave_room')
def handle_leave_room(data):
    if 'room_id' not in data:
        emit('error', {'message': 'Missing room_id'})
        return

    room_id = data['room_id']
    user_id = get_user_id_from_request()
    
    # 验证用户身份
    if not user_id:
        emit('error', {'message': 'Authentication required'})
        return
    
    # 获取房间信息
    room = Room.query.get(room_id)
    if not room:
        emit('error', {'message': 'Room not found'})
        return
    
    # 从数据库中移除用户
    user_room = UserRoom.query.filter_by(room_id=room_id, user_id=user_id).first()
    if user_room:
        db.session.delete(user_room)
        # 更新房间参与者数量
        room.participants = UserRoom.query.filter_by(room_id=room_id).count()
        db.session.commit()
    
    # 离开Socket.IO房间
    leave_room(room_id)
    
    # 获取剩余参与者
    remaining_user_rooms = UserRoom.query.filter_by(room_id=room_id).all()
    remaining_participants = len(remaining_user_rooms)
    
    if remaining_participants == 0:
        # 房间为空，设置为结束状态
        room.status = 'ended'
        db.session.commit()
        emit('room_ended', {
            'room_id': room_id,
            'message': 'Room has ended'
        }, room=room_id)
    else:
        # 检查是否需要转移所有权
        if user_id == room.owner_id:
            new_owner_id = remaining_user_rooms[0].user_id
            room.owner_id = new_owner_id
            db.session.commit()
            
            # 通知所有用户主持人已变更
            emit('host_changed', {
                'room_id': room_id,
                'new_host_id': new_owner_id
            }, room=room_id)
        
        # 获取更新后的参与者列表
        updated_participants = []
        for user_room in remaining_user_rooms:
            room_user = User.query.get(user_room.user_id)
            if room_user:
                updated_participants.append({
                    'userId': user_room.user_id,
                    'name': room_user.username or f'User_{user_room.user_id}',
                    'avatar': f'https://picsum.photos/seed/user-{user_room.user_id}/400/225',
                    'isHost': user_room.user_id == room.owner_id,
                    'isMuted': user_room.is_muted or False,
                    'isCameraOn': user_room.is_camera_on or True,
                    'joinedAt': user_room.joined_at.isoformat() if user_room.joined_at else datetime.utcnow().isoformat()
                })
        
        # 通知其他用户有用户离开
        emit('user_left', {
            'user_id': user_id,
            'room_id': room_id
        }, room=room_id)
        
        # 更新房间状态
        emit('room_initialized', {
            'id': room_id,
            'name': room.name,
            'ownerId': room.owner_id,
            'status': room.status,
            'type': room.type,
            'maxParticipants': room.max_participants,
            'participants': updated_participants,
            'settings': {
                'videoEnabled': True,
                'audioEnabled': True,
                'chatEnabled': True
            },
            'createdAt': room.created_at.isoformat() if room.created_at else ''
        }, room=room_id)


@socketio.on('send_message')
def handle_send_message(data):
    if 'room_id' not in data or 'message' not in data:
        emit('error', {'message': 'Missing room_id or message'})
        return

    # 验证消息内容不为空
    message_content = data['message'].strip()
    if not message_content:
        emit('error', {'message': 'Message content cannot be empty'})
        return

    room_id = data['room_id']
    user_id = get_user_id_from_request()
    
    # 获取用户信息
    user = User.query.get(user_id)
    if not user:
        emit('error', {'message': 'User not found'})
        return
    
    username = user.username or f'User_{user_id}'
    
    message_data = {
        'user_id': user_id,
        'username': username,
        'message': message_content,
        'timestamp': data.get('timestamp', '')
    }

    emit('new_message', message_data, room=room_id)


@socketio.on('join_private_chat')
def handle_join_private_chat(data):
    """加入私聊房间"""
    user_id = get_user_id_from_request()
    recipient_id = data['recipient_id']
    
    # 创建唯一的聊天房间ID（确保顺序一致）
    if int(user_id) < int(recipient_id):
        room_id = f'private_{user_id}_{recipient_id}'
    else:
        room_id = f'private_{recipient_id}_{user_id}'
    
    join_room(room_id)
    emit('joined_private_chat', {'room_id': room_id, 'recipient_id': recipient_id})


@socketio.on('leave_private_chat')
def handle_leave_private_chat(data):
    """离开私聊房间"""
    user_id = get_user_id_from_request()
    recipient_id = data['recipient_id']
    
    # 创建唯一的聊天房间ID（确保顺序一致）
    if int(user_id) < int(recipient_id):
        room_id = f'private_{user_id}_{recipient_id}'
    else:
        room_id = f'private_{recipient_id}_{user_id}'
    
    leave_room(room_id)
    emit('left_private_chat', {'room_id': room_id, 'recipient_id': recipient_id})


@socketio.on('private_message')
def handle_private_message(data):
    """处理私聊消息"""
    user_id = get_user_id_from_request()
    recipient_id = data['recipient_id']
    content = data['content']
    message_type = data.get('type', 'text')
    file_url = data.get('file_url')
    file_name = data.get('file_name')
    room_id = data.get('room_id')
    
    # 保存消息到数据库
    message = Message(
        sender_id=user_id,
        recipient_id=recipient_id,
        content=content,
        type=message_type,
        file_url=file_url,
        file_name=file_name,
        room_id=room_id
    )
    db.session.add(message)
    db.session.commit()
    
    # 发送消息到聊天房间
    if int(user_id) < int(recipient_id):
        chat_room_id = f'private_{user_id}_{recipient_id}'
    else:
        chat_room_id = f'private_{recipient_id}_{user_id}'
    
    emit('new_private_message', {
        'message_id': str(message.id),
        'sender_id': str(user_id),
        'recipient_id': str(recipient_id),
        'content': content,
        'type': message_type,
        'file_url': file_url,
        'file_name': file_name,
        'room_id': room_id,
        'created_at': message.created_at.isoformat()
    }, room=chat_room_id)


@socketio.on('friend_request')
def handle_friend_request(data):
    """处理好友请求"""
    user_id = get_user_id_from_request()
    recipient_id = data['recipient_id']
    content = data.get('content', "I'd like to be your study friend!")
    
    # 检查是否已经是好友或已经发送过请求
    existing_friendship = Friendship.query.filter(
        ((Friendship.user_id == user_id) & (Friendship.friend_id == recipient_id)) |
        ((Friendship.user_id == recipient_id) & (Friendship.friend_id == user_id))
    ).first()
    
    if existing_friendship:
        emit('error', {'message': 'Friendship already exists'})
        return
    
    # 创建好友请求
    friendship = Friendship(
        user_id=user_id,
        friend_id=recipient_id,
        status='pending_sent'
    )
    
    db.session.add(friendship)
    db.session.commit()
    
    # 发送好友请求通知
    emit('new_friend_request', {
        'request_id': str(friendship.id),
        'sender_id': str(user_id),
        'content': content,
        'created_at': friendship.created_at.isoformat()
    }, room=f'user_{recipient_id}')
    
    emit('friend_request_sent', {'recipient_id': recipient_id, 'request_id': str(friendship.id)})


@socketio.on('accept_friend_request')
def handle_accept_friend_request(data):
    """处理接受好友请求"""
    user_id = get_user_id_from_request()
    friend_id = data['friend_id']
    
    # 查找待接受的好友请求
    friendship = Friendship.query.filter(
        (Friendship.user_id == friend_id) &
        (Friendship.friend_id == user_id) &
        (Friendship.status == 'pending_sent')
    ).first()
    
    if not friendship:
        emit('error', {'message': 'Friend request not found'})
        return
    
    # 更新好友关系状态
    friendship.status = 'friend'
    db.session.commit()
    
    # 发送好友请求接受通知
    emit('friend_request_accepted', {
        'user_id': str(user_id),
        'friend_id': str(friend_id),
        'created_at': datetime.utcnow().isoformat()
    }, room=f'user_{friend_id}')
    
    emit('friend_request_accepted_ack', {'friend_id': str(friend_id)})


@socketio.on('disconnect')
def handle_disconnect():
    pass


# 新增：房间初始化事件
@socketio.on('initialize_room')
def handle_initialize_room(data):
    if 'room_id' not in data or 'settings' not in data:
        emit('error', {'message': 'Missing room_id or settings'})
        return
    
    room_id = data['room_id']
    user_id = get_user_id_from_request()
    settings = data['settings']
    
    # Get room information
    room = Room.query.get(room_id)
    if not room:
        emit('error', {'message': 'Room not found'})
        return
    
    # Check if user is the room owner
    if room.owner_id != user_id:
        emit('error', {'message': 'Only owner can initialize room'})
        return
    
    # Update room status to active
    room.status = 'live'
    db.session.commit()
    
    # Create initial room state
    initial_state = {
        'id': room_id,
        'name': room.name,
        'ownerId': user_id,
        'status': 'active',
        'participants': [{
            'userId': user_id,
            'name': f'User_{user_id}',
            'avatar': f'https://picsum.photos/seed/user-{user_id}/400/225',
            'isHost': True,
            'isMuted': False,
            'isCameraOn': True,
            'joinedAt': datetime.utcnow().isoformat()
        }],
        'settings': settings,
        'createdAt': room.created_at.isoformat() if room.created_at else ''
    }
    
    # Notify all users in the room
    emit('room_initialized', initial_state, room=room_id)


# 新增：同步房间状态事件
@socketio.on('sync_room_state')
def handle_sync_room_state(data):
    if 'room_id' not in data:
        emit('error', {'message': 'Missing room_id'})
        return
    
    room_id = data['room_id']
    user_id = get_user_id_from_request()
    
    # Get room information
    room = Room.query.get(room_id)
    if not room:
        emit('error', {'message': 'Room not found'})
        return
    
    # Get actual participants from database
    user_rooms = UserRoom.query.filter_by(room_id=room_id).all()
    participants = []
    for user_room in user_rooms:
        user = User.query.get(user_room.user_id)
        if user:
            participants.append({
                'userId': user_room.user_id,
                'name': user.username or f'User_{user_room.user_id}',
                'avatar': f'https://picsum.photos/seed/user-{user_room.user_id}/400/225',
                'isHost': user_room.user_id == room.owner_id,
                'isMuted': user_room.is_muted or False,
                'isCameraOn': user_room.is_camera_on or True,
                'joinedAt': user_room.joined_at.isoformat() if user_room.joined_at else datetime.utcnow().isoformat()
            })
    
    # Create room state
    room_state = {
        'id': room_id,
        'name': room.name,
        'ownerId': room.owner_id,
        'status': room.status,
        'participants': participants,
        'settings': {
            'videoEnabled': True,
            'audioEnabled': True,
            'chatEnabled': True,
            'screenShareEnabled': True
        },
        'createdAt': room.created_at.isoformat() if room.created_at else ''
    }
    
    # Send room state to the requesting user
    emit('room_initialized', room_state)


# 新增：视频流相关事件
@socketio.on('video_stream_available')
def handle_video_stream_available(data):
    if 'room_id' not in data or 'stream_id' not in data:
        emit('error', {'message': 'Missing room_id or stream_id'})
        return
    
    room_id = data['room_id']
    user_id = get_user_id_from_request()
    stream_id = data['stream_id']
    
    # Notify all users in the room that a video stream is available
    emit('video_stream_available', {
        'user_id': user_id,
        'stream_id': stream_id,
        'room_id': room_id
    }, room=room_id, include_self=False)


@socketio.on('toggle_mute')
def handle_toggle_mute(data):
    if 'room_id' not in data or 'muted' not in data:
        emit('error', {'message': 'Missing room_id or muted'})
        return
    
    room_id = data['room_id']
    user_id = get_user_id_from_request()
    muted = data['muted']
    
    # Notify all users in the room
    emit('audio_muted', {
        'user_id': user_id,
        'muted': muted,
        'room_id': room_id
    }, room=room_id)


@socketio.on('toggle_camera')
def handle_toggle_camera(data):
    if 'room_id' not in data or 'camera_on' not in data:
        emit('error', {'message': 'Missing room_id or camera_on'})
        return
    
    room_id = data['room_id']
    user_id = get_user_id_from_request()
    camera_on = data['camera_on']
    
    # Notify all users in the room
    emit('camera_toggled', {
        'user_id': user_id,
        'camera_on': camera_on,
        'room_id': room_id
    }, room=room_id)


@socketio.on('start_screen_share')
def handle_start_screen_share(data):
    if 'room_id' not in data or 'stream_id' not in data:
        emit('error', {'message': 'Missing room_id or stream_id'})
        return
    
    room_id = data['room_id']
    user_id = get_user_id_from_request()
    stream_id = data['stream_id']
    
    # Notify all users in the room
    emit('screen_share_started', {
        'user_id': user_id,
        'stream_id': stream_id,
        'room_id': room_id
    }, room=room_id)


@socketio.on('stop_screen_share')
def handle_stop_screen_share(data):
    if 'room_id' not in data:
        emit('error', {'message': 'Missing room_id'})
        return
    
    room_id = data['room_id']
    user_id = get_user_id_from_request()
    
    # Notify all users in the room
    emit('screen_share_stopped', {
        'user_id': user_id,
        'room_id': room_id
    }, room=room_id)


# WebRTC信令事件
@socketio.on('offer')
def handle_offer(data):
    if 'room_id' not in data or 'peerId' not in data or 'offer' not in data:
        emit('error', {'message': 'Missing required parameters'})
        return
    
    room_id = data['room_id']
    peer_id = data['peerId']
    offer = data['offer']
    user_id = get_user_id_from_request()
    
    if not user_id:
        emit('error', {'message': 'Authentication required'})
        return
    
    # 转发Offer到目标用户
    emit('offer', {
        'offer': offer,
        'peerId': user_id,
        'room_id': room_id
    }, room=peer_id)


@socketio.on('answer')
def handle_answer(data):
    if 'room_id' not in data or 'peerId' not in data or 'answer' not in data:
        emit('error', {'message': 'Missing required parameters'})
        return
    
    room_id = data['room_id']
    peer_id = data['peerId']
    answer = data['answer']
    user_id = get_user_id_from_request()
    
    if not user_id:
        emit('error', {'message': 'Authentication required'})
        return
    
    # 转发Answer到目标用户
    emit('answer', {
        'answer': answer,
        'peerId': user_id,
        'room_id': room_id
    }, room=peer_id)


@socketio.on('ice_candidate')
def handle_ice_candidate(data):
    if 'room_id' not in data or 'peerId' not in data or 'candidate' not in data:
        emit('error', {'message': 'Missing required parameters'})
        return
    
    room_id = data['room_id']
    peer_id = data['peerId']
    candidate = data['candidate']
    user_id = get_user_id_from_request()
    
    if not user_id:
        emit('error', {'message': 'Authentication required'})
        return
    
    # 转发ICE候选到目标用户
    emit('ice_candidate', {
        'candidate': candidate,
        'peerId': user_id,
        'room_id': room_id
    }, room=peer_id)
