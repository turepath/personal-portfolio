import unittest
import time
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db, socketio
from models.user import User
from models.room import Room
from models.message import Message

class TestWebSocket(unittest.TestCase):
    def setUp(self):
        # Create a test app with in-memory database
        self.app = create_app()
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app.config['TESTING'] = True
        self.app.config['JWT_SECRET_KEY'] = 'test-secret-key'

        self.client = self.app.test_client()

        # Create all tables
        with self.app.app_context():
            db.create_all()

            # Create test users
            self.user1 = User(username='testuser1')
            self.user1.set_password('testpassword1')
            self.user2 = User(username='testuser2')
            self.user2.set_password('testpassword2')
            
            db.session.add(self.user1)
            db.session.add(self.user2)
            db.session.commit()
            
            # Create a test room
            self.room = Room(
                name='Test Room',
                owner_id=self.user1.id,
                type='1:many',
                max_participants=10
            )
            db.session.add(self.room)
            db.session.commit()
            
            # Save room ID for use in tests
            self.room_id = str(self.room.id)

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def get_token(self, username, password):
        """Get a JWT token for testing"""
        response = self.client.post('/api/auth/login', json={
            'username': username,
            'password': password
        })
        return response.get_json()['access_token']

    def test_websocket_connection(self):
        """Test WebSocket connection"""
        # Create a test client for WebSocket
        test_client = socketio.test_client(self.app, flask_test_client=self.client)
        
        # Check if connected
        self.assertTrue(test_client.is_connected())
        
        # Disconnect
        test_client.disconnect()
        self.assertFalse(test_client.is_connected())

    def test_join_room(self):
        """Test joining a room"""
        # Get token for user1
        token = self.get_token('testuser1', 'testpassword1')
        
        # Create a test client for WebSocket with token
        test_client = socketio.test_client(self.app, 
                                         headers={'Authorization': f'Bearer {token}'}, 
                                         flask_test_client=self.client)
        
        # Join room with string room_id
        test_client.emit('join_room', {'room_id': self.room_id})
        
        # Wait for events
        time.sleep(0.5)
        
        # Disconnect
        test_client.disconnect()

    def test_send_message(self):
        """Test sending a message"""
        # Get token for user1
        token = self.get_token('testuser1', 'testpassword1')
        
        # Create a test client for WebSocket with token
        test_client = socketio.test_client(self.app, 
                                         headers={'Authorization': f'Bearer {token}'}, 
                                         flask_test_client=self.client)
        
        # Join room with string room_id
        test_client.emit('join_room', {'room_id': self.room_id})
        time.sleep(0.5)
        
        # Send message with string room_id
        test_message = 'Hello, this is a test message!'
        test_client.emit('send_message', {
            'room_id': self.room_id,
            'message': test_message
        })
        
        # Wait for events
        time.sleep(0.5)
        
        # Disconnect
        test_client.disconnect()

    def test_user_joined_event(self):
        """Test user joined event"""
        # Get tokens for both users
        token1 = self.get_token('testuser1', 'testpassword1')
        token2 = self.get_token('testuser2', 'testpassword2')
        
        # Create test clients for WebSocket with tokens
        client1 = socketio.test_client(self.app, 
                                      headers={'Authorization': f'Bearer {token1}'}, 
                                      flask_test_client=self.client)
        client2 = socketio.test_client(self.app, 
                                      headers={'Authorization': f'Bearer {token2}'}, 
                                      flask_test_client=self.client)
        
        # User1 joins room with string room_id
        client1.emit('join_room', {'room_id': self.room_id})
        time.sleep(0.5)
        
        # User2 joins room with string room_id
        client2.emit('join_room', {'room_id': self.room_id})
        time.sleep(0.5)
        
        # Disconnect
        client1.disconnect()
        client2.disconnect()

    def test_user_left_event(self):
        """Test user left event"""
        # Get tokens for both users
        token1 = self.get_token('testuser1', 'testpassword1')
        token2 = self.get_token('testuser2', 'testpassword2')
        
        # Create test clients for WebSocket with tokens
        client1 = socketio.test_client(self.app, 
                                      headers={'Authorization': f'Bearer {token1}'}, 
                                      flask_test_client=self.client)
        client2 = socketio.test_client(self.app, 
                                      headers={'Authorization': f'Bearer {token2}'}, 
                                      flask_test_client=self.client)
        
        # Both users join room with string room_id
        client1.emit('join_room', {'room_id': self.room_id})
        client2.emit('join_room', {'room_id': self.room_id})
        time.sleep(0.5)
        
        # Clear received events
        client1.get_received()
        client2.get_received()
        
        # User2 leaves room with string room_id
        client2.emit('leave_room', {'room_id': self.room_id})
        time.sleep(0.5)
        
        # Disconnect
        client1.disconnect()


if __name__ == '__main__':
    unittest.main()