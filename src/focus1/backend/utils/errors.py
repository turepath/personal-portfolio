from flask import jsonify
from werkzeug.http import HTTP_STATUS_CODES

# Custom exception classes
class BadRequestError(Exception):
    def __init__(self, message):
        self.message = message
        self.status_code = 400

class UnauthorizedError(Exception):
    def __init__(self, message):
        self.message = message
        self.status_code = 401

class ForbiddenError(Exception):
    def __init__(self, message):
        self.message = message
        self.status_code = 403

class NotFoundError(Exception):
    def __init__(self, message):
        self.message = message
        self.status_code = 404

class ConflictError(Exception):
    def __init__(self, message):
        self.message = message
        self.status_code = 409

def error_response(status_code, message=None):
    """
    Create a JSON error response
    :param status_code: HTTP status code
    :param message: Error message
    :return: JSON response with error details
    """
    payload = {'error': HTTP_STATUS_CODES.get(status_code, 'Unknown error')}
    if message:
        payload['message'] = message
    response = jsonify(payload)
    response.status_code = status_code
    return response

def handle_bad_request(error):
    """Handle 400 Bad Request errors"""
    return error_response(400, str(error))

def handle_unauthorized(error):
    """Handle 401 Unauthorized errors"""
    return error_response(401, 'Unauthorized access')

def handle_forbidden(error):
    """Handle 403 Forbidden errors"""
    return error_response(403, 'Access forbidden')

def handle_not_found(error):
    """Handle 404 Not Found errors"""
    return error_response(404, 'Resource not found')

def handle_conflict(error):
    """Handle 409 Conflict errors"""
    return error_response(409, 'Resource conflict')

def handle_internal_server_error(error):
    """Handle 500 Internal Server errors"""
    return error_response(500, 'Internal server error')

def register_error_handlers(app):
    """
    Register error handlers to the Flask app
    :param app: Flask app instance
    """
    app.register_error_handler(400, handle_bad_request)
    app.register_error_handler(401, handle_unauthorized)
    app.register_error_handler(403, handle_forbidden)
    app.register_error_handler(404, handle_not_found)
    app.register_error_handler(409, handle_conflict)
    app.register_error_handler(500, handle_internal_server_error)
    
    # Register custom exception handlers
    app.register_error_handler(BadRequestError, lambda e: error_response(e.status_code, e.message))
    app.register_error_handler(UnauthorizedError, lambda e: error_response(e.status_code, e.message))
    app.register_error_handler(ForbiddenError, lambda e: error_response(e.status_code, e.message))
    app.register_error_handler(NotFoundError, lambda e: error_response(e.status_code, e.message))
    app.register_error_handler(ConflictError, lambda e: error_response(e.status_code, e.message))
