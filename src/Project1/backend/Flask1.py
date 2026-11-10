from flask import Flask,request,jsonify
import pymysql,dbutils
import os
app = Flask(__name__)#创建Flask对象

# 从数据库中查询单条记录
def fetch_one(sql,params):
    conn=pymysql.connect(host='localhost',user='root',password='CHANGE_ME',database='focus')
    cursor=conn.cursor()#创建游标对象
    cursor.execute(sql,params)#执行SQL语句
    data=cursor.fetchone()#获取查询结果的第一行
    cursor.close()
    conn.close()
    return data

# 从文件中获取用户字典
def get_user_dict():
    user_dict={}
    #读取db.txt文件中的每一行
    #with open(r'D:\Programming file\Focus_project\Project1\backend\db.txt',mode='r',encoding='utf-8') as f:
    with open(r'db.txt',mode='r',encoding='utf-8') as f:    
        lines=f.readlines()
    for line in lines:
        line=line.strip()
        if not line:
            continue
        token,name=line.split(',')
        user_dict[token] = name
    return user_dict


# / -> 执行index()
#一般URL和函数名一致
@app.route('/index',methods=['GET','POST'])
def index():
    age=request.args.get('age')
    pwd=request.args.get('pwd')
    #request.args.get()获取URL参数
    print(age,pwd)

    xx=request.form.get('xx')
    yy=request.form.get('yy')
    print(xx,yy)

    #request.json获取JSON参数
    #print(request.json)

    return jsonify({'status':True,'data':'123456'})
    #return "success"

@app.route('/hello')
def hello():
    return 'hello flask'

@app.route('/bill',methods=['GET','POST'])
def bill():
    '''
    请求的URL中需要带 /bill?token=……
    请求的数据格式要求：{“id”:“……”}
    '''
    token=request.args.get('token')
    if not token:
        return jsonify({"status":False,"error":"认证失败"})

    #读取db.txt文件中的每一行模拟验证
    user_dict=get_user_dict()
    if token not in user_dict:
        return jsonify({"status":False,"error":"认证失败"})

    return '认证成功'

#简单的链接MySQL数据库
@app.route('/mysql',methods=['POST'])
def mysql():
    #先从post请求中获取token参数（通过URL查询字符串传递）
    token=request.args.get('token')
    if not token:
        return jsonify({"status":False,"error":"请求数据格式错误"})
    #查询mysql数据库中表token认证是否存在
    sql='select * from test where token=%s'
    params=(token,)#注意：params是一个元组，即使只有一个参数，也需要在后面添加一个逗号
    data=fetch_one(sql,params)
    if not data:
        return jsonify({"status":False,"error":"认证失败"})
    
    return 'mysql认证成功'

#使用连接池优化MySQL数据库连接

if __name__ == '__main__':
    app.run()
