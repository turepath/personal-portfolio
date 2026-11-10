using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace day5
{
    internal class Graduate: Student
    {
        public Graduate(int id, string name, string grade)
        {
            Id = id;
            Name = name;
            Grade = grade;
        }
        public override void Registration()
        {
            Console.WriteLine("研究生注册，注册成功！");
            Console.WriteLine($"学号: {Id}");
            Console.WriteLine($"姓名: {Name}");
            Console.WriteLine($"班级: {Grade}");
        }
        public override void CancelRegistration()
        {
            Console.WriteLine($"研究生 {Name} 注销成功！");
        }
    }
}
