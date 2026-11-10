# f=open("E:\湖南农业大学\量化工程分析.txt","r",encoding="utf-8")
# print(f.read())
# f.close()

with open("D:\湖南农业大学\量化工程分析.txt","r",encoding="utf-8") as f:
    lines=f.readlines()
    for line in lines:
        print(line)
    #print(f.read())

with open(".\poem,txt","w",encoding="utf-8") as F:
    F.write("我欲乘风归去，\n又恐琼楼玉宇。\n高处不胜寒.\n")
with open(".\poem,txt","a",encoding="utf-8") as F:
    F.write("欺辱弄清影，\n何似在人间")