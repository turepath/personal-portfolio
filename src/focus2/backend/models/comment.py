from app import db
from datetime import datetime

class Comment(db.Model):
    __tablename__ = 'post_comments'
    
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False, index=True)
    useraccount_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    post = db.relationship('Post', back_populates='comments_rel', lazy=True)
    user = db.relationship('User', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'post_id': self.post_id,
            'useraccount_id': self.useraccount_id,
            'content': self.content,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user': {
                'id': self.user.id,
                'username': self.user.username,
                'avatar': self.user.avatar
            } if self.user else None
        }
    
    def __repr__(self):
        return f'<Comment {self.id} on Post {self.post_id} by User {self.useraccount_id}>'