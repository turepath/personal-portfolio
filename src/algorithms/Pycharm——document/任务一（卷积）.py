# A=input()
# #print(type(A))
# A1=A.split(",")
# print(A1)
###from sympy import false


def check_format(a):#检查方阵格式
    a_len=len(a)
    for i in range(a_len):
        a_len1=len(a[i])
        if a_len1!=a_len:
            return False
    return True

def Convolution(a,b):

    a_len=len(a)
    b_len=len(b)
    if a_len>b_len:
        C=a
        a=b
        b=C
        # print(a,b)
    a_len = len(a)
    b_len = len(b)
    #转换位置

    c=[]#目标矩阵
    # c.append([] *b_len )
    for i in range(b_len):
        c1 = []
        for j in range(b_len):
            c1.append(0)
        c.append(c1)
    # print(a_len,b_len,c)

    if check_format(a) and check_format(b):
        print("请继续")
        for i in range(b_len):#遍历待卷积信号的行
            for i1 in range(b_len):#遍历待卷积信号的列
                for j in range(a_len):#遍历卷积核的行
                    for j1 in range(a_len):#遍历卷积和的列

                        total_1=i+j-1#处理行的中心位置*修正：计算对应输入矩阵的行位置
                        total_2=i1+j1-1#处理列的中心位置*修正：计算对应输入矩阵的列位置

                        if (total_1 >= 0 and total_1 < b_len and total_2 >= 0 and total_2 < b_len):
                            c[i][i1] += a[j][j1] * b[total_1][total_2]

                        # if i<3 :
                        #     if i1<3:
                        #         c[i][i1]+=a[j][j1]*b[i][i1]
                        #         print(c)

    else:
        print("方阵格式错误，请检查")

    print("卷积结果:")
    for row in c:
        print(row)

A=[[1,0,0],[0,1,0],[0,0,1]]#卷积核
B=[[1,2,3,4,5,6,7,8,9,0],[1,2,3,4,5,6,7,8,9,0],[1,2,3,4,5,6,7,8,9,0],[1,2,3,4,5,6,7,8,9,0],[1,2,3,4,5,6,7,8,9,0],[1,2,3,4,5,6,7,8,9,0],[1,2,3,4,5,6,7,8,9,0],[1,2,3,4,5,6,7,8,9,0],[1,2,3,4,5,6,7,8,9,0],[1,2,3,4,5,6,7,8,9,0]]#待卷积信号
Convolution(A,B)

#两个问题：1.实际应用中的卷积核需要翻转吗，为什么？2.此代码使用的是same卷积操作，实际应用中也是用的same卷积吗