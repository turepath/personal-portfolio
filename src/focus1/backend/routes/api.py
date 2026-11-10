from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.room import Room, UserRoom
from models.user import User
from models.settings import Settings
from models.post import Post
from models.friendship import Friendship
from models.message import Message
from app import db
from services.db_service import get_paginated_results
import os
import uuid
from werkzeug.utils import secure_filename

api_bp = Blueprint('api', __name__)

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for frontend to verify backend is running"""
    return jsonify({'status': 'healthy', 'service': 'FocusCompanion API'}), 200

@api_bp.route('/rooms', methods=['GET'])
@jwt_required()
def get_rooms():
    # Get paginated rooms
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    rooms_query = Room.query.order_by(Room.created_at.desc())
    rooms = get_paginated_results(rooms_query, page, per_page)

    return jsonify(rooms), 200


@api_bp.route('/rooms', methods=['POST'])
@jwt_required()
def create_room():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if not data or 'name' not in data:
        return jsonify({'error': 'Missing room name'}), 400

    # Check if user already owns a room
    existing_room = Room.query.filter_by(owner_id=current_user_id).first()
    if existing_room:
        return jsonify({'error': 'You can only create one room at a time'}), 400

    room = Room(
        name=data['name'],
        owner_id=current_user_id,
        type=data.get('type', '1:1'),
        virtual_allowed=data.get('virtual_allowed', True),
        max_participants=data.get('max_participants', 2) if data.get('type') == '1:many' else 2,
        is_paid=data.get('is_paid', False)
    )
    db.session.add(room)
    db.session.commit()

    # Add owner to the room
    user_room = UserRoom(user_id=current_user_id, room_id=room.id)
    db.session.add(user_room)
    room.participants = 1
    # For 1:1 rooms, set status to waiting for other user to join
    # For 1:many rooms, set status to live immediately
    room.status = 'waiting' if data.get('type') == '1:1' else 'live'
    db.session.commit()

    return jsonify(room.to_dict()), 201


@api_bp.route('/rooms/<room_id>', methods=['GET'])
@jwt_required()
def get_room(room_id):
    try:
        room_id_int = int(room_id)
        room = Room.query.get_or_404(room_id_int)
        return jsonify(room.to_dict()), 200
    except ValueError:
        return jsonify({'error': 'Invalid room ID'}), 400


@api_bp.route('/rooms/<room_id>', methods=['PUT'])
@jwt_required()
def update_room(room_id):
    try:
        room_id_int = int(room_id)
    except ValueError:
        return jsonify({'error': 'Invalid room ID'}), 400
    
    current_user_id = get_jwt_identity()
    room = Room.query.get_or_404(room_id_int)

    if room.owner_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    if 'name' in data:
        room.name = data['name']

    db.session.commit()
    return jsonify(room.to_dict()), 200


@api_bp.route('/rooms/<room_id>', methods=['DELETE'])
@jwt_required()
def delete_room(room_id):
    try:
        room_id_int = int(room_id)
    except ValueError:
        return jsonify({'error': 'Invalid room ID'}), 400
    
    current_user_id = get_jwt_identity()
    room = Room.query.get_or_404(room_id_int)

    if room.owner_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    # Remove all users from the room
    UserRoom.query.filter_by(room_id=room_id_int).delete()
    
    db.session.delete(room)
    db.session.commit()
    return jsonify({'message': 'Room deleted successfully'}), 200


@api_bp.route('/rooms/<room_id>/join', methods=['POST'])
@jwt_required()
def join_room(room_id):
    try:
        room_id_int = int(room_id)
    except ValueError:
        return jsonify({'error': 'Invalid room ID'}), 400
    
    current_user_id = get_jwt_identity()
    room = Room.query.get_or_404(room_id_int)

    # Check if user is already in a room
    existing_user_room = UserRoom.query.filter_by(user_id=current_user_id).first()
    if existing_user_room:
        return jsonify({'error': 'Already in a room'}), 400

    # Check if room is full
    if room.participants >= room.max_participants:
        return jsonify({'error': 'Room is full'}), 400

    # Add user to room
    user_room = UserRoom(user_id=current_user_id, room_id=room_id_int)
    db.session.add(user_room)
    
    # Update room participants count
    room.participants += 1
    room.status = 'live' if room.participants > 0 else 'idle'
    db.session.commit()

    return jsonify(room.to_dict()), 200


@api_bp.route('/rooms/<room_id>/leave', methods=['POST'])
@jwt_required()
def leave_room(room_id):
    try:
        room_id_int = int(room_id)
    except ValueError:
        return jsonify({'error': 'Invalid room ID'}), 400
    
    current_user_id = get_jwt_identity()
    room = Room.query.get_or_404(room_id_int)

    # Remove user from room
    user_room = UserRoom.query.filter_by(user_id=current_user_id, room_id=room_id_int).first()
    if not user_room:
        return jsonify({'error': 'Not in this room'}), 400

    db.session.delete(user_room)
    
    # Update room participants count
    room.participants -= 1
    
    # Check if the user leaving is the owner, if so, delete the room
    if current_user_id == room.owner_id:
        # Remove all users from the room
        UserRoom.query.filter_by(room_id=room_id_int).delete()
        # Delete the room
        db.session.delete(room)
        db.session.commit()
        return jsonify({'message': 'Room deleted successfully'}), 200
    
    # Update room status if empty
    if room.participants == 0:
        room.status = 'idle'
    else:
        room.status = 'live'
    
    db.session.commit()

    return jsonify({'message': 'Left room successfully'}), 200


# Settings endpoints
@api_bp.route('/settings', methods=['GET'])
@jwt_required()
def get_settings():
    """获取当前用户的设置"""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    
    if not user.settings:
        # 如果设置不存在，创建默认设置
        settings = Settings(user_id=user.id)
        db.session.add(settings)
        db.session.commit()
    
    return jsonify(user.settings.to_dict()), 200


@api_bp.route('/settings', methods=['PUT'])
@jwt_required()
def update_settings():
    """更新当前用户的设置"""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    data = request.get_json()
    
    if not user.settings:
        # 如果设置不存在，创建默认设置
        settings = Settings(user_id=user.id)
        db.session.add(settings)
    
    # 更新设置字段
    for key, value in data.items():
        if hasattr(user.settings, key):
            setattr(user.settings, key, value)
    
    db.session.commit()
    return jsonify(user.settings.to_dict()), 200


@api_bp.route('/settings/reset', methods=['POST'])
@jwt_required()
def reset_settings():
    """恢复当前用户的设置为默认值"""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    
    # 获取默认设置
    default_settings = Settings.get_default_settings()
    
    if not user.settings:
        # 如果设置不存在，创建默认设置
        settings = Settings(user_id=user.id, **default_settings)
        db.session.add(settings)
    else:
        # 恢复默认设置
        for key, value in default_settings.items():
            setattr(user.settings, key, value)
    
    db.session.commit()
    return jsonify(user.settings.to_dict()), 200


# Helper function to save uploaded files
def save_uploaded_file(file):
    """保存上传的文件并返回文件路径"""
    # 确保上传目录存在
    upload_folder = os.path.join(current_app.root_path, 'uploads')
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    
    # 生成唯一文件名
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    file_path = os.path.join(upload_folder, unique_filename)
    
    # 保存文件
    file.save(file_path)
    
    # 返回相对路径，用于存储在数据库中
    return f"/uploads/{unique_filename}"

# File upload endpoint
@api_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    """上传文件（图片或视频）"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # 验证文件类型
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'avi', 'mov'}
        if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
            return jsonify({'error': 'File type not allowed'}), 400
        
        # 验证文件大小（限制为10MB）
        if file.content_length > 10 * 1024 * 1024:
            return jsonify({'error': 'File too large (maximum 10MB)'}), 400
        
        # 保存文件并返回路径
        file_path = save_uploaded_file(file)
        
        return jsonify({'url': file_path}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to upload file: {str(e)}'}), 500

# Post endpoints
@api_bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    """创建帖子"""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    data = request.get_json()
    
    if not data or 'content' not in data:
        return jsonify({'error': 'Missing post content'}), 400
    
    try:
        post = Post(
            account_id=user.accountID,
            content=data['content'],
            images=data.get('images', []),
            videos=data.get('videos', []),
            location=data.get('location'),
            tags=data.get('tags', []),
            category=data.get('category', 'discussion')
        )
        
        db.session.add(post)
        db.session.commit()
        
        return jsonify(post.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create post: {str(e)}'}), 500


@api_bp.route('/posts', methods=['GET'])
@jwt_required()
def get_posts():
    """获取帖子列表，支持分页、排序和筛选"""
    # 获取查询参数
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    category = request.args.get('category')
    tag = request.args.get('tag')
    sort_by = request.args.get('sort_by', 'created_at')
    order = request.args.get('order', 'desc')
    
    # 构建查询
    posts_query = Post.query.filter_by(is_deleted=False)
    
    # 筛选条件
    if category:
        posts_query = posts_query.filter_by(category=category)
    
    if tag:
        posts_query = posts_query.filter(Post.tags.contains([tag]))
    
    # 排序
    if sort_by in ['created_at', 'updated_at', 'likes', 'comments', 'shares']:
        sort_column = getattr(Post, sort_by)
        if order == 'desc':
            posts_query = posts_query.order_by(sort_column.desc())
        else:
            posts_query = posts_query.order_by(sort_column.asc())
    else:
        # 默认按创建时间降序排序
        posts_query = posts_query.order_by(Post.created_at.desc())
    
    # 获取分页结果
    posts = get_paginated_results(posts_query, page, per_page)
    
    return jsonify(posts), 200


@api_bp.route('/posts/<int:post_id>', methods=['GET'])
@jwt_required()
def get_post(post_id):
    """获取帖子详情"""
    post = Post.query.filter_by(id=post_id, is_deleted=False).first_or_404()
    return jsonify(post.to_dict()), 200


@api_bp.route('/posts/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    """更新帖子，只有帖子作者可以修改"""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    post = Post.query.filter_by(id=post_id, is_deleted=False).first_or_404()
    
    # 验证权限：只有帖子作者可以修改
    if post.account_id != user.accountID:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    try:
        # 更新帖子字段
        if 'content' in data:
            post.content = data['content']
        if 'images' in data:
            post.images = data['images']
        if 'videos' in data:
            post.videos = data['videos']
        if 'location' in data:
            post.location = data['location']
        if 'tags' in data:
            post.tags = data['tags']
        if 'category' in data:
            post.category = data['category']
        
        db.session.commit()
        
        return jsonify(post.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update post: {str(e)}'}), 500


@api_bp.route('/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    """删除帖子，只有帖子作者可以删除"""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    post = Post.query.filter_by(id=post_id, is_deleted=False).first_or_404()
    
    # 验证权限：只有帖子作者可以删除
    if post.account_id != user.accountID:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        # 软删除：标记为已删除而不是物理删除
        post.is_deleted = True
        db.session.commit()
        
        return jsonify({'message': 'Post deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete post: {str(e)}'}), 500


@api_bp.route('/posts/<int:post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    """点赞帖子"""
    post = Post.query.filter_by(id=post_id, is_deleted=False).first_or_404()
    
    try:
        post.likes += 1
        db.session.commit()
        
        return jsonify({'likes': post.likes}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to like post: {str(e)}'}), 500


@api_bp.route('/posts/<int:post_id>/save', methods=['POST'])
@jwt_required()
def save_post(post_id):
    """收藏帖子"""
    post = Post.query.filter_by(id=post_id, is_deleted=False).first_or_404()
    
    try:
        post.saves += 1
        db.session.commit()
        
        return jsonify({'saves': post.saves}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to save post: {str(e)}'}), 500


@api_bp.route('/posts/<int:post_id>/share', methods=['POST'])
@jwt_required()
def share_post(post_id):
    """分享帖子"""
    post = Post.query.filter_by(id=post_id, is_deleted=False).first_or_404()
    
    try:
        post.shares += 1
        db.session.commit()
        
        return jsonify({'shares': post.shares}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to share post: {str(e)}'}), 500


# Messages system endpoints

@api_bp.route('/users/search', methods=['GET'])
@jwt_required()
def search_users():
    """根据关键词搜索用户"""
    query = request.args.get('q', '')
    if not query:
        return jsonify([]), 200
    
    # 搜索用户
    users = User.query.filter(
        (User.username.ilike(f'%{query}%')) |
        (User.accountID == query) |
        (User.name.ilike(f'%{query}%'))
    ).limit(20).all()
    
    result = [user.to_dict() for user in users]
    return jsonify(result), 200


@api_bp.route('/users/match/random', methods=['POST'])
@jwt_required()
def random_match():
    """随机匹配用户"""
    user_id = get_jwt_identity()
    
    # 获取当前用户的所有好友ID
    friend_ids = db.session.query(Friendship.friend_id).filter(
        (Friendship.user_id == user_id) &
        (Friendship.status == 'friend')
    ).all()
    friend_ids = [f[0] for f in friend_ids]
    friend_ids.append(user_id)  # 排除自己
    
    # 随机选择一个用户
    random_user = User.query.filter(
        User.id.notin_(friend_ids)
    ).order_by(db.func.rand()).first()
    
    if not random_user:
        return jsonify({'error': 'No users available for matching'}), 404
    
    return jsonify(random_user.to_dict()), 200


@api_bp.route('/friends', methods=['GET'])
@jwt_required()
def get_friends():
    """获取好友列表"""
    user_id = get_jwt_identity()
    
    # 获取所有好友关系
    friendships = Friendship.query.filter(
        ((Friendship.user_id == user_id) | (Friendship.friend_id == user_id)) &
        (Friendship.status == 'friend')
    ).all()
    
    friends = []
    for friendship in friendships:
        # 确定好友对象
        if friendship.user_id == user_id:
            friend = friendship.friend
        else:
            friend = friendship.user
        
        # 获取最近一条消息
        last_message = Message.query.filter(
            ((Message.sender_id == user_id) & (Message.recipient_id == friend.id)) |
            ((Message.sender_id == friend.id) & (Message.recipient_id == user_id))
        ).order_by(Message.created_at.desc()).first()
        
        # 获取未读消息数量
        unread_count = Message.query.filter(
            (Message.sender_id == friend.id) &
            (Message.recipient_id == user_id) &
            (Message.is_read == False)
        ).count()
        
        friend_dict = friend.to_dict()
        friend_dict.update({
            'lastMessage': last_message.content if last_message else None,
            'lastTime': last_message.created_at.strftime('%H:%M') if last_message else None,
            'lastTimestamp': int(last_message.created_at.timestamp() * 1000) if last_message else 0,
            'unreadCount': unread_count,
            'status': 'friend',
            'avatar': f'https://picsum.photos/seed/user-{friend.id}/400/225'
        })
        
        friends.append(friend_dict)
    
    return jsonify(friends), 200


@api_bp.route('/friends/<int:friend_id>/request', methods=['POST'])
@jwt_required()
def send_friend_request(friend_id):
    """发送好友请求"""
    user_id = get_jwt_identity()
    
    # 检查是否已经是好友或已经发送过请求
    existing_friendship = Friendship.query.filter(
        ((Friendship.user_id == user_id) & (Friendship.friend_id == friend_id)) |
        ((Friendship.user_id == friend_id) & (Friendship.friend_id == user_id))
    ).first()
    
    if existing_friendship:
        return jsonify({'error': 'Friendship already exists'}), 400
    
    # 创建好友请求
    friendship = Friendship(
        user_id=user_id,
        friend_id=friend_id,
        status='pending_sent'
    )
    
    db.session.add(friendship)
    db.session.commit()
    
    return jsonify({'message': 'Friend request sent successfully'}), 200


@api_bp.route('/friends/<int:friend_id>/accept', methods=['PUT'])
@jwt_required()
def accept_friend_request(friend_id):
    """接受好友请求"""
    user_id = get_jwt_identity()
    
    # 查找待接受的好友请求
    friendship = Friendship.query.filter(
        (Friendship.user_id == friend_id) &
        (Friendship.friend_id == user_id) &
        (Friendship.status == 'pending_sent')
    ).first()
    
    if not friendship:
        return jsonify({'error': 'Friend request not found'}), 404
    
    # 更新好友关系状态
    friendship.status = 'friend'
    db.session.commit()
    
    return jsonify({'message': 'Friend request accepted successfully'}), 200


@api_bp.route('/friends/<int:friend_id>', methods=['DELETE'])
@jwt_required()
def delete_friend(friend_id):
    """删除好友"""
    user_id = get_jwt_identity()
    
    # 查找好友关系
    friendship = Friendship.query.filter(
        ((Friendship.user_id == user_id) & (Friendship.friend_id == friend_id)) |
        ((Friendship.user_id == friend_id) & (Friendship.friend_id == user_id))
    ).first()
    
    if not friendship:
        return jsonify({'error': 'Friendship not found'}), 404
    
    # 删除好友关系
    db.session.delete(friendship)
    db.session.commit()
    
    return jsonify({'message': 'Friend removed successfully'}), 200


@api_bp.route('/messages/<int:user_id>', methods=['GET'])
@jwt_required()
def get_messages(user_id):
    """获取与指定用户的消息历史"""
    current_user_id = get_jwt_identity()
    
    # 获取消息历史，按时间顺序排列
    messages = Message.query.filter(
        ((Message.sender_id == current_user_id) & (Message.recipient_id == user_id)) |
        ((Message.sender_id == user_id) & (Message.recipient_id == current_user_id))
    ).order_by(Message.created_at.asc()).all()
    
    # 标记消息为已读
    Message.query.filter(
        (Message.sender_id == user_id) &
        (Message.recipient_id == current_user_id) &
        (Message.is_read == False)
    ).update({'is_read': True})
    db.session.commit()
    
    result = [message.to_dict() for message in messages]
    return jsonify(result), 200


@api_bp.route('/messages/<int:user_id>/read', methods=['PUT'])
@jwt_required()
def mark_messages_as_read(user_id):
    """标记消息为已读"""
    current_user_id = get_jwt_identity()
    
    # 标记所有来自该用户的消息为已读
    updated_count = Message.query.filter(
        (Message.sender_id == user_id) &
        (Message.recipient_id == current_user_id) &
        (Message.is_read == False)
    ).update({'is_read': True})
    
    db.session.commit()
    
    return jsonify({'message': f'{updated_count} messages marked as read'}), 200


@api_bp.route('/messages/<int:message_id>', methods=['DELETE'])
@jwt_required()
def delete_message(message_id):
    """删除指定消息"""
    current_user_id = get_jwt_identity()
    
    # 查找消息
    message = Message.query.get_or_404(message_id)
    
    # 验证权限：只有消息发送者可以删除
    if message.sender_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # 删除消息
    db.session.delete(message)
    db.session.commit()
    
    return jsonify({'message': 'Message deleted successfully'}), 200
