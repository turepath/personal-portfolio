import logging
import os
from logging.handlers import RotatingFileHandler

def setup_logger(app):
    """
    Set up logging for the Flask app
    :param app: Flask app instance
    """
    # Create logs directory if it doesn't exist
    if not os.path.exists('logs'):
        os.mkdir('logs')
    
    # Set log level based on environment
    if app.config['DEBUG']:
        log_level = logging.DEBUG
    else:
        log_level = logging.INFO
    
    # Configure app logger
    app.logger.setLevel(log_level)
    
    # Create rotating file handler
    file_handler = RotatingFileHandler(
        'logs/app.log',
        maxBytes=1024 * 1024 * 10,  # 10MB
        backupCount=10
    )
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(log_level)
    
    # Add handlers to app logger
    app.logger.addHandler(file_handler)
    app.logger.info('App initialized')
    
    return app.logger
