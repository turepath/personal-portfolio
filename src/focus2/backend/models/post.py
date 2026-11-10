from app import db
from datetime import datetime

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    title = db.Column(db.String(255))
    images = db.Column(db.JSON, default=lambda: [])
    videos = db.Column(db.JSON, default=lambda: [])
    media = db.Column(db.JSON, default=lambda: [])
    location = db.Column(db.String(255))
    tags = db.Column(db.JSON, default=lambda: [])
    likes = db.Column(db.Integer, default=0)
    comments = db.Column(db.Integer, default=0)
    shares = db.Column(db.Integer, default=0)
    saves = db.Column(db.Integer, default=0)
    is_deleted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    author = db.relationship('User', back_populates='posts', lazy=True)
    comments_rel = db.relationship('Comment', back_populates='post', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'author_id': self.author_id,
            'content': self.content,
            'title': self.title,
            'images': self.images or [],
            'videos': self.videos or [],
            'media': self.media or [],
            'location': self.location,
            'tags': self.tags or [],
            'likes': self.likes,
            'comments': self.comments,
            'shares': self.shares,
            'saves': self.saves,
            'is_deleted': self.is_deleted,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'author': {
                'id': self.author.id,
                'username': self.author.username,
                'avatar': self.author.avatar
            } if self.author else None
        }
    
    def __repr__(self):
        return f'<Post {self.id} by {self.author_id}>'