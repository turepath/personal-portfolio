#BMI=体重/（身高**2）
user_weight=float(input("请输入您的体重（单位：Kg）："))
user_height=float(input("请输入您的身高（单位：m）："))
user_BMI=user_weight/(user_height)**2
print("您的BMI值为："+str(user_BMI))
#偏瘦：user_BMI<=18.5
#正常：18.5<user_BMI<=25
#偏胖：25<user_BMI<=30
#肥胖：user_BMI>30
if user_BMI <=18.5:
    print("此BMI值属于偏瘦范围")
elif 18.5<user_BMI<=30:
    print("此BMI值属于正常范围")
elif 25<user_BMI<=30:
    print("此BMI值属于偏胖范围")
else:
    print("肥胖")

#列表
shopping_list =[]
shopping_list.append("键盘")
shopping_list.append("键帽")#往列表添加元素
shopping_list.remove("键帽")#往列表删除元素
shopping_list.append("音响")
shopping_list.append("电竞椅")
shopping_list[1]="硬盘"#将列表第二个元素换为”硬盘“

print(shopping_list)
print(len(shopping_list))
print(shopping_list[0])

price=[799,1020,100,500]
max_price=max(price)#max
min_price=min(price)#min
sorted_price=sorted(price)#排序
print(max_price)
print(min_price)
print(sorted_price)