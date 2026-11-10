using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace day5
{
    abstract class Student
    {
        public string Name { get; set; }
        public int Id { get; set; }
        public string Grade { get; set; } //班级

        
        abstract public void Registration();
        abstract public void CancelRegistration();
    }
}
