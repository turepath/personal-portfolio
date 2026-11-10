using System;
namespace example3_6
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("请输入您的成绩：");	//输出提示信息
            //定义一个float型变量pScore，用于接收用户输入的成绩
            float pScore = float.Parse(Console.ReadLine());
            string ret = "";		//定义一个string型变量ret
            if (pScore < 0 || pScore > 100)//当输入的成绩不合理时
            {
                Console.WriteLine("无效成绩！"); //输出“无效成绩！”
            }
            else
            {
                //将float型转换为int型，并计算所输入成绩十位上的数字
                switch ((int)pScore / 10)
                {
                    //当数字为6时，为变量ret赋“及格”，并终止switch语句
                    case 6:
                        ret = "及格"; break;
                    //当数字为7时，为变量ret赋“中”，并终止switch语句
                    case 7:
                        ret = "中"; break;
                    //当数字为8时，为变量ret赋“良”，并终止switch语句
                    case 8:
                        ret = "良"; break;
                    //当数字为9或10时，为变量ret赋“优”，并终止switch语句
                    case 9:
                    case 10:
                        ret = "优"; break;
                    /*如果上述情况都不符合，则为变量ret赋“不及格”，并终止switch语句*/
                    default:
                        ret = "不及格"; break;
                }
                //输出最终结果
                Console.WriteLine("您最终的成绩为" + ret + "！");
            }
        }
    }
}
