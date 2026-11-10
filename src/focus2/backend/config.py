import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://root:CHANGE_ME@localhost:3306/focus?charset=utf8mb4"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # 连接池配置
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 20,              # 连接池大小，默认为5
        'pool_timeout': 30,             # 获取连接的超时时间（秒）
        'pool_recycle': 3600,           # 连接回收时间（秒），1小时后回收连接
        'max_overflow': 10,             # 最大溢出连接数，超过pool_size后最多再创建的连接数
        'pool_pre_ping': True,            # 获取连接时先ping检查连接是否有效
        'pool_reset_on_return': 'commit', # 连接归还时执行的操作
        'echo': False,                  # 是否打印SQL语句（开发调试用）
    }
    
    # 兼容旧版本Flask-SQLAlchemy的配置方式
    SQLALCHEMY_POOL_SIZE = 20
    SQLALCHEMY_POOL_TIMEOUT = 30
    SQLALCHEMY_POOL_RECYCLE = 3600
    SQLALCHEMY_MAX_OVERFLOW = 10
    
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'dev-jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
    
    # SocketIO Configuration
    SOCKETIO_MESSAGE_QUEUE = None