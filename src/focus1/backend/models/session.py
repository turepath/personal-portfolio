from app import db
from datetime import datetime

class Session(db.Model):
    __tablename__ = 'sessions'
    
    id = db.Column(db.String(64), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    socket_id = db.Column(db.String(64), nullable=False)
    ip_address = db.Column(db.String(45), nullable=False)
    connected_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_active = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = db.Column(db.String(20), nullable=False, default='online')
    
    # Relationship
    user = db.relationship('User', backref='sessions')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': str(self.user_id),
            'socket_id': self.socket_id,
            'ip_address': self.ip_address,
            'connected_at': self.connected_at.isoformat(),
            'last_active': self.last_active.isoformat(),
            'status': self.status
        }