import unittest
from app import create_app, db
from models.user import User
from models.post import Post

class TestAPI(unittest.TestCase):
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

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def get_token(self, username, password):
        """Get a JWT token for testing"""
        response = self.client.post('/auth/login', json={
            'username': username,
            'password': password
        })
        return response.get_json()['access_token']

    def test_register_user(self):
        """Test user registration"""
        response = self.client.post('/auth/register', json={
            'username': 'newuser',
            'password': 'CHANGE_ME'
        })
        self.assertEqual(response.status_code, 201)

    def test_login(self):
        """Test user login"""
        response = self.client.post('/auth/login', json={
            'username': 'testuser1',
            'password': 'CHANGE_ME'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access_token', response.get_json())

    def test_get_rooms(self):
        """Test getting rooms with authentication"""
        token = self.get_token('testuser1', 'testpassword1')
        response = self.client.get('/api/rooms', headers={
            'Authorization': f'Bearer {token}'
        })
        self.assertEqual(response.status_code, 200)

    def test_create_room(self):
        """Test creating a room"""
        token = self.get_token('testuser1', 'testpassword1')
        response = self.client.post('/api/rooms', headers={
            'Authorization': f'Bearer {token}'
        }, json={'name': 'Test Room'})
        self.assertEqual(response.status_code, 201)

    # Post-related tests
    def test_create_post(self):
        """Test creating a post"""
        token = self.get_token('testuser1', 'testpassword1')
        response = self.client.post('/api/posts', headers={
            'Authorization': f'Bearer {token}'
        }, json={
            'content': 'Test post content',
            'category': 'sharing',
            'tags': ['test', 'api'],
            'images': [],
            'videos': []
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn('id', response.get_json())
        self.assertEqual(response.get_json()['content'], 'Test post content')

    def test_get_posts(self):
        """Test getting posts list"""
        # First create a post
        token = self.get_token('testuser1', 'testpassword1')
        self.client.post('/api/posts', headers={
            'Authorization': f'Bearer {token}'
        }, json={
            'content': 'Test post content',
            'category': 'sharing',
            'tags': ['test', 'api'],
            'images': [],
            'videos': []
        })
        
        # Then get posts
        response = self.client.get('/api/posts', headers={
            'Authorization': f'Bearer {token}'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('items', response.get_json())
        self.assertGreaterEqual(len(response.get_json()['items']), 1)

    def test_get_post(self):
        """Test getting a single post"""
        token = self.get_token('testuser1', 'testpassword1')
        
        # Create a post
        create_response = self.client.post('/api/posts', headers={
            'Authorization': f'Bearer {token}'
        }, json={
            'content': 'Test post content',
            'category': 'sharing',
            'tags': ['test', 'api'],
            'images': [],
            'videos': []
        })
        post_id = create_response.get_json()['id']
        
        # Get the post
        response = self.client.get(f'/api/posts/{post_id}', headers={
            'Authorization': f'Bearer {token}'
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['id'], post_id)
        self.assertEqual(response.get_json()['content'], 'Test post content')

    def test_update_post(self):
        """Test updating a post - only author can update"""
        token1 = self.get_token('testuser1', 'testpassword1')
        token2 = self.get_token('testuser2', 'testpassword2')
        
        # Create a post with user1
        create_response = self.client.post('/api/posts', headers={
            'Authorization': f'Bearer {token1}'
        }, json={
            'content': 'Original post content',
            'category': 'sharing',
            'tags': ['test', 'api'],
            'images': [],
            'videos': []
        })
        post_id = create_response.get_json()['id']
        
        # Try to update with user2 (should fail)
        update_response1 = self.client.put(f'/api/posts/{post_id}', headers={
            'Authorization': f'Bearer {token2}'
        }, json={
            'content': 'Updated by user2'  # This should fail
        })
        self.assertEqual(update_response1.status_code, 403)  # Unauthorized
        
        # Update with user1 (should succeed)
        update_response2 = self.client.put(f'/api/posts/{post_id}', headers={
            'Authorization': f'Bearer {token1}'
        }, json={
            'content': 'Updated by user1'
        })
        self.assertEqual(update_response2.status_code, 200)
        self.assertEqual(update_response2.get_json()['content'], 'Updated by user1')

    def test_delete_post(self):
        """Test deleting a post - only author can delete"""
        token1 = self.get_token('testuser1', 'testpassword1')
        token2 = self.get_token('testuser2', 'testpassword2')
        
        # Create a post with user1
        create_response = self.client.post('/api/posts', headers={
            'Authorization': f'Bearer {token1}'
        }, json={
            'content': 'Post to be deleted',
            'category': 'sharing',
            'tags': ['test', 'api'],
            'images': [],
            'videos': []
        })
        post_id = create_response.get_json()['id']
        
        # Try to delete with user2 (should fail)
        delete_response1 = self.client.delete(f'/api/posts/{post_id}', headers={
            'Authorization': f'Bearer {token2}'
        })
        self.assertEqual(delete_response1.status_code, 403)  # Unauthorized
        
        # Delete with user1 (should succeed)
        delete_response2 = self.client.delete(f'/api/posts/{post_id}', headers={
            'Authorization': f'Bearer {token1}'
        })
        self.assertEqual(delete_response2.status_code, 200)
        
        # Try to get the deleted post (should fail)
        get_response = self.client.get(f'/api/posts/{post_id}', headers={
            'Authorization': f'Bearer {token1}'
        })
        self.assertEqual(get_response.status_code, 404)  # Not found

    def test_post_like(self):
        """Test liking a post"""
        token = self.get_token('testuser1', 'testpassword1')
        
        # Create a post
        create_response = self.client.post('/api/posts', headers={
            'Authorization': f'Bearer {token}'
        }, json={
            'content': 'Post to be liked',
            'category': 'sharing',
            'tags': ['test', 'api'],
            'images': [],
            'videos': []
        })
        post_id = create_response.get_json()['id']
        
        # Like the post
        like_response = self.client.post(f'/api/posts/{post_id}/like', headers={
            'Authorization': f'Bearer {token}'
        })
        self.assertEqual(like_response.status_code, 200)
        self.assertGreaterEqual(like_response.get_json()['likes'], 1)


if __name__ == '__main__':
    unittest.main()
