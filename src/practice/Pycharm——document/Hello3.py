# #字典名.keys返回所有键、字典名.values返回所有值、字典名.items返回所有键值对
# total=0
# for i in range(1,101):
#     total =total+i
# print(total)
print("请输入你需要求的平均值并按0结束")
i=input("你需要输入的值")
b=0
a=0
while i !="0":
    num = float(i)
    a+=num
    b+=1
    i = input("你需要输入的值")
if b==0:
    c=0
else:
    c=a/b
print("平均数为"+str(c))