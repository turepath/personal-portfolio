using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace day4
{
    // class Phone
    //{
    //    private string 品牌= "HUAWEI";
    //    private string 型号 = "Mate60 Pro";
    //    private string 颜色;
    //    private int 内存;
    //    private int 存储内存;
    //    private int 价格;
    //    private string 优势= "卫星通话|超可靠玄武框架|全焦段超清影像";
        
    //    public string get品牌
    //    {
    //        get { return 品牌; }
    //    }

    //    public string get型号
    //    {
    //        get { return 型号; }
    //    }

    //    public string color
    //    {
    //        set { 颜色 = value; }
    //        get { return 颜色; }
    //    }

    //    public int memory
    //    {
    //        set { 内存 = value; }
    //        get { return 内存; }
    //    }

    //    public int storageMemory
    //    {
    //        set { 存储内存 = value; }
    //        get { return 存储内存; }
    //    }
    //    public int price
    //    {
    //        set { 价格 = value; }
    //        get { return 价格; }
    //    }
    //    public string get优势
    //    {
    //        get { return 优势; }
    //    }
    //}

    

    class ATM
    {
        static string 卡号 = "abc123456";
        static string 密码 = "88888888";
        static double total=0;
        public string 读取卡号;
        public string 读取密码;
        public int b=0;
        
        public int ReadAccount(string 读取卡号, string 读取密码)//读取卡号和密码
        {
            if(读取卡号==卡号&&读取密码==密码)
            {
                Console.WriteLine("登录成功，欢迎使用ATM");
                return 0;
            }
            else
            {
                Console.WriteLine("卡号或密码错误，请重新输入");
                return 1;
            }
            
        }
       
        public void ReadBalance()//查询余额
        {
            Console.WriteLine("当前余额为：{0}", total);
            
        }

        public void Deposit()//存款
        {
            Console.WriteLine("请输入存款金额：");
            total += double.Parse(Console.ReadLine());
            Console.WriteLine("存款成功，当前余额为：{0}", total);
            
        }

        public void Withdraw()//取款
        {
            Console.WriteLine("请输入取款金额：");
            double money = double.Parse(Console.ReadLine());
            if (money > total)
            {
                Console.WriteLine("余额不足，请重新输入");
                Console.WriteLine("当前余额为：{0}", total);
                
            }
            else
            {
                total -= money;
                Console.WriteLine("取款成功，当前余额为：{0}", total);
               
            }
        }

       
        public void exit()//退出
        {
            Console.WriteLine("欢迎下次使用ATM");
        }
         
        

    }


    internal class Program
    {
        static void Main(string[] args)
        {
           
            //Phone Mate = new Phone();

            //Mate.color = "雅川青";
            //Mate.memory = 12;
            //Mate.storageMemory = 1;
            //Mate.price = 7999;
       
             
            //Console.WriteLine("品牌：{0}\n 型号：{1}\n 颜色：{2}\n 内存：{3}GB\n 存储：{4}TB\n 价格：{5}\n 优势：{6}", Mate.get品牌, Mate.get型号, Mate.color, Mate.memory, Mate.storageMemory, Mate.price, Mate.get优势);
           

            //取款流程
            ATM a = new ATM();

            do
            {
                Console.WriteLine("请输入你的卡号");
                a.读取卡号 = Console.ReadLine();
                Console.WriteLine("请输入你的密码");
                a.读取密码 = Console.ReadLine();

            } while (a.ReadAccount(a.读取卡号, a.读取密码) != 0);

            bool isRunning = true; // 新增循环控制变量
            do
            {
                Console.WriteLine("1. 查询余额\n" + "2. 存款\n" + "3. 取款\n" + "4. 退出");
                int choice = int.Parse(Console.ReadLine());

                switch(choice)
                    {
                    case 1:
                        a.ReadBalance();
                        break;
                    case 2:
                        a.Deposit();
                        break;
                    case 3:
                        a.Withdraw();
                        break;
                    case 4:
                        a.exit();
                        isRunning = false; // 设置退出标志
                        break;
                    default:
                        Console.WriteLine("输入错误，请重新输入");
                        break;
                }


            } while (isRunning);
    }
    }
}
