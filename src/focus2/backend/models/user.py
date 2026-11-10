from app import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    accountID = db.Column(db.String(100), unique=True, nullable=False)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    avatar = db.Column(db.String(255))
    user_photo = db.Column(db.String(255))
    bio = db.Column(db.Text)
    birthDate = db.Column(db.String(50))
    is_pro = db.Column(db.Boolean, default=False)
    last_login = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    rooms = db.relationship('Room', backref='owner', lazy=True)
    posts = db.relationship('Post', back_populates='author', lazy=True)
    friendships = db.relationship('Friendship', foreign_keys='Friendship.user_id', back_populates='user', lazy=True)
    friend_requests = db.relationship('Friendship', foreign_keys='Friendship.friend_id', back_populates='friend', lazy=True)
    messages_sent = db.relationship('Message', foreign_keys='Message.sender_id', back_populates='sender', lazy=True)
    messages_received = db.relationship('Message', foreign_keys='Message.recipient_id', back_populates='recipient', lazy=True)
    settings = db.relationship('Settings', back_populates='user', uselist=False, lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'accountID': self.accountID,
            'username': self.username,
            'email': self.email,
            'avatar': self.avatar,
            'user_photo': self.user_photo,
            'bio': self.bio,
            'birthDate': self.birthDate,
            'is_pro': self.is_pro,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def set_password(self, password):
        from werkzeug.security import generate_password_hash
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        from werkzeug.security import check_password_hash
        return check_password_hash(self.password_hash, password)