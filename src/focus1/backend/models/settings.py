from app import db

class Settings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    
    # 应用设置
    theme = db.Column(db.String(20), default='light')  # light, dark, system
    language = db.Column(db.String(10), default='zh-CN')  # zh-CN, en-US
    notifications_enabled = db.Column(db.Boolean, default=True)
    email_notifications = db.Column(db.Boolean, default=True)
    
    # 专注模式设置
    focus_duration = db.Column(db.Integer, default=25)  # 专注时长（分钟）
    short_break_duration = db.Column(db.Integer, default=5)  # 短休息时长（分钟）
    long_break_duration = db.Column(db.Integer, default=15)  # 长休息时长（分钟）
    long_break_interval = db.Column(db.Integer, default=4)  # 长休息间隔（专注次数）
    auto_start_break = db.Column(db.Boolean, default=True)  # 自动开始休息
    auto_start_focus = db.Column(db.Boolean, default=False)  # 自动开始专注
    
    # 声音设置
    sound_enabled = db.Column(db.Boolean, default=True)
    sound_volume = db.Column(db.Float, default=0.7)  # 音量 0-1
    notification_sound = db.Column(db.String(50), default='default')  # 通知声音
    
    # 番茄钟统计设置
    weekly_report_enabled = db.Column(db.Boolean, default=True)
    
    # 关系
    user = db.relationship('User', backref=db.backref('settings', uselist=False, cascade='all, delete-orphan'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'theme': self.theme,
            'language': self.language,
            'notifications_enabled': self.notifications_enabled,
            'email_notifications': self.email_notifications,
            'focus_duration': self.focus_duration,
            'short_break_duration': self.short_break_duration,
            'long_break_duration': self.long_break_duration,
            'long_break_interval': self.long_break_interval,
            'auto_start_break': self.auto_start_break,
            'auto_start_focus': self.auto_start_focus,
            'sound_enabled': self.sound_enabled,
            'sound_volume': self.sound_volume,
            'notification_sound': self.notification_sound,
            'weekly_report_enabled': self.weekly_report_enabled
        }
    
    # 获取默认设置的类方法
    @classmethod
    def get_default_settings(cls):
        return {
            'theme': 'light',
            'language': 'zh-CN',
            'notifications_enabled': True,
            'email_notifications': True,
            'focus_duration': 25,
            'short_break_duration': 5,
            'long_break_duration': 15,
            'long_break_interval': 4,
            'auto_start_break': True,
            'auto_start_focus': False,
            'sound_enabled': True,
            'sound_volume': 0.7,
            'notification_sound': 'default',
            'weekly_report_enabled': True
        }