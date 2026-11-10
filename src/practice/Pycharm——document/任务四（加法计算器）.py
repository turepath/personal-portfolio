
# A=str(input())
# B=str(input())
A="11223344556677889900"
B="11223344556677889900"
A_list=[]
B_list=[]
#for a in A[-1:0:-1]:#无法遍历到最后一位
for a in A[-1::-1]:
    A_list.append(a)
#for b in B[-1:0:-1]:#无法遍历到最后一位
for b in B[::-1]:
    B_list.append(b)
#print(A_list,B_list)

int_LA=[int(i) for i in A_list]
int_LB=[int(i) for i in B_list]
#print(int_LA,int_LB)

def list_sim(n,m):
    if len(n)==len(m):
        long_list=len(n)
        total_list = []
        for L in range(long_list):
            total_list.append(n[L]+m[L])

        str_total=[str(i) for i in total_list]
        #print(str_total)
        for i in str_total:
            i_index=str_total.index(i)
            if len(i)==2:
                str_total[i_index]=i[1]
                str_total[i_index+1]=int(str_total[i_index+1])
                str_total[i_index+1]=str_total[i_index+1]+1
                str_total[i_index+1]=str(str_total[i_index+1])

        final_list=[]
        for i in str_total[::-1]:
            final_list.append(i)
        # final_list.append(i for i in str_total[::-1])
        # list(final_list)
        #print(final_list)
        sum_number="".join(final_list)
        sum_number=int(sum_number)
        print(sum_number)

    else:
        print("格式错误")

list_sim(int_LA,int_LB)

