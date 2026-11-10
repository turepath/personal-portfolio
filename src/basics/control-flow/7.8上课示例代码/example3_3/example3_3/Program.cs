using System;
namespace example3_3
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("请输入您的成绩：");	//输出提示信息
            //定义一个float型变量pScore，用于接收用户输入的成绩
            float pScore = float.Parse(Console.ReadLine());
            string ret = "";		//定义一个string型变量ret
            if (pScore < 60)		//当成绩小于60分时
            {
                ret = "不及格";		//为变量ret赋“不及格”
            }
            else if (pScore < 70)	//当成绩大于等于60分且小于70分时
            {
                ret = "及格";			//为变量ret赋“及格”
            }
            else if (pScore < 80)	//当成绩大于等于70分且小于80分时
            {
                ret = "中";			//为变量ret赋“中”
            }
            else if (pScore < 90)	//当成绩大于等于80分且小于90分时
            {
                ret = "良";			//为变量ret赋“良”
            }
            else						//当以上条件都不符合时
            {
                ret = "优";			//为变量ret赋“优”
            }
            //输出最终结果
            Console.WriteLine("您最终的成绩为" + ret + "！");
        }
    }
}
