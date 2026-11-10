from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from models.user import User

def hash_password(password):
    """
    Hash a password using werkzeug.security
    :param password: Plain text password
    :return: Hashed password
    """
    return generate_password_hash(password)

def verify_password(hashed_password, password):
    """
    Verify a password against a hashed password
    :param hashed_password: Hashed password
    :param password: Plain text password to verify
    :return: Boolean indicating if password matches
    """
    return check_password_hash(hashed_password, password)

def generate_token(user_id):
    """
    Generate a JWT token for a user
    :param user_id: User ID
    :return: JWT access token
    """
    return create_access_token(identity=user_id)

def get_user_by_username(username):
    """
    Get a user by username
    :param username: Username to search for
    :return: User object or None
    """
    return User.query.filter_by(username=username).first()

def get_user_by_id(user_id):
    """
    Get a user by ID
    :param user_id: User ID to search for
    :return: User object or None
    """
    return User.query.get(user_id)
