using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace day5
{
     class Undergraduate: Student
    {
        public Undergraduate(int id, string name, string grade)
        {
            Id = id;
            Name = name;
            Grade = grade;
        }
        override public void Registration()
        {
            Console.WriteLine("本科生注册成功！");
            Console.WriteLine($"学号: {Id}");
            Console.WriteLine($"姓名: {Name}");
            Console.WriteLine($"班级: {Grade}");


        }
        override public void CancelRegistration()
        {
            Console.WriteLine($"本科生 {Name} 注销成功！");

        }
            
    }
}
