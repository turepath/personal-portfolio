from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
from models.settings import Settings
from app import db
import uuid

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """用户注册"""
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # 检查邮箱是否已存在
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # 生成唯一的accountID
    account_id = str(uuid.uuid4())[:8]
    while User.query.filter_by(accountID=account_id).first():
        account_id = str(uuid.uuid4())[:8]
    
    # 获取用户名（优先使用 username，其次使用 displayName，最后使用邮箱前缀）
    username = data.get('username') or data.get('displayName') or data['email'].split('@')[0]
    
    user = User(
        accountID=account_id,
        username=username,
        email=data['email']
    )
    user.set_password(data['password'])
    
    try:
        db.session.add(user)
        db.session.flush()  # 获取用户ID但不提交事务
        
        # 为新用户创建设置行
        default_settings = Settings.get_default_settings()
        settings = Settings(
            user_id=user.id,
            **default_settings
        )
        db.session.add(settings)
        
        db.session.commit()
        
        # 创建访问令牌
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """用户登录"""
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # 查找用户
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # 创建访问令牌
    access_token = create_access_token(identity=user.id)
    
    # 更新最后登录时间
    user.last_login = db.func.current_timestamp()
    db.session.commit()
    
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """获取当前登录用户信息"""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    
    return jsonify(user.to_dict()), 200

@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    """更新当前登录用户信息"""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        if 'username' in data:
            user.username = data['username']
        if 'displayName' in data or 'name' in data:
            user.username = data.get('displayName') or data.get('name')
        if 'email' in data:
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'error': 'Email already exists'}), 400
            user.email = data['email']
        if 'password' in data:
            user.set_password(data['password'])
        if 'bio' in data:
            user.bio = data['bio']
        if 'birthDate' in data:
            user.birthDate = data['birthDate']
        if 'user_photo' in data:
            user.user_photo = data['user_photo']
        if 'avatar' in data:
            user.avatar = data['avatar']
        
        db.session.commit()
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Update failed: {str(e)}'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """用户登出"""
    # 在JWT中，登出通常是在客户端删除token
    # 这里可以添加一些额外的处理，如token黑名单等
    return jsonify({'message': 'Logged out successfully'}), 200