using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace day2
{
    //enum teacher
    //{
    //    领导,主任,讲师,教授,院长//定义枚举类型
    //}

    struct Student
    {
        public string name;
        public int sex;
        public int age;
        //float score;
        public double height;
        public double weight;
        //定义结构体类型
    }
    
       
           
     class Program
    {
        static void Main(string[] args)
        {
            //Console.WriteLine("主任" + ":" + (int)teacher.主任);
            //Console.WriteLine(teacher.领导 + ":" + (int)teacher.领导);
            //Console.WriteLine(teacher.讲师 + ":" + (int)teacher.讲师);
            //Console.WriteLine(teacher.教授 + ":" + (int)teacher.教授);
            //Console.WriteLine(teacher.院长 + ":" + (int)teacher.院长);


            Student stu;//定义结构类型变量
                        //是stu这个变量里面的成员变量赋值
                        //Student.name = "张三";
                        //stu.sex = '男';
                        //stu.age = 23;
                        //stu.score = 60f;
                        ////讲stu中的变量内容显示出来
                        //Console.WriteLine("姓名：" + stu.name);
                        //Console.WriteLine("性别：" + stu.sex);
                        //Console.WriteLine("年龄：" + stu.age);
                        //Console.WriteLine("成绩：" + stu.score);

            //Console.WriteLine("请输入学生姓名：");
            //stu.name = Console.ReadLine();
            //Console.WriteLine("请输入学生性别：(1boy 2girl)");
            //stu.sex = Console.ReadKey().KeyChar;
            //Console.WriteLine("请输入学生年龄：");
            //stu.age = int.Parse(Console.ReadLine());
            //Console.WriteLine("请输入学生身高：(cm)");
            //stu.height = double.Parse(Console.ReadLine());
            //Console.WriteLine("请输入学生体重：(kg)");
            //stu.weight = double.Parse(Console.ReadLine());

            //Console.WriteLine("学生信息如下：" + "\n"+"姓名："+stu.name+"\n"+"性别："+stu.sex+"\n"+"年龄："+stu.age+"\n"+"身高："+stu.height+"cm"+"\n"+"体重："+stu.weight+"kg");

            ////球任务
            //Console.WriteLine("请输入球的半径：");
            //double r = double.Parse(Console.ReadLine());
            //double V = 4 / 3 * Math.PI * r * r;
            //Console.WriteLine("计算出球的体积为：" + V);

            //下午部分
            //Console.WriteLine("请输入a的值");
            //int a = int.Parse(Console.ReadLine());
            //Console.WriteLine("请输入b的值");
            //int b = int.Parse(Console.ReadLine());

            //if(a>b)
            //{
            //    int temp = a;
            //    a = b;
            //    b = temp;
            //}
            //Console.WriteLine("a的值为：" + a);
            //Console.WriteLine("b的值为：" + b);

            //Console.WriteLine("请输入用户年龄：");
            //int age = int.Parse(Console.ReadLine());
            //if(age<=18)
            //{
            //    Console.WriteLine("您还未成年，不能和夏炜城玩");
            //}
            //else
            //{
            //    Console.WriteLine("您已经成年了，可以玩夏炜城了");
            //}



            //int a=0;
            //while (a < 1)
            //{
            //    Console.WriteLine("请输入用户成绩(1-100):");
            //    double score = double.Parse(Console.ReadLine());
            //    if (score >= 90&&score<=100)
            //    {
            //        Console.WriteLine("\n" + "秀儿");
            //        a++;
            //    }
            //    else if (score >= 80&&score<90)
            //    {
            //        Console.WriteLine("\n" + "良好的秀儿");
            //        a++;
            //    }
            //    else if (score >= 70&&score<80)
            //    {
            //        Console.WriteLine("\n" + "般般子");
            //        a++;
            //    }
            //    else if (score >= 60&&score<70)
            //    {
            //        Console.WriteLine("\n" + "菜");
            //        a++;
            //    }
            //    else if (score < 60&&score>=0)
            //    {
            //        Console.WriteLine("\n" + "菜比");
            //        a++;
            //    }
            //    else
            //    {
            //        Console.WriteLine("\n" + "查无此数，请重新输入一个1到100的数字");
            //    }
            int a = 0;
            while (a < 1)
            {
                Console.WriteLine("请输入你选择的停车场（P1【1】/其它【2】）：");
                int choice = int.Parse(Console.ReadLine());
                Console.WriteLine("请输入你的停车时长（h）：");
                int time = int.Parse(Console.ReadLine());
                Console.WriteLine("请输入你的车子型号（小车【1】/其它【2】）：");
                int car = int.Parse(Console.ReadLine());
                switch (choice)
                {
                    case 1:
                        switch (car)
                        {
                            case 1:
                                Console.WriteLine("请缴费：" + time * 10);
                                break;
                            case 2:
                                Console.WriteLine("请缴费：" + time * 15);
                                break;
                        }
                        a++;
                        break;
                    case 2:
                        switch (car)
                        {
                            case 1:
                                Console.WriteLine("请缴费：" + time * 100);
                                break;
                            case 2:
                                Console.WriteLine("请缴费：" + time * 150);
                                break;
                        }
                        a++;
                        break;
                    default:
                        Console.WriteLine("输入有误，请重新输入");
                        break;
                }
            }
                //猜拳头游戏
                int b = 0;
                while (b < 1)
                {
                    Console.WriteLine("请输入a的猜拳（剪刀石头）：");
                string guess1 = (Console.ReadLine());
                Console.WriteLine("请输入b的猜拳（剪刀石头）：");
                string guess2 = (Console.ReadLine());
                    switch (guess1)
                    {
                        case "剪刀":
                            {
                                switch (guess2)
                                {
                                    case "石头":
                                        Console.WriteLine("b赢了");
                                        break;
                                    case "剪刀":
                                        Console.WriteLine("平局");
                                        break;
                                    case "布":
                                        Console.WriteLine("a赢了");
                                        break;
                                }
                            }
                            b++;
                            break;
                        case "石头":
                            {
                                switch (guess2)
                                {
                                    case "石头":
                                        Console.WriteLine("平局");
                                        break;
                                    case "剪刀":
                                        Console.WriteLine("a赢了");
                                        break;
                                    case "布":
                                        Console.WriteLine("b赢了");
                                        break;
                                }
                            }
                            b++;
                            break;
                        case "布":
                            {
                                switch (guess2)
                                {
                                    case "石头":
                                        Console.WriteLine("a赢了");
                                        break;
                                    case "剪刀":
                                        Console.WriteLine("b赢了");
                                        break;
                                    case "布":
                                        Console.WriteLine("平局");
                                        break;
                                }
                            }
                            b++;
                            break;
                        default:
                            Console.WriteLine("输入有误，请重新输入");
                            break;
                    }
            }
         }
     }
 }
