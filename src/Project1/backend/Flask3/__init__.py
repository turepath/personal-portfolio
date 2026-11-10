from flask import Flask,request,redirect,session

#定义拦截器
def auth():
    if request.path.startswith("/static"):
        # 静态文件不拦截
        return 

    if request.path == "/login/":
        return 

    # 从session中获取用户信息
    user_info = session.get("user_info")
    if not user_info:
        return redirect("/login/")

def create_app():
    app = Flask(__name__)
    app.secret_key="CHANGE_ME"

    #注册蓝图
    from .views.account import ac
    app.register_blueprint(ac)
    from .views.order import ad
    app.register_blueprint(ad)
    
    #注册拦截器
    app.before_request(auth)
    
    return app