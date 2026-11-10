using System;
namespace example3_12
{
    class Program
    {
        static void Main(string[] args)
        {
            //当i小于等于100时执行循环
            for (int i = 1; i <= 100; i++)
            {
                if (i % 3 != 0)				//当i不能被3整除时
                {
                    continue;					//跳过本次循环
                }
                Console.Write(i + "\t");	//输出i的值
            }
        }
    }
}
