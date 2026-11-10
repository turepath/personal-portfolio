using System;
namespace example3_11
{
    class Program
    {
        static void Main(string[] args)
        {
            int n = 1;				//定义一个int型变量n
            int sum = 0;		//定义一个int型变量sum，用于保存求和结果
            while (true) 			//循环
            {
                sum += n;				//求和，将结果赋给sum
                if (sum > 1000)		//当sum大于1000时
                {
                    break;			//跳出循环
                }
                n += 1;				//变量n加1
            }
            //输出结果
            Console.WriteLine("使得1+2+3+…+n≤1000的最大整数n为" + (n - 1));
        }
    }
}
