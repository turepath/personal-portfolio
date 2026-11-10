# class Staff :
#     def __init__(self,name,id):
#         self.name=name
#         self.id=id
#
#     def print_info(self):
#         print(f"姓名{name}；工号{id}")
#
# class FulltimeStaff (Staff):
#     super().__init__(name,id)
#     def monthly_salary(self):
#         return self.monthly_salary
#
# zhangsan = FulltimeStaff("zhansan","1001",6000)
# zhangsan.print_info()
# print(zhangsnaj,monthly_salary())#错误思路
# class ParttimeStaff(Staff):
#     def daily_salary(self):
#         return  self.daily_salary*self.work_days


class Staff:
    def __init__(self, name, id):
        self.name = name
        self.id = id

    def print_info(self):
        print(f"姓名：{self.name}；工号：{self.id}")  # 修正点1：添加self.

class FulltimeStaff(Staff):
    def __init__(self, name, id, monthly_salary):  # 修正点2：定义子类构造方法
        super().__init__(name, id)                # 调用父类构造方法
        self.monthly_salary = monthly_salary      # 添加子类特有属性

    def get_monthly_salary(self):                 # 修正点3：方法名更规范
        return self.monthly_salary

# 实例化测试
zhangsan = FulltimeStaff("zhangsan", "1001", 6000)  # 修正点4：参数数量正确
zhangsan.print_info()
print(zhangsan.get_monthly_salary())              # 修正点5：修正拼写和方法名

