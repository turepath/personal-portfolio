from app import create_app, socketio

app = create_app()

if __name__ == '__main__':
    # For development: Use Flask's built-in server
    # app.run(debug=True)
    
    # For WebSocket support: Use socketio.run()
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
