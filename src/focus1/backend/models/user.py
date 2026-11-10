import random
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Additional fields for frontend
    accountID = db.Column(db.String(8), unique=True, nullable=False, default=lambda: str(random.randint(10000000, 99999999)))
    name = db.Column(db.String(64), nullable=False, default='New User')
    avatar = db.Column(db.Text, nullable=False, default='https://picsum.photos/seed/user/100/100')
    isPro = db.Column(db.Boolean, default=False)
    points = db.Column(db.Integer, default=0)
    bio = db.Column(db.Text, nullable=True)
    birthDate = db.Column(db.Date, nullable=True)
    
    # Relationships
    rooms = db.relationship('Room', backref='owner', lazy='dynamic')
    communities = db.relationship('Community', secondary='user_communities', backref=db.backref('members', lazy='dynamic'))
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'username': self.username,
            'accountID': self.accountID,
            'name': self.name,
            'avatar': self.avatar,
            'isPro': self.isPro,
            'points': self.points,
            'bio': self.bio,
            'birthDate': self.birthDate.isoformat() if self.birthDate else None
        }
