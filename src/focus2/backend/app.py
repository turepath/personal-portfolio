from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from flask_cors import CORS
from config import Config
from utils.logger import get_logger

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
socketio = SocketIO()

# 获取日志记录器
logger = get_logger(__name__)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://10.10.41.3:5174", "http://10.10.41.3:4173"], supports_credentials=True)
    socketio.init_app(app, cors_allowed_origins="*", cors_credentials=True)
    
    # 添加数据库连接池日志
    logger.info(f"Database connection pool configured with size: {app.config.get('SQLALCHEMY_POOL_SIZE', 20)}")
    logger.info(f"Database connection pool max overflow: {app.config.get('SQLALCHEMY_MAX_OVERFLOW', 10)}")
    logger.info(f"Database connection pool recycle time: {app.config.get('SQLALCHEMY_POOL_RECYCLE', 3600)}s")
    
    # Add static file service for uploads
    import os
    upload_folder = os.path.join(app.root_path, 'uploads')
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    app.config['UPLOAD_FOLDER'] = upload_folder
    
    # Register blueprints
    from routes.api import api_bp
    from routes.auth import auth_bp
    from routes.websocket import websocket_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(websocket_bp)
    
    # Register error handlers
    from utils.errors import register_error_handlers
    register_error_handlers(app)
    
    # Import all models to ensure they are registered with SQLAlchemy
    with app.app_context():
        try:
            # Import models to register them with SQLAlchemy
            from models.user import User
            from models.post import Post
            from models.comment import Comment
            from models.like_save import LikeSave
            from models.room import Room
            from models.settings import Settings
            from models.friendship import Friendship
            from models.message import Message
            
            db.create_all()
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Error creating database tables: {e}")
            raise
    
    # Add route for static files
    @app.route('/uploads/<path:filename>')
    def uploads(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    logger.info("Flask application initialized successfully")
    return app