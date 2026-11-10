from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

def role_required(role):
    """
    Decorator to check if user has the required role
    Note: This is a placeholder - actual implementation needs role column in User model
    """
    def decorator(func):
        @wraps(func)
        @jwt_required()
        def wrapper(*args, **kwargs):
            # For now, just pass through - implement actual role check later
            return func(*args, **kwargs)
        return wrapper
    return decorator

def admin_required():
    """
    Decorator to check if user is admin
    """
    return role_required('admin')

def owner_required(model):
    """
    Decorator to check if current user is the owner of the resource
    """
    def decorator(func):
        @wraps(func)
        @jwt_required()
        def wrapper(*args, **kwargs):
            current_user_id = get_jwt_identity()
            # Get resource id from kwargs
            resource_id = kwargs.get('id') or kwargs.get('room_id')
            
            if not resource_id:
                return jsonify({'error': 'Resource ID not found'}), 400
            
            resource = model.query.get_or_404(resource_id)
            
            if hasattr(resource, 'owner_id'):
                if resource.owner_id != current_user_id:
                    return jsonify({'error': 'Unauthorized'}), 403
            elif hasattr(resource, 'user_id'):
                if resource.user_id != current_user_id:
                    return jsonify({'error': 'Unauthorized'}), 403
            
            # Add resource to kwargs for later use
            kwargs['resource'] = resource
            return func(*args, **kwargs)
        return wrapper
    return decorator
