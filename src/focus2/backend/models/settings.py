from app import db

class Settings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    Theme = db.Column(db.String(50), default='Auto (system)')
    Simplified_Mode = db.Column(db.Boolean, default=False)
    Animation = db.Column(db.String(50), default='Reduced motion')
    Color = db.Column(db.String(50), default='#8A9B6E')
    Font_Size = db.Column(db.Integer, default=16)
    Rest_interval = db.Column(db.Integer, default=25)
    task_due_reminders = db.Column(db.String(50), default='30 min before')
    White_Noise = db.Column(db.String(50), default='None')
    White_Noise_start = db.Column(db.Boolean, default=False)
    default_room = db.Column(db.String(50), default='1:1')
    Anonymized = db.Column(db.Boolean, default=False)
    Personalized = db.Column(db.Boolean, default=False)
    Targeted = db.Column(db.Boolean, default=False)
    
    # Relationships
    user = db.relationship('User', back_populates='settings', uselist=False, lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'Theme': self.Theme,
            'Simplified_Mode': self.Simplified_Mode,
            'Animation': self.Animation,
            'Color': self.Color,
            'Font_Size': self.Font_Size,
            'Rest_interval': self.Rest_interval,
            'task_due_reminders': self.task_due_reminders,
            'White_Noise': self.White_Noise,
            'White_Noise_start': self.White_Noise_start,
            'default_room': self.default_room,
            'Anonymized': self.Anonymized,
            'Personalized': self.Personalized,
            'Targeted': self.Targeted
        }
    
    @staticmethod
    def get_default_settings():
        return {
            'Theme': 'Auto (system)',
            'Simplified_Mode': False,
            'Animation': 'Reduced motion',
            'Color': '#8A9B6E',
            'Font_Size': 16,
            'Rest_interval': 25,
            'task_due_reminders': '30 min before',
            'White_Noise': 'None',
            'White_Noise_start': False,
            'default_room': '1:1',
            'Anonymized': False,
            'Personalized': False,
            'Targeted': False
        }