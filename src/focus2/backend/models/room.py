from app import db
from datetime import datetime

class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.String(100), unique=True, nullable=False, index=True)  # 房间号，方便搜索
    room_name = db.Column(db.String(255), nullable=False)  # 房间名称
    host = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # 房间创建者/主持者
    room_type = db.Column(db.Boolean, default=False)  # 0表示1对1，1表示1对多
    population_max = db.Column(db.Integer, default=2)  # 最大人数，1对1默认为2
    Avatars = db.Column(db.Boolean, default=True)  # 是否允许虚拟形象
    focus_time = db.Column(db.Integer, default=0)  # 记录过了多少时间（秒）
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 创建时间
    ended_at = db.Column(db.DateTime)  # 房间结束时间
    

    
    def to_dict(self):
        return {
            'id': self.room_id,  # 使用room_id作为前端的id
            'title': self.room_name,  # 使用room_name作为前端的title
            'type': '1:many' if self.room_type else '1:1',  # 转换为前端的RoomType
            'participants': 0,  # 初始参与者为0
            'maxParticipants': self.population_max,
            'tags': ['live'] if not self.ended_at else ['idle'],  # 根据ended_at设置标签
            'status': 'live' if not self.ended_at else 'idle',  # 根据ended_at设置状态
            'virtualAllowed': self.Avatars,
            'thumbnail': f'https://picsum.photos/seed/{self.room_id}/400/300',  # 生成随机缩略图
            'createdBy': self.host,  # 直接返回整数类型，与用户id类型匹配
            'room_id': self.room_id,  # 保留原始room_id
            'host': self.host,
            'focus_time': self.focus_time,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'ended_at': self.ended_at.isoformat() if self.ended_at else None
        }

