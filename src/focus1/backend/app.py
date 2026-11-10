from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from flask_cors import CORS
from config import Config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
socketio = SocketIO()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, origins="*")
    socketio.init_app(app, cors_allowed_origins="*")
    
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
    
    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()
    
    # Add route for static files
    @app.route('/uploads/<path:filename>')
    def uploads(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    return app
