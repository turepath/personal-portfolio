using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace _7月14
{
    internal class Program
    {

        static double[] score = new double[6] ;
        static double[,] student = new double[4, 3];
        static string[] subject = new string[3] { "语文", "数学", "英语" };
        static void Main(string[] args)
        {
            //使用for循环
            //for (int i = 0; i < 6; i++) 
            //{
            //    Console.WriteLine("请输入第{0}位裁判的成绩，范围为0-100：\n", i+1);
            //    score[i] = int.Parse(Console.ReadLine());
            //}
            //for(int i = 0; i < 6; i++)
            //{
            //    Console.WriteLine("第{0}位裁判的成绩为：{1}\n", i+1, score[i]);
            //}

            //使用foreach循环
            //foreach (int i in score)
            //{
            //    Console.WriteLine("请输入第{0}位裁判的成绩，范围为0-100：\n", i +1);
            //    score[i] = double.Parse(Console.ReadLine());
            //}

            //foreach (int j in score)
            //{
            //    Console.WriteLine("第{0}位裁判的成绩为：{1}\n", j + 1, score[j]);
            //}

            //使用二维数组
            for (int i = 0; i < student.GetLength(0); i++)
            {
                for (int j = 0; j < student.GetLength(1); j++)
                {
                    Console.WriteLine("请输入第{0}位学生{1}的成绩，范围为0-100：", i + 1, subject[j]);
                    student[i, j] = double.Parse(Console.ReadLine());
                }
            }

            Console.WriteLine("\n序号  语文  数学  英语");
            for (int i = 0; i < student.GetLength(0); i++)
            {
                Console.Write($"{i + 1,3} ");//$作用是用{}里的值替换{}里的变量
                for (int j = 0; j < student.GetLength(1); j++)
                {

                    Console.Write($"{student[i, j],5}");
                }
                Console.WriteLine();
            }
        }
    }
}
