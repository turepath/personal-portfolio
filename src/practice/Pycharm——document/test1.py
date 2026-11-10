#问题 D: 爱你一万年
# a=int(input())
# for i in range(10000):
#     print(f"爱你在公元{a+i}年，这是爱你的第{i+1}年。")

#问题 C: 不同姓氏个数
# a=str(input())
# a_list=a.split()
# # print(a_list)
# b=[]
# for i in a_list:
#     b.append(i[0])
# # print(b)
#
# # c=[]
# # for i in b:
# #     if i not in c :
# #         c.append(i)
# c=list(set(b))
# # print(c)
#
# print(len(c))

#问题 B: 菱形字符图案（空心有框版）
'''
a=str(input())
b=int(input())
Height_bottom=(b*4-1)*a
one_print=(b*4-1)//2-1
two_print1=(b*4-1)//2

print(Height_bottom)
print(a+one_print*" "+a+one_print*" "+a)#","号占一个空格

for i in range(1,b):
    print(a+(two_print1-i*2-1)*" "+a+(4*i-1)*" "+a+(two_print1-i*2-1)*" "+a)
for i in range(b-2,0,-1):
    print(a+(two_print1-i*2-1)*" "+a+(4*i-1)*" "+a+(two_print1-i*2-1)*" "+a)

print(a + one_print * " " + a + one_print * " " + a)
print(Height_bottom)
'''

#问题 E: 零上温度平均值（输入行数不定版）


#问题 F: A+B（火星版）


#问题 H: 黄金分割比（指定精度版）
'''
test=int(input())
test_1=0
gold_proportion=(1+5**(1/2))/2
total=[]
while test_1<test:
    total.append(int(input()))
    test_1+=1
print(total)
for i in total:
    gold_proportion_1=round(gold_proportion,i-1)
    print(f"{gold_proportion:.{i-1}f}")
    # print(format(gold_proportion, f".{i}"))
    # print(round(gold_proportion,i-1))
'''

#问题 I: 试卷知识点覆盖情况

"""
任务2：逢7跳过游戏（拍七令）
应用问题：在聚会游戏“拍七令”中，大家轮流报数，如果遇到7的倍数不能喊出来而是要拍手。编写程序，模拟从1报到n的过程，遇到7的倍数输出“跳过”，其他数字正常输出。
"""
'''
for_number=int(input("请输入你要遍历的数："))
for i in range(1,for_number+1):
    if i%7==0:
        print("跳过")
    else:
        print(i)
'''

"""
任务3：蜗牛爬井问题
应用问题：一只蜗牛要爬上n米高的井口。它白天向上爬3米，到了晚上休息时会滑下2米。编写程序，计算蜗牛需要多少天才能爬出井口（假设井深大于3米）。
"""
'''
in_number=int(input("请输入井口的高度："))
day=0
while in_number>0:
    in_number-=3
    day+=1
    if in_number<=0:
        break
    in_number+=2
    day+=1
print(day)
'''

"""
任务4：猜数字游戏（限次版）
应用问题：编写一个猜数字游戏。程序内部设定一个目标数字（例如66），用户最多有5次猜测机会。

如果猜对了提示“恭喜猜中！”并结束游戏；

如果猜错提示大小；例如，目标55，猜测60，提示“猜大了！”

如果5次都没猜中，提示“游戏结束，目标数字是X”。
"""
'''
import random as rd
target=rd.randint(1,100)
for i in range(5):
    guess=int(input(f"请输入第{i+1}次你要猜测的整数："))
    if target==guess:
        print(f"恭喜你，猜对了，数字就是{target}")
        break
    elif target>guess:
        print("猜小了！")
    else:
        print("猜大了！")
print("游戏结束，目标数字是{}".format(target))
'''

"""
任务5：班级成绩筛选器
应用问题：老师需要快速找出班级中不及格的同学。已知一组成绩存放在列表中，编写程序遍历该列表，将所有不及格（小于60分）的成绩找出来，并统计不及格的人数。
"""

scores=[85,55,92,48,76,59,61]
count=0
for i in scores:
  if i <60:
    print(i)
    count+=1
print(f"不及格人数为：{count}")


