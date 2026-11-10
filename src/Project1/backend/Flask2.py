from flask import Flask,request,jsonify
import pymysql,dbutils,uuid,redis,json
import os
app = Flask(__name__)#创建Flask对象
'''
我未安装redis数据库，因此此部分仅供参考
'''
#创建URL为task的路由，用于获取redis队列
@app.route('/task',methods=['POST'])
def task():
    ordered_string=request.json.get("ordered_string")
    if not ordered_string:
        return jsonify({"status":False,"error":"请求数据格式错误"})
    #生成任务ID
    tid=str(uuid.uuid4())
    #1、放入到redis队列中
    task_dict={"tid":tid,"data":ordered_string}
    REDIS_CONN_PARAMS={
        "host":"localhost",
        "port":6379,
        "db":0,
        "password":"CHANGE_ME"
    }
    redis_conn=redis.Redis(**REDIS_CONN_PARAMS)
    redis_conn.lpush("task_list",json.dumps(task_dict))


    return jsonify({"status":True,"tid":tid,"message":"正在处理，预计1分钟内完成"})

    '''
    通常传入列表后需要worker处理，以下模拟新建的worker处理文件。
    def run():
        while True:
            # 从Redis队列中获取任务
            task_json = redis_conn.brpop("task_list", timeout=10)
            return data[1].decode("utf-8")
    ……
    '''