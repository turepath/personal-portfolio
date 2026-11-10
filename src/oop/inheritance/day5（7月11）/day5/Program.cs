using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace day5
{

   
   
    internal class Program
    {
        static void Main(string[] args)
        {
            //创建6个RacingHorse类对象
            RacingHorse horse1 = new RacingHorse("田忌","白色",BloodType.HOT, 95);
            RacingHorse horse2 = new RacingHorse("田忌","棕色",BloodType.WARM,85);
            RacingHorse horse3 = new RacingHorse("田忌","黑色",BloodType.COLD,75);
            RacingHorse horse4 = new RacingHorse("齐威王","棕色",BloodType.HOT,96);
            RacingHorse horse5 = new RacingHorse("齐威王","棕色",BloodType.WARM,86);
            RacingHorse horse6 = new RacingHorse("齐威王","白色",BloodType.COLD,76);

            //模拟赛马过程
            horse1.Compete(horse5);
            horse2.Compete(horse6);
            horse3.Compete(horse4);

            // 创建本科生对象并测试注册和注销
            Undergraduate undergraduate = new Undergraduate(20240101, "张三", "1班");
            undergraduate.Registration();
            undergraduate.CancelRegistration();

            

            // 创建研究生对象并测试注册和注销
            Graduate graduate = new Graduate(20240110, "李四", "3班");
            graduate.Registration();
            graduate.CancelRegistration();

        }
    }
}
