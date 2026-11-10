from datetime import datetime
from app import db

class UserRoom(db.Model):
    __tablename__ = 'user_rooms'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_muted = db.Column(db.Boolean, default=False)
    is_camera_on = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'room_id': self.room_id,
            'joined_at': self.joined_at.isoformat(),
            'is_muted': self.is_muted,
            'is_camera_on': self.is_camera_on
        }

class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False, index=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(20), nullable=False, default='1:1')  # '1:1', '1:many'
    max_participants = db.Column(db.Integer, default=2)
    participants = db.Column(db.Integer, default=1)
    virtual_allowed = db.Column(db.Boolean, default=True)
    is_paid = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default='waiting')  # 'waiting', 'active', 'ended'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.name,
            'type': self.type,
            'participants': self.participants,
            'maxParticipants': self.max_participants,
            'tags': [],
            'status': self.status,
            'virtualAllowed': self.virtual_allowed,
            'thumbnail': f'https://picsum.photos/seed/room-{self.id}/400/225',
            'isPaid': self.is_paid,
            'ownerId': self.owner_id,
            'createdAt': self.created_at.isoformat()
        }
