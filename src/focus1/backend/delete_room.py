from app import create_app, db
from models.room import Room, UserRoom

# 创建应用实例
available_app = create_app()

with available_app.app_context():
    # 查看所有可用房间
    rooms = Room.query.all()
    print(f"当前共有 {len(rooms)} 个房间：")
    for room in rooms:
        print(f"  - 房间 {room.id}: {room.name} (类型: {room.type}, 参与者: {room.participants}, 状态: {room.status})")
    
    # 如果有房间，删除第一个房间
    if rooms:
        room_to_delete = rooms[0]
        print(f"\n准备删除房间: {room_to_delete.name} (ID: {room_to_delete.id})")
        
        # 删除房间相关的所有UserRoom记录
        UserRoom.query.filter_by(room_id=room_to_delete.id).delete()
        print(f"已删除房间{room_to_delete.id}的所有参与者记录")
        
        # 删除房间
        db.session.delete(room_to_delete)
        db.session.commit()
        print(f"已成功删除房间: {room_to_delete.name} (ID: {room_to_delete.id})")
        
        # 再次查看房间列表
        updated_rooms = Room.query.all()
        print(f"\n删除后共有 {len(updated_rooms)} 个房间：")
        for room in updated_rooms:
            print(f"  - 房间 {room.id}: {room.name} (类型: {room.type}, 参与者: {room.participants}, 状态: {room.status})")
    else:
        print("没有可用房间可删除")
