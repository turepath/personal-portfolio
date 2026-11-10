import requests
import json

# 基础URL
BASE_URL = "http://localhost:5000/api"

def register_user():
    """注册测试用户"""
    url = f"{BASE_URL}/auth/register"
    data = {
        "username": "testuser",
        "password": "CHANGE_ME"
    }
    response = requests.post(url, json=data)
    print(f"注册用户响应: {response.status_code}")
    if response.status_code == 201:
        print(f"注册成功: {response.json()}")
    else:
        print(f"注册失败: {response.text}")
    return response

def login_user():
    """登录获取token"""
    url = f"{BASE_URL}/auth/login"
    data = {
        "username": "testuser",
        "password": "CHANGE_ME"
    }
    response = requests.post(url, json=data)
    print(f"登录响应: {response.status_code}")
    if response.status_code == 200:
        token = response.json().get("access_token")
        print(f"登录成功，token: {token}")
        return token
    else:
        print(f"登录失败: {response.text}")
        return None

def create_post(token):
    """创建帖子"""
    url = f"{BASE_URL}/posts"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    data = {
        "content": "Test post content",
        "category": "sharing",
        "tags": ["test", "api"],
        "images": [],
        "videos": []
    }
    response = requests.post(url, json=data, headers=headers)
    print(f"创建帖子响应: {response.status_code}")
    if response.status_code == 201:
        post_id = response.json().get("id")
        print(f"创建帖子成功: {response.json()}")
        return post_id
    else:
        print(f"创建帖子失败: {response.text}")
        return None

def get_posts(token):
    """获取帖子列表"""
    url = f"{BASE_URL}/posts"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    response = requests.get(url, headers=headers)
    print(f"获取帖子列表响应: {response.status_code}")
    if response.status_code == 200:
        print(f"获取帖子列表成功: {response.json()}")
    else:
        print(f"获取帖子列表失败: {response.text}")
    return response

def get_post(token, post_id):
    """获取帖子详情"""
    url = f"{BASE_URL}/posts/{post_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    response = requests.get(url, headers=headers)
    print(f"获取帖子详情响应: {response.status_code}")
    if response.status_code == 200:
        print(f"获取帖子详情成功: {response.json()}")
    else:
        print(f"获取帖子详情失败: {response.text}")
    return response

def update_post(token, post_id):
    """更新帖子"""
    url = f"{BASE_URL}/posts/{post_id}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    data = {
        "content": "Updated test post content",
        "tags": ["test", "api", "updated"]
    }
    response = requests.put(url, json=data, headers=headers)
    print(f"更新帖子响应: {response.status_code}")
    if response.status_code == 200:
        print(f"更新帖子成功: {response.json()}")
    else:
        print(f"更新帖子失败: {response.text}")
    return response

def delete_post(token, post_id):
    """删除帖子"""
    url = f"{BASE_URL}/posts/{post_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    response = requests.delete(url, headers=headers)
    print(f"删除帖子响应: {response.status_code}")
    if response.status_code == 200:
        print(f"删除帖子成功: {response.json()}")
    else:
        print(f"删除帖子失败: {response.text}")
    return response

def like_post(token, post_id):
    """点赞帖子"""
    url = f"{BASE_URL}/posts/{post_id}/like"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers, json={})
    print(f"点赞帖子响应: {response.status_code}")
    if response.status_code == 200:
        print(f"点赞帖子成功: {response.json()}")
    else:
        print(f"点赞帖子失败: {response.text}")
    return response

# 主测试流程
if __name__ == "__main__":
    print("=== API测试开始 ===")
    
    # 注册用户
    register_user()
    
    # 登录获取token
    token = login_user()
    
    if token:
        # 创建帖子
        post_id = create_post(token)
        
        if post_id:
            # 获取帖子列表
            get_posts(token)
            
            # 获取帖子详情
            get_post(token, post_id)
            
            # 点赞帖子
            like_post(token, post_id)
            
            # 更新帖子
            update_post(token, post_id)
            
            # 删除帖子
            delete_post(token, post_id)
        
        # 再次获取帖子列表，确认帖子已删除
        get_posts(token)
    
    print("=== API测试结束 ===")
