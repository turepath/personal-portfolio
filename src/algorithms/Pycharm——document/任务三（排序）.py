import random

###from ultralytics.data.converter import min_index


def paixu(list_int):
    for i in list_int:
        position1=list_int.index(i)
        len_list=len(list_int)

        # 错误示例
        # for j in list_int[position1 + 1:]:#无法找出最小元素
        #     position2=list_int.index(j)
        #     if j<=i:
        #         replace1=i
        #         for m in range(position2,position1,-1):
        #             list_int[m]=list_int[m-1]
        #         list_int[position1] = list_int[position1 + 1]
        #         list_int[position1+1]=replace1

        min_final = i
        min_index=position1
        if position1 != (len_list-1):
            for j in range(position1+1,len_list):
                if list_int[j]<min_final:
                    min_final=list_int[j]
                    min_index=j

        #优化
        #如果找到了更小的值，进行交换
        if min_index != position1:
            # 直接交换元素，不需要复杂的移动操作
            list_int[position1], list_int[min_index] = list_int[min_index], list_int[position1]

            #我的逻辑过于复杂
            # position2 = list_int.index(min_final)
            # replace1 = i
            # for m in range(position2, position1, -1):
            #     list_int[m] = list_int[m - 1]
            # list_int[position1] = list_int[position1 + 1]
            # list_int[position1 + 1] = replace1

    print(list_int)
list_int=[]
for i in range(100):
    list_int.append(random.randint(1,100))
paixu(list_int)
paixu([1,3,5,4,3,2,1])
