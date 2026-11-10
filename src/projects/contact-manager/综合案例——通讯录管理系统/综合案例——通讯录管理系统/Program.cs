using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace 综合案例__通讯录管理系统
{
    internal class Program
    {
        static void ProcessMenu(int choice)
        {
            switch (choice)
            {
                case 0:				//退出
                    break;
                case 1:				//显示所有联系人
                    Show show = new Show();
                    show.ShowAllInfo();
                    break;
                case 2:				//添加联系人
                    Add add = new Add();
                    add.Add_person();
                    break;
                case 3:				//搜索联系人
                    Search search = new Search();
                    search.SearchAll();
                    break;
                case 4:				//编辑联系人
                    Editor editor = new Editor();
                    editor.Modify();
                    break;
                case 5:				//删除联系人
                    Delete delete = new Delete();
                    delete.delete();
                    break;
                default:
                    Console.WriteLine("输入错误的操作选项！");
                    break;
            }
        }

        static void Main(string[] args)
        { 

        
            void ShowMenu()             //显示主菜单界面
            {
                Console.WriteLine("欢迎使用个人通讯录管理系统");
                Console.WriteLine("--------------------------");
                Console.WriteLine("主菜单");
                Console.WriteLine("1．显示所有联系人");
                Console.WriteLine("2．添加联系人");
                Console.WriteLine("3．搜索联系人");
                Console.WriteLine("4．编辑联系人");
                Console.WriteLine("5．删除联系人");
                Console.WriteLine("0．退出");
                Console.WriteLine("--------------------------");
                Console.Write("请输入您的操作选项：");
            }
            
        



            try
            {
                ShowMenu();
                int pChoice = int.Parse(Console.ReadLine());
                if (pChoice >= 0 && pChoice <= 5)
                {
                    ProcessMenu(pChoice);
                }
                else
                {
                    Console.WriteLine("输入错误的操作选项！");
                }



            }
            catch
            {
                Console.WriteLine("输入无效的操作选项！");

            }
            
            //根据用户输入的操作选项创建相应对象并调用相应的方法










        }
    }
}
