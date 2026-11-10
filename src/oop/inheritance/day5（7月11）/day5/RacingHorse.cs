using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using day5;


namespace day5
{
    class RacingHorse:Horse
    {
        public int Ability { get; set; }//定义该🐎能力属性
        public string Grade
        {
            get
            {
                if (Ability >= 90)
                {
                    return "上等马";
                }
                if (Ability >= 80)
                {
                    return "中等马";
                }
                else
                {
                    return "下等马";
                }
            }

        }
        public RacingHorse(string host, string color, BloodType blood, int ability) : base(host, color, blood)
        {
            Ability = ability;
        }
        public void Compete(RacingHorse otherHorse)
        {
            Console.WriteLine("齐威王方马匹的信息\n主人：{0}\n颜色：{1}\n血统类型：{2}\n能力值：{3}\n等级{4}",otherHorse.Host, otherHorse.Color, otherHorse.BloodType, otherHorse.Ability, otherHorse.Grade);
            Console.WriteLine("田忌方马匹的信息\n主人：{0}\n颜色：{1}\n血统类型：{2}\n能力值：{3}\n等级{4}", Host, Color,BloodType,Ability, Grade);
            if (Ability > otherHorse.Ability)
            {
                Console.WriteLine("田忌方马匹胜出！");
            }
            else if (Ability < otherHorse.Ability)
            {
                Console.WriteLine("齐威王方马匹胜出！");
            }
            else
            {
                Console.WriteLine("平局！");
            }
        }
    }
}
