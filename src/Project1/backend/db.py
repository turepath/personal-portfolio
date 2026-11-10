#MySQL数据库连接文件
import pymysql
from dbutils.pooled_db import PooledDB
#初始化连接池
pool = PooledDB(
    creator=pymysql,  # 使用pymysql作为数据库驱动
    maxconnections=10,  # 连接池最大连接数
    mincached=2,  # 连接池最小空闲连接数
    maxcached=5,  # 连接池最大空闲连接数
    maxshared=3,  # 连接池最大共享连接数
    blocking=True,  # 当连接池无连接时，是否阻塞等待
    maxusage=None,  # 每个连接最大使用次数
    setsession=[],  # 开始会话前执行的命令列表
    ping=0,  # 用ping命令检查连接是否可用
    host="localhost",
    user="root",
    password="CHANGE_ME",
    database="day21",
    charset="utf8mb4"
)

def fetch_one(sql,par):
    #从连接池获取连接并执行SQL语句查询用户名密码是否正确
    conn = pool.connection()
    cursor = conn.cursor()
    cursor.execute(sql, par)
    result = cursor.fetchone()
    cursor.close()
    conn.close()  # 将连接返回给连接池
    return result

# def fetch_all(sql,par):
#     #从连接池获取连接并执行SQL语句查询用户名密码是否正确
#     conn = pool.connection()
#     cursor = conn.cursor()
#     cursor.execute(sql, par)
#     result = cursor.fetchall()
#     cursor.close()
#     conn.close()  # 将连接返回给连接池
#     return result
def fetch_all(sql, par):
    conn = None
    cursor = None
    try:
        conn = pool.connection()
        cursor = conn.cursor()
        print(f"执行SQL: {sql}")
        print(f"参数: {par}")
        cursor.execute(sql, par)
        result = cursor.fetchall()
        print(f"查询结果: {result}")
        print(f"结果数量: {len(result)}")
        return result
    except Exception as e:
        print(f"数据库错误: {str(e)}")
        return []
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()