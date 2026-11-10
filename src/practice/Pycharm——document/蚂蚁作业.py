
#蚂蚁问题
import random
import copy
# Ant_numbers=[]
# Ant_numbers1=[]
class Ant(object) :
    nowID=0
    aliveIds=[]
    all_ants = []

    def __init__(self,lifeVal=None):
        if lifeVal==None:
            self.lifeVal=random.randint(1,100)
        else:
            self.lifeVal=lifeVal

        Ant.nowID+=1
        self.id=Ant.nowID
        Ant.aliveIds.append(Ant.nowID)
        Ant.all_ants.append(self)

    def show(self):
        print(f"蚂蚁的id为{self.id},生命值为{self.lifeVal}")

    def __str__(self):
        return f"蚂蚁的id为{self.id},生命值为{self.lifeVal}"

    def __repr__(self):
        # return "["+self.__str__()+"]"
        return f"Ant({self.lifeVal})"

    def harmed(self,val):
        if self.lifeVal<=0:
            print("蚂蚁已经死亡，此为无效伤害")
            return
        self.lifeVal-=val
        if self.lifeVal<=0:
            print("此蚂蚁受伤害后死亡")
            Ant.aliveIds.remove(self.id)

    @classmethod#指明下面方法为类方法
    def showAliveAnts(cls):
        print(f"总共诞生了{Ant.nowID},当前存活的蚂蚁数量为{len(Ant.aliveIds)}")
        print(Ant.aliveIds)

    def __del__(self):
        if self.lifeVal>=0:
            self.lifeVal=0
        # if self.id in Ant.aliveIds:
        #     Ant.aliveIds.remove(self.id)

#copy.deepcopy()
    @classmethod
    def Arrange(cls):
        sorted_ants = copy.deepcopy(Ant.all_ants)
        print(sorted_ants)
        sorted_ants.sort( key=lambda aAnt:aAnt.lifeVal)#排序
        print(sorted_ants) # 输出结果不是自己想要的
        # print("\n".join([str(e) for e in sorted_ants]))
        # print(*sorted_ants,sep="\n")
        return sorted_ants
        # for i in cls:
        #     Ant_numbers.append(i)
        # Ant_numbers1=copy.deepcopy(Ant_numbers.sort(key=Ant.aliveIds))

    def __lt__(self,other):
        if isinstance(other,Ant):
            if self.lifeVal<other.lifeVal:
                return True
        elif isinstance(other,int):
            if self.lifeVal<other:
                return True
        return  False

# a1=Ant(80)
# print(a1)
# # print(f"{a1=}")
# s=repr(a1)
# print(s,type(s))
# newAnt=eval(s) #evaluate 求值
# print(newAnt,type(newAnt))

a1=Ant(80)
a2=Ant(70)
a3=Ant()
Ant.showAliveAnts()
print(a3)
Ant.harmed(a2,80)
Ant.showAliveAnts()
Ant.Arrange()



# a=[1,2,3,4,"China",3.14]
# print(a)
# print(a[0],a[1],a[2],a[3],sep="-->")


# def aAddb(a,b):
#     return a+b
#
# print(aAddb(1,2))
# a=[1,2]


# d={'xm':'张三',"XH":2024001}
#
# def show(xh,xm):
#     print("学生信息：",xh,xm)
#
# show(xm=d['xm'],xh=d['XH'])
# show(**d)
