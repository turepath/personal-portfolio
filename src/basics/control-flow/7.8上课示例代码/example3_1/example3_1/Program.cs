using System;
namespace example3_1
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("请输入整数a的值：");//输出提示信息
            //定义一个int型变量a，用于接收用户输入的数据
            int a = int.Parse(Console.ReadLine());
            Console.WriteLine("请输入整数b的值：");//输出提示信息
            //定义一个int型变量b，用于接收用户输入的数据
            int b = int.Parse(Console.ReadLine());
            if (a > b)			//如果a大于b，则交换a、b的值
            {
                int temp = a;	//定义变量temp，并将a的值赋给temp
                a = b;			//将b的值赋给a
                b = temp;			//将temp的值赋给b
            }
            //输出变量a和b的值
            Console.WriteLine("a = {0}, b = {1}", a, b);
        }
    }
}
