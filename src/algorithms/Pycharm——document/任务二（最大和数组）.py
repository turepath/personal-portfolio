#给定一个整数数组 nums ，找到一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。
def find_max(a):
    max_now=a[0]
    max_final=a[0]
    start=0
    end=0
    #end1=0
    max_list=[]


# 1.前加后>前（后>0)
# 2.前加后<后（后>0且后大于前）
# 3.前加后=前（后等于0）
# 4.前加后<前（后小于0）

    for i in range(1,len(a)):
        if a[i]>max_now+a[i]:
            max_now=a[i]
            start=i
        else:
            max_now=a[i]+max_now


        if max_now>=max_final:#算0在内
            max_final=max_now
            end=i
        # if max_now==max_final:
        #     end=end1=i

    max_list =a[start:end+1]
    print(f"最大连续和为{max_final}，从{start}开始索引，到{end}结束，为数组{max_list}")
    #print(list_max)

A=[1,0,-1,2,-1,6]
B=[1,0,0,0]
C=[-1,0,1,0,-1,2,1]
find_max(A)
find_max(B)
find_max(C)
