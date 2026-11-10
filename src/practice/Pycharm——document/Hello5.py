# class CuteCat:
#     def __init__(self,cat_name,cat_age,cat_color):
#         self.name=cat_name
#         self.age=cat_age
#         self.color=cat_color
#
# cat1=CuteCat("Jojo",2,"橙色")
# print(f"小猫{cat1.name}的年龄是{cat1.age}岁，花色是{cat1.color}")
#
class Student :
    def __init__(self,student_name,student_number):
        self.name=student_name
        self.number=student_number
        self.grades={"语文":0,"数学":0,"英语":0}

    def set_grade(self,course,grade):
        if course in self.grades:
            self.grades[course]=grade

    def print_grades(self):
        print(f"学生{self.name}(学号:{self.number})")
        for course in self.grades:
            print(f"{course}:{self.grades[course]}分")

chen=Student("小陈","10026")
chen.set_grade("语文",92)
chen.set_grade("数学",94)
chen.print_grades()
# zeng=Student("小曾","10086")
# print(chen.name)
# zeng.set_grade("数学",95)
# print(zeng.grades)