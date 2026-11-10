from flask import Blueprint,render_template,request,redirect,session
import pymysql
from dbutils.pooled_db import PooledDB
#导入db.py中的连接池
import db 

#蓝图对象
ac=Blueprint("account",__name__)

@ac.route("/login/",methods=["GET","POST"])
def login():
    if request.method=="GET":
        return render_template("login.html")
    
    role=request.form.get("role")
    mobile=request.form.get("mobile")
    password=request.form.get("password")
    #print(role,mobile,password)
    
    #去数据库进行校验
    #从连接池获取连接并执行SQL语句查询用户名密码是否正确
    sql = "select * from userinfo where role=%s and mobile=%s and password=%s"
    result = db.fetch_one(sql, (role, mobile, password))
    print("account:",result)

    if result:
        #登录成功，将用户信息存储到session中
        session["user_info"]={
            "id":result[0],
            "mobile":result[1],
            "password":result[2],
            "name":result[3],
            "role":result[4],
        }

        return redirect("/order/list")
    else:
        return render_template("login.html",error="用户名或密码错误")
    
    return "ok"        

@ac.route("/user")
def user():
    return render_template("user.html")
