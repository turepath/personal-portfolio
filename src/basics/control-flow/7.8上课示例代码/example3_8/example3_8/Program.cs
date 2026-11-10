using System;
namespace example3_8
{
    class Program
    {
        static void Main(string[] args)
        {
            int i = 1;		//定义一个int型变量i，将其作为循环变量
            int sum = 0;		//定义一个int型变量sum，用于保存求和结果
            do
            {
                sum += i;		//求和，将结果赋给sum
                i += 1;		//循环变量i加1
            } while (i <= 50);		//当i小于等于50时执行循环
            //输出结果
            Console.WriteLine("1～50所有整数的和为" + sum);
        }
    }
}
