using System;
namespace example3_2
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("请输入您的年龄：");	//输出提示信息
            //定义一个int型变量age，用于接收用户输入的年龄
            int age = int.Parse(Console.ReadLine());
            if (age < 18)						//判断年龄是否小于18岁
            {
                //当年龄小于18岁时，输出“您还未成年！”
                Console.WriteLine("您还未成年！");
            }
            else
            {
                //当年龄大于等于18岁时，输出“您已成年！”
                Console.WriteLine("您已成年！");
            }
        }
    }
}
