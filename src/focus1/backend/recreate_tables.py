from app import create_app, db

# 创建应用实例
app = create_app()

with app.app_context():
    # 先删除所有表
    db.drop_all()
    print("所有表已删除！")
    
    # 然后重新创建所有表
    db.create_all()
    print("所有表已重新创建！")
    
    print("数据库表结构已更新完成！")