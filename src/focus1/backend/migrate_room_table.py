from app import create_app, db
from models.room import Room, UserRoom
from models.user import User
from sqlalchemy import text

def migrate_room_table():
    app = create_app()
    
    with app.app_context():
        try:
            print("开始迁移 Room 表...")
            
            # 检查并添加新字段
            inspector = db.inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('room')]
            
            print(f"当前 Room 表字段: {columns}")
            
            # 添加 participants 字段
            if 'participants' not in columns:
                print("添加 participants 字段...")
                db.session.execute(text("ALTER TABLE room ADD COLUMN participants INTEGER DEFAULT 1"))
            
            # 添加 virtual_allowed 字段
            if 'virtual_allowed' not in columns:
                print("添加 virtual_allowed 字段...")
                db.session.execute(text("ALTER TABLE room ADD COLUMN virtual_allowed BOOLEAN DEFAULT TRUE"))
            
            # 添加 is_paid 字段
            if 'is_paid' not in columns:
                print("添加 is_paid 字段...")
                db.session.execute(text("ALTER TABLE room ADD COLUMN is_paid BOOLEAN DEFAULT FALSE"))
            
            # 更新现有记录的 participants 字段
            print("更新现有记录的 participants 字段...")
            rooms = Room.query.all()
            for room in rooms:
                user_room_count = UserRoom.query.filter_by(room_id=room.id).count()
                if user_room_count > 0:
                    room.participants = user_room_count
                    print(f"房间 {room.id} 的参与者数量: {user_room_count}")
            
            db.session.commit()
            print("Room 表迁移完成！")
            
        except Exception as e:
            print(f"迁移失败: {e}")
            db.session.rollback()
            raise

if __name__ == "__main__":
    migrate_room_table()
