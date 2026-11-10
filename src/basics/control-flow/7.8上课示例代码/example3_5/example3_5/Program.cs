using System;
namespace example3_5
{
    class Program
    {
        /*static void Main(string[] args)
        {
            Console.WriteLine("请输入月份：");		//输出提示信息
            //定义一个int型变量month，用于接收用户输入的月份
            int month = int.Parse(Console.ReadLine());
            switch (month)
            {
                //当month的值为1时执行此分支，并终止switch语句
                case 1:
                    Console.WriteLine("该月有31天！"); break;
                //当month的值为2时执行此分支，并终止switch语句
                case 2:
                    Console.WriteLine("该月有28或29天！"); break;
                //当month的值为3时执行此分支，并终止switch语句
                case 3:
                    Console.WriteLine("该月有31天！"); break;
                //当month的值为4时执行此分支，并终止switch语句
                case 4:
                    Console.WriteLine("该月有30天！"); break;
                //当month的值为5时执行此分支，并终止switch语句
                case 5:
                    Console.WriteLine("该月有31天！"); break;
                //当month的值为6时执行此分支，并终止switch语句
                case 6:
                    Console.WriteLine("该月有30天！"); break;
                //当month的值为7时执行此分支，并终止switch语句
                case 7:
                    Console.WriteLine("该月有31天！"); break;
                //当month的值为8时执行此分支，并终止switch语句
                case 8:
                    Console.WriteLine("该月有31天！"); break;
                //当month的值为9时执行此分支，并终止switch语句
                case 9:
                    Console.WriteLine("该月有30天！"); break;
                //当month的值为10时执行此分支，并终止switch语句
                case 10:
                    Console.WriteLine("该月有31天！"); break;
                //当month的值为11时执行此分支，并终止switch语句
                case 11:
                    Console.WriteLine("该月有30天！"); break;
                //当month的值为12时执行此分支，并终止switch语句
                case 12:
                    Console.WriteLine("该月有31天！"); break;
                //如果上述情况都不符合，则提示错误，并终止switch语句
                default:
                    Console.WriteLine("输入错误！"); break;
            }
        }*/
        static void Main(string[] args)
        {
            Console.WriteLine("请输入月份：");        //输出提示信息
                                                //定义一个int型变量month，用于接收用户输入的月份
            int month = int.Parse(Console.ReadLine());
            switch (month)
            {
                /*当month的值为1、3、5、7、8、10、12中的任意一个时，输出“该月有31天！”，并终止switch语句*/
                case 1:
                case 3:
                case 5:
                case 7:
                case 8:
                case 10:
                case 12:
                    Console.WriteLine("该月有31天！"); break;
                /*当month的值为4、6、9、11中的任意一个时，输出“该月有30天！”，并终止switch语句*/
                case 4:
                case 6:
                case 9:
                case 11:
                    Console.WriteLine("该月有30天！"); break;
                /*当month的值为2时，输出“该月有28或29天！”，并终止switch语句*/
                case 2:
                    Console.WriteLine("该月有28或29天！"); break;
                //如果上述情况都不符合，则提示错误，并终止switch语句
                default:
                    Console.WriteLine("输入错误！"); break;
            }
        }

    }
}
