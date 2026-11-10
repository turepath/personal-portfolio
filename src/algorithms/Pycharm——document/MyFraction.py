import math
class MyFraction:
    fraction=str("")
    # molecule=None
    # Denominator=int(0)

    def __init__(self,fraction,molecule=None,denominator=None,fraction_list=None):
        MyFraction.fraction=fraction
        MyFraction.molecule=molecule
        MyFraction.Denominator=denominator
        if  fraction!="":
            self.fraction_list=fraction.split("/")
        elif fraction=="":
            fraction_list=None

    def brief(self,fraction_list):
        if self.fraction!="":
            a=self.fraction_list[0]
            b=self.fraction_list[1]
            gcd_value=math.gcd(a,b)
            a1=a//gcd_value
            b1=b//gcd_value
            self.fraction=f"{a1}/{b1}"
            return self
        elif self.fraction=="":
            gcd_vlue=math.gcd(self.molecule,self.denominator)
            self.molecule=self.molecule//gcd_vlue
            self.Denominator=self.denominator//gcd_vlue
            return self
        print(self)

a=MyFraction("6/9")
a.brief()




'''
class Mystring(str):
        pass

class index(Mystring):
    sub=0
    end=0
    def index(self,sub,end):
        indexlist = []
        while sub<=end:
            a=self.index("卓工",sub)
            indexlist.append(a)
            end=self.index("卓工",sub)
            sub+=1
        print(indexlist)

s=Mystring("卓工1 卓工2 卓工3 卓工4")
Mystring.index()
'''




