from app import db
from datetime import datetime

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(20), nullable=False, default='text')
    file_url = db.Column(db.String(256), nullable=True)
    file_name = db.Column(db.String(256), nullable=True)
    room_id = db.Column(db.String(64), nullable=True)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    recipient = db.relationship('User', foreign_keys=[recipient_id], backref='received_messages')
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'sender_id': str(self.sender_id),
            'recipient_id': str(self.recipient_id),
            'content': self.content,
            'type': self.type,
            'file_url': self.file_url,
            'file_name': self.file_name,
            'room_id': self.room_id,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat()
        }