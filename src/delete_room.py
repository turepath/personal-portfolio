from app import create_app, db
from models.room import Room, UserRoom

# 创建应用实例
available_app = create_app()

with available_app.app_context():
    # 查找房间1
    room = Room.query.get(1)
    if room:
        print(f"找到房间: {room.name} (ID: {room.id})")
        
        # 删除房间相关的所有UserRoom记录
        UserRoom.query.filter_by(room_id=room.id).delete()
        print(f"已删除房间{room.id}的所有参与者记录")
        
        # 删除房间
        db.session.delete(room)
        db.session.commit()
        print(f"已成功删除房间: {room.name} (ID: {room.id})")
    else:
        print("未找到ID为1的房间")
