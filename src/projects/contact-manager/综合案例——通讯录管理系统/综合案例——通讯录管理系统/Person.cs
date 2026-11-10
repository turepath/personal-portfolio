using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace 综合案例__通讯录管理系统
{
    enum pGender             //定义枚举类型pGender，表示性别
    {
        男, 女
    }
    internal class Person
    {
        internal string name { get; set; }
        internal int id { get; set; }
        internal string phone_number { get; set; }
        internal pGender gender { get; set; }//gender性别

        internal static string FilePath		//定义文件路径属性
        {
            get { return "./通讯录.txt"; }
        }
        public void Show()					//显示联系人信息

        {
            Console.Write(id + "\t");
            Console.Write(name + "\t");
            Console.Write(gender + "\t");
            Console.Write(phone_number + "\n");
        }

    }
}
