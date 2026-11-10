import requests
import json

# 测试登录接口
login_data = {
    'email': 'test@test.com',
    'password': 'CHANGE_ME'
}

headers = {
    'Content-Type': 'application/json',
    'Origin': 'http://localhost:5173'
}

print('Testing login...')
try:
    response = requests.post(
        'http://localhost:5000/api/auth/login',
        json=login_data,
        headers=headers,
        timeout=10
    )
    
    print(f'Status code: {response.status_code}')
    print(f'Response: {response.text}')
    
    if response.status_code == 200:
        print('Login successful!')
        data = response.json()
        print(f'Access token: {data.get("access_token", "N/A")[:50]}...')
    else:
        print('Login failed!')
        
except Exception as e:
    print(f'Error: {e}')

print('\nTesting /api/auth/me with no token...')
try:
    response = requests.get(
        'http://localhost:5000/api/auth/me',
        headers=headers,
        timeout=10
    )
    
    print(f'Status code: {response.status_code}')
    print(f'Response: {response.text}')
    
except Exception as e:
    print(f'Error: {e}')
