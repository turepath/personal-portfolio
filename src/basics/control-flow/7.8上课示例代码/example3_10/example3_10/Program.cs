using System;
namespace example3_10
{
    class Program
    {
        static void Main(string[] args)
        {
            //外循环控制鸡的数量，循环变量x从0到35
            for (int x = 0; x <= 35; x++)
            {
                //内循环控兔的数量，循环变量y从0到35
                for (int y = 0; y <= 35; y++)
                {
                    //当变量x和y同时满足以下两个表达式时，输出结果
                    if (x + y == 35 && 2 * x + 4 * y == 94)
                    {
                        Console.WriteLine("笼中有{0}只鸡、{1}只兔。", x, y);
                    }
                }
            }
        }
    }
}
