//Using 调用的库 
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace class1//第一级：命名空间
{
    //作业1：输入一名学生5门课程的成绩，求总分和平均分
    //作业2：输入圆的半径，求圆的周长和面积
    //作业3：定义三种水果的单价，计算购买水果的费用，费用分为非会员价格（原价）和会员价格（8折），分别计算会员价格和非会员价格

    //作业：
    class Homework
    {
        static double chinese;
        static double math;
        static double english;
        static double physics;
        static double 化学;
        static double total;
        static string name;
        public static void RunHomework1()
        {
            //作业1：输入一名学生5门课程的成绩，求总分和平均分
            Console.WriteLine("请输入学生姓名:");
            name = Console.ReadLine();
            Console.WriteLine("请输入语文成绩:");
            chinese = double.Parse(Console.ReadLine());
            Console.WriteLine("请输入数学成绩:");
            math = double.Parse(Console.ReadLine());
            Console.WriteLine("请输入英语成绩:");
            english = double.Parse(Console.ReadLine());
            Console.WriteLine("请输入物理成绩:");
            physics = double.Parse(Console.ReadLine());
            Console.WriteLine("请输入化学成绩:");
            化学 = double.Parse(Console.ReadLine());
            total = chinese + math + english + physics + 化学;
            Console.WriteLine("总分：" + total);
            double average = total / 5;
            Console.WriteLine("平均分：" + average);
        }

        public static void RunHomework2()
        {
            //作业2：输入圆的半径，求圆的周长和面积
            Console.WriteLine("请输入圆的半径:");
            double radius = double.Parse(Console.ReadLine());
            double perimeter = 2 * Math.PI * radius;
            double area = Math.PI * radius * radius;
            Console.WriteLine("周长：" + perimeter);
            Console.WriteLine("面积：" + area);
        }

        static double applePrice = 1.5;
        static double bananaPrice = 0.8;
        static double orangePrice = 1.2;
        public static void RunHomework3()
        {
            //作业3：定义三种水果的单价，计算购买水果的费用，费用分为非会员价格（原价）和会员价格（8折），分别计算会员价格和非会员价格
           
            Console.WriteLine("请输入购买的苹果数量:");
            int appleNum = int.Parse(Console.ReadLine());
            Console.WriteLine("请输入购买的香蕉数量:");
            int bananaNum = int.Parse(Console.ReadLine());
            Console.WriteLine("请输入购买的橘子数量:");
            int orangeNum = int.Parse(Console.ReadLine());
            double appleCost = appleNum * applePrice;
            double bananaCost = bananaNum * bananaPrice;
            double orangeCost = orangeNum * orangePrice;
            double totalCost = appleCost + bananaCost + orangeCost;
            Console.WriteLine("非会员价格：");
            Console.WriteLine("苹果：" + appleCost);
            Console.WriteLine("香蕉：" + bananaCost);
            Console.WriteLine("橘子：" + orangeCost);
            Console.WriteLine("总价格："+totalCost);
            Console.WriteLine("会员价格：");
            Console.WriteLine("苹果：" + appleCost * 0.8);
            Console.WriteLine("香蕉：" + bananaCost * 0.8);
            Console.WriteLine("橘子：" + orangeCost * 0.8);
            Console.WriteLine("总价格：" + totalCost * 0.8);

        }

    }
    class Program//第二级：类
    {
        static void Main(string[] args)//第三级：方法
        {

            Homework.RunHomework1();
            Homework.RunHomework2();
            Homework.RunHomework3();
            /*
            Console.WriteLine("Hello, World!");//第四级：语句
            //read的使用
            int x=Console.Read();
            Console.WriteLine(x);
            Console.ReadLine();//等待用户输入
            */


            /*
            //输入一个x和y的值，然后计算x和y的和
            Console.WriteLine("请输入x的值:");
            int x = int.Parse(Console.ReadLine());
            Console.WriteLine("请输入y的值:");
            int y = int.Parse(Console.ReadLine());
            int sum = x + y;
            Console.WriteLine("x+y的值为：" + sum);
            */


            //C#常用到的类型
            //int 整型  doule  浮点型(带小数点，64位精度，小数点后面有17位有效数字）
            //bool 布尔型（true/false）
            //char 字符型（单个字符）
            //string 字符串型（一串字符）
            //object 对象型（可以存放任何类型的值）
            //dynamic 动态类型（可以存放任何类型的值，类似于object）
            //byte 字节型（8位无符号整数）
            //short 短整型（16位有符号整数）
            //long 长整型（64位有符号整数）
            //float 浮点型（32位单精度浮点数）
            //decimal 十进制类型（128位有符号十进制数）
            //DateTime 日期时间类型（日期和时间）
            //TimeSpan 时间跨度类型（两个日期和时间之间的差值）
            //Guid 全局唯一标识符类型（128位值）
            //Array 数组类型（一组相同类型的值的集合）
            //List 列表类型（可变大小的数组）
            //Dictionary 字典类型（键值对的集合）
            //Tuple 元组类型（一组不同类型的值的集合）

            }
       }

  
    

}
