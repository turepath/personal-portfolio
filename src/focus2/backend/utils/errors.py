from flask import jsonify

def register_error_handlers(app):
    """注册错误处理器"""
    
    @app.errorhandler(400)
    def bad_request(error):
        """处理400错误"""
        return jsonify({'error': 'Bad request'}), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        """处理401错误"""
        return jsonify({'error': 'Unauthorized'}), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        """处理403错误"""
        return jsonify({'error': 'Forbidden'}), 403
    
    @app.errorhandler(404)
    def not_found(error):
        """处理404错误"""
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        """处理405错误"""
        return jsonify({'error': 'Method not allowed'}), 405
    
    @app.errorhandler(500)
    def internal_server_error(error):
        """处理500错误"""
        return jsonify({'error': 'Internal server error'}), 500
    
    @app.errorhandler(502)
    def bad_gateway(error):
        """处理502错误"""
        return jsonify({'error': 'Bad gateway'}), 502
    
    @app.errorhandler(503)
    def service_unavailable(error):
        """处理503错误"""
        return jsonify({'error': 'Service unavailable'}), 503
    
    @app.errorhandler(504)
    def gateway_timeout(error):
        """处理504错误"""
        return jsonify({'error': 'Gateway timeout'}), 504
