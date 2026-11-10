import math
#-x**2-2x+3=0
a=-1
b=-2
c=3
print((-b + math.sqrt( b ** 2 - 4 * a * c))/(2*a))#sqrt是平方根函数
print((-b - math.sqrt( b ** 2 - 4 * a * c))/(2*a))
#函数类型：str\int\float\bool\NoneType
s='Hello world!'
#对字符串求长度
print(len(s))
#通过索引获取单个字符
print(s[0])
#布尔类型
b1=True
b2=False
#空值类型
n=None
#type函数
print(type(s))
print(type(b1))
print(type(n))
print(type(1.5))
#BMI=体重/（身高**2）
user_weight=float(input("请输入您的体重（单位：Kg）："))
user_height=float(input("请输入您的身高（单位：m）："))
user_BMI=user_weight/(user_height)**2
print("您的BMI值为："+str(user_BMI))
mood_index=int(input("对象今天的心情指数是："))
if mood_index >=60:
    print("恭喜，今晚应该可以打游戏，去吧皮卡丘！")
else:
    print("为了自个儿小名，还是别打了")
