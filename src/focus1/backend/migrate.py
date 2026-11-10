from app import create_app
from flask_migrate import init, migrate, upgrade
import os

# 创建应用实例
app = create_app()

with app.app_context():
    # 创建迁移目录（如果不存在）
    if not os.path.exists('migrations'):
        init()
    
    # 生成迁移脚本
    migrate(message='Initial migration')
    
    # 应用迁移
    upgrade()
    
    print("数据库迁移完成！")