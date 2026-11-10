using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace 综合案例__通讯录管理系统
{
    internal class Search:Person
    {
      
        
            //根据用户输入的搜索选项创建相应对象并调用相应的方法
            void Process(int choice)
            {
                switch (choice)
                {
                    case 1:                         //按姓名搜索
                        Console.Write("请输入联系人姓名：");
                        string name = Console.ReadLine().Trim();
                        SearchName(name);
                        break;
                    case 2:                     //按手机号码搜索
                        Console.Write("请输入手机号码：");
                        string phone = Console.ReadLine().Trim();
                        SearchPhone(phone);
                        break;
                    case 0:                         //退出
                        break;
                    default:
                        Console.WriteLine("您的输入有误，请重新输入！");
                        int inChoice = int.Parse(Console.ReadLine());
                        Process(inChoice);
                        break;
                }
            }

            
            
            void SearchName(string name)            //按姓名搜索
            {
                ArrayList persons = new ArrayList();
                //将匹配的联系人添加到persons中
                foreach (Person item in allItems)
                {
                    if (item.name == name)
                    {
                        persons.Add(item);

                    }
                }
                if (persons.Count == 0)
                {
                    Console.WriteLine("对不起，没有您要查找的联系人！");
                }
                Console.WriteLine("查找到{0}个姓名为{1}的联系人：", persons.Count, name);
                //显示查找到的联系人信息
                foreach (Person item in persons)
                {
                    item.Show();
                }
                //返回上一级菜单
                Search searchItem = new Search();
                searchItem.SearchAll();
            }
            

        void SearchPhone(string phone)		//按手机号码搜索
        {
            ArrayList persons = new ArrayList();
            //将匹配的联系人添加到persons中
            foreach (Person item in allItems)
            {
                //判断联系人的手机号码是否包含指定号码phone
                if (item.phone_number.Contains(phone))
                {
                    persons.Add(item);
                }
            }
            if (persons.Count == 0)
            {
                Console.WriteLine("对不起，没有您要查找的联系人！");
            }
            else
            {
                Console.WriteLine("查找到{0}个手机号码为{1}的联系人：", persons.Count, phone);
                //显示查找到的联系人信息
                foreach (Person item in persons)
                {
                    item.Show();

                }
            }
            //返回上一级菜单
            Search searchItem = new Search();
            searchItem.SearchAll();
        }
        //创建ArrayList类对象allItems
        ArrayList allItems = new ArrayList();
        public void SearchAll()
        {
            Show printItem = new Show();
            allItems = printItem.ReadAll(); //读取所有联系人信息
            Console.WriteLine("--------------------------");
            Console.WriteLine("1．按姓名搜索");
            Console.WriteLine("2．按手机号码搜索");
            Console.WriteLine("0．退出");
            Console.WriteLine("--------------------------");
            Console.Write("请输入您的选项：");
            int pChoice = int.Parse(Console.ReadLine());
            Process(pChoice);
        }

    }

}

