using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace 综合案例__通讯录管理系统
{
    internal class Delete:Person
    {
        ArrayList allItems = new ArrayList();
        public void delete()		//删除联系人
        {
            Show Show = new Show();
            //读取所有联系人信息
            allItems = Show.ReadAll();
            bool isContinue;		//是否继续删除联系人
            do
            {
                Console.Write("请输入要删除的联系人的姓名：");
                //使用Trim()方法去除输入字符串的首尾空格
                string name = Console.ReadLine().Trim();
                DeletePerson(name);
                Console.Write("是否继续删除（Y/N）：");
                string judge = Console.ReadLine();
                if (judge.Equals("Y") || judge.Equals("y"))
                {
                    isContinue = true;
                }
                else
                {
                    isContinue = false;
                }
            } while (isContinue);
        }
        void DeletePerson(string name)
        {
            ArrayList persons = new ArrayList();
            //将allItems中匹配的联系人添加到persons中
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
            else
            {
                Console.WriteLine("查找到{0}个姓名为{1}的联系人：", persons.Count, name);
                //显示查找到的联系人信息
                foreach (Person item in persons)
                {
                    item.Show();
                }
                Console.Write("是否全部删除（Y/N）：");
                string judge = Console.ReadLine();
                if (judge.Equals("Y") || judge.Equals("y"))
                {
                    //将persons中的联系人从allItems中移除
                    foreach (Person item in persons)
                    {
                        allItems.Remove(item);
                    }
                    Console.WriteLine("全部删除成功！");
                }
                else
                {
                    bool isFound = false;
                    do
                    {
                        Console.Write("请输入要删除联系人的序号：");
                        int pid = int.Parse(Console.ReadLine());
                        //删除指定联系人
                        foreach (Person item in persons)
                        {
                            if (item.id == pid)
                            {
                                allItems.Remove(item);
                                Console.WriteLine("删除成功！");
                                isFound = true;
                                break;
                            }
                        }
                    } while (isFound == false);
                }
                //将allItems中的联系人写入“通讯录.txt”文件中

                string content = "";
                foreach (Person item in allItems)
                {
                    content += Convert.ToString(allItems.IndexOf(item)) + "," + item.name + "," + item.gender + "," + item.phone_number + "\n";
                }
                File.WriteAllText(Person.FilePath, content);
            }
        }

    }
}
