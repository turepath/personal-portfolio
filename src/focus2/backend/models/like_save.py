from app import db

class LikeSave(db.Model):
    __tablename__ = 'post_likes_saves'
    
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False, index=True)
    useraccount_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    likes = db.Column(db.Boolean, default=False)
    saves = db.Column(db.Boolean, default=False)
    
    # Relationships
    post = db.relationship('Post', lazy=True)
    user = db.relationship('User', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'post_id': self.post_id,
            'useraccount_id': self.useraccount_id,
            'likes': self.likes,
            'saves': self.saves
        }
    
    def __repr__(self):
        return f'<LikeSave Post {self.post_id} by User {self.useraccount_id}>'