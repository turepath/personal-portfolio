"""
b=int(input())
b1=0
a= str(input())
a1=a.split()
for a2 in a1:
    while b1<b:
     print(f"{a2}")
     b1+=1
b1=0
while b1<b:
    print(a)
    b1+=1


one_choice=int(input())
b=str(input())
second_choice=b.split()
#print(second_choice)
if one_choice == 1:
    if int(second_choice[0])==1:
        print("pass")
    else:
        print("wait")
elif one_choice== -1:
    if int(second_choice[1])==1:
        print("pass")
    else:
        print("wait")
elif one_choice== 2:
    if int(second_choice[1])==1:
        print("pass")
    else:
        print("wait")
elif one_choice== -2:
    if int(second_choice[2])==1:
        print("pass")
    else:
        print("wait")
else:
    print("0")


a=int(input())
if 0<a<=59:
    print("fail")
elif 59<a<=69:
    print("pass")
elif 69<a<=79:
    print("medium")
elif 79<a<=89:
    print("good")
elif 89<a<=100:
    print("excellent")
else:
    print("error")
"""
from typing import final

# in_put=input()
#
# in_put1=in_put.strip("{")
# in_put2=(in_put1.strip("}"))
# in_put3=(in_put2.strip("("))
# in_put4=(in_put3.strip(")"))
# in_put5=(in_put4.strip("["))
# rein_put=(in_put5.strip("]"))
# # def format_in_put(in_put1):
# #     rein_put=in_put1.strip("{"or"}"or"("or")"or"["or"]")
#     # rein_put=(in_put1.strip("}"))
#     # rein_put=(in_put1.strip("("))
#     # rein_put=(in_put1.strip(")"))
#     # rein_put=(in_put1.strip("["))
#     # rein_put=(in_put1.strip("]"))
#  #   return rein_put
# #format_in_put(in_put)
# # in_final=format_in_put(in_put).split(",")
# in_final=rein_put.split(",")
# #print(in_final)
# a=int(in_final[0])
# b=int(in_final[1])
# c=0
# if b<60:
#     c=b*85-700
# elif 60<=b<=120:
#     c=b*85
# elif b>120:
#     c=120*85+(b-120)*85*1.15
# print(f"{a}号职工{c}元")

# k=int(input())
# print((k-1)*" "+"*")
# for i in range(1,k):
#     print((k-i-1)*" "+"*"+(i*2-1)*" "+"*")
# for i in range(k-2,0,-1):
#     print((k-i-1)*" "+"*"+(i*2-1)*" "+"*")
# print((k-1)*" "+"*")

"""
k=int(input())

def divide(total_fish):
    remain_fish=(k-1)*(total_fish-1)/k#remain_fish>=4
    return  divide(remain_fish)

total_fish=(total_fish-1)*(k-1)/k
divide()
"""

# Building=str(input())
# B_list=Building.split()
# # print(B_list)
# Floor=int(input())
# Room=int(input())
# for i in B_list:
#     for n in range(Floor):
#         for m in range(Room):
#             if m+1 <10:
#                 print("".join([i,str(n+1),"0",str(m+1)]),end=" ")
#
#             else:
#                 print("".join([i,str(n+1),str(m+1)]),end=" ")
#         print()
#     print()
"""
n=int(input())
n1=0
nb_list=[]
nb_list1=[]
nb_list3=[]
while n1<n:
    number=str(input())
    nb_list1=number.split()
    nb_list2=[int(i) for i in nb_list1]
    nb_list3.append(nb_list2)
    # a1=int(nb_list[0])
    # a2=int(nb_list[1])
    # for a in nb_list:
    #     int(a)
    # for b in nb_list:
    #     # print(nb_list)
    #     b1=int(b)
    n1+=1
#print(nb_list3)
for a1 in nb_list3:
    for a in range(a1[0], a1[1] + 1):
        # for c in range(a):
        # c=a
        for c in range(a1[0],a+1):
            # X=c*b
            if (c)*a<10:
                print(f"{c}*{a}={c * a}", end="  ")
            else:
                print(f"{c}*{a}={c  * a}", end=" ")
        print()
    print()
"""
# #问题 I: 分式数列之和
# import math
# number_i=int(input())
# i_test=0
# total_list=[]
# while i_test<number_i:
#     a=int(input())
#     b1 = []
#     b2 = []
#     n_terms = int((a + 1) // 2)
#     for a_test in range(1,n_terms+1):
#         b1.append(a_test*2-1)
#         b2.append(a_test*2+1)
#     # print(*b1,*"")
#     # print(*b2,*"")
#     '''
#     b11=[]
#     for b_test in b1:
#         c1=b2[b1.index(b_test)]
#         c2=b_test
#         for c_test in b2:
#             c2*=c_test
#         b11.append(int(c2/c1))
#         # print(b11)
#     '''
#     b11 = []
#     for b_test in b1:
#         c1 = b2[b1.index(b_test)]
#         c2 = b_test
#         for c_test in b2:
#             c2 *= c_test
#         # 使用整数除法
#         b11.append(c2 // c1)
#     molecule=0
#     for m in b11:
#         molecule+=m
#     denominator=1
#     for d in b2:
#         denominator*=d
#         # print(denominator)
#     '''
#     final_test=1
#     while final_test!=0:
#         if molecule%2==0 and denominator%2==0:
#             molecule/=2
#             denominator/=2
#         elif molecule%3==0 and denominator%3==0:
#             molecule /= 3
#             denominator /= 3
#         else :
#             final_test=0
#             break
#     int(molecule)
#     int(denominator)
#     # print(f"{molecule}/{denominator}")
#     '''
#     # 使用math.gcd进行完整约分
#     gcd_value = math.gcd(molecule, denominator)#math.gcd(a, b) 是 Python 中 math 模块提供的一个函数，用于计算两个整数的最大公约数
#     molecule = molecule // gcd_value
#     denominator = denominator // gcd_value
#
#     total_list.append(f"{molecule}/{denominator}")
#     i_test+=1
# # print(*total_list,end="\n")
# print("\n".join(total_list))

#问题 J: 十进制小数转二进制
#问题 K: 高精度小数的简单运算

#问题 L: 素性测试（基础版V2）
# a=int(input())
#  while final_test!=0:
# if a%2==0 or a%3==0:
#     print("n是素数")
# else:
#     print(f"{a}是合数")
data_to_send = bytes([0,1,2])
print("data_to_send:",data_to_send)
