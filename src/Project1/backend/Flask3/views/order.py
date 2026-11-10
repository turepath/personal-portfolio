from flask import Blueprint,session,render_template
#导入db.py中的连接池
import db 

#蓝图对象
ad=Blueprint("order",__name__)


@ad.route("/order/list")
def order_list():
    # # 从session中获取用户信息
    # user_info = session.get("user_info")
    # if not user_info:
    #     return redirect("/login")
    #print(user_info,type(user_info))
    #加拦截器后可以不需要了

    #根据用户角色1/2判断列出的MySQL数据库中的order表
    role=session.get("user_info")["role"]
    #print("role:",role)
    if role==2:
        #管理员角色，列出所有订单
        sql="select * from orderinfo"#orderinfo是MySQL数据库中的表名
        result=db.fetch_all(sql,())
    else:
        #普通用户角色，列出自己的订单
        sql="select * from orderinfo where user_id=%s"#orderinfo是MySQL数据库中的表名
        result=db.fetch_all(sql,(session.get("user_info")["id"],))
    print("order:",result)

    return render_template("order_list.html",orders=result)

@ad.route("/order/create")
def order_create():
   
    return render_template("order_create.html")

#删除订单
@ad.route("/order/delete/<int:order_id>")
def order_delete(order_id):
    
    return f"删除订单{order_id}"

