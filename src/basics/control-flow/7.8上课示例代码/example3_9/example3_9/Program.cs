using System;
namespace example3_9
{
    class Program
    {
        static void Main(string[] args)
        {
            int sum = 0;	//定义一个int型变量sum，用于保存求和结果
            for (int i = 1; i <= 50; i++)//当i小于等于50时执行循环
            {
                sum += i;		//求和，将结果赋给sum
            }
            //输出结果
            Console.WriteLine("1～50所有整数的和为" + sum);
        }
    }
}
