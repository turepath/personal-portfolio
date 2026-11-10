from datetime import datetime
from app import db

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.String(8), db.ForeignKey('user.accountID'), nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    images = db.Column(db.JSON, nullable=True)  # Store array of image URLs/paths
    videos = db.Column(db.JSON, nullable=True)  # Store array of video URLs/paths
    location = db.Column(db.String(256), nullable=True)
    tags = db.Column(db.JSON, nullable=True)  # Store array of tags
    category = db.Column(db.String(64), nullable=False, default='discussion')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    likes = db.Column(db.Integer, default=0)
    comments = db.Column(db.Integer, default=0)
    shares = db.Column(db.Integer, default=0)
    saves = db.Column(db.Integer, default=0)
    is_deleted = db.Column(db.Boolean, default=False, index=True)
    
    # Relationship with User model
    user = db.relationship('User', backref=db.backref('posts', lazy='dynamic'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'account_id': self.account_id,
            'content': self.content,
            'images': self.images or [],
            'videos': self.videos or [],
            'location': self.location,
            'tags': self.tags or [],
            'category': self.category,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'likes': self.likes,
            'comments': self.comments,
            'shares': self.shares,
            'saves': self.saves,
            'is_deleted': self.is_deleted,
            'user': {
                'accountID': self.user.accountID,
                'name': self.user.name,
                'avatar': self.user.avatar,
                'isPro': self.user.isPro
            }
        }
    
    def __repr__(self):
        return f'<Post {self.id} by {self.account_id}>'
