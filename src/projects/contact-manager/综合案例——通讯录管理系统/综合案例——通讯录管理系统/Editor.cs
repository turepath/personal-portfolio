using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace 综合案例__通讯录管理系统
{
    internal class Editor:Person
    {
        ArrayList allItems = new ArrayList();
        public void Modify()			//编辑通讯录成员
        {
            Show printItem = new Show();
            //读取所有联系人信息
            allItems = printItem.ReadAll();
            bool isContinue;            //是否继续修改
            do
            {
                Console.Write("请输入要修改的联系人的姓名：");
                //使用Trim()方法去除输入字符串的首尾空格
                string personName = Console.ReadLine().Trim();
                ModifyPerson(personName);
                Console.Write("是否继续修改（Y/N）：");
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
        void ModifyPerson(string name)
        {
            Person findPerson;
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
                Console.WriteLine("未找到要修改的联系人！");
            }
            else
            {
                Console.WriteLine("查找到{0}个姓名为{1}的联系人：", persons.Count, name);
                //显示查找到的联系人信息
                foreach (Person person in persons)
                {
                    person.Show();
                }
                string phoneNum;
                //如果查找到一个联系人，则修改该联系人的手机号码
                if (persons.Count == 1)
                {
                    foreach (Person item in persons)
                    {
                        findPerson = item;
                        do
                        {
                            Console.Write("请输入该联系人的新手机号码：");
                            phoneNum = Console.ReadLine();
                        } while (phoneNum.Length != 11);
                        findPerson.phone_number = phoneNum;
                        break;
                    }
                }
                else //如果查找到多个联系人，则根据联系人的序号进行修改

                {
                    bool isFound = false;
                    do
                    {
                        Console.Write("请输入要修改的联系人的序号：");
                        int pIndex = int.Parse(Console.ReadLine());
                        foreach (Person item in persons)
                        {
                            if (item.id == pIndex)
                            {
                                findPerson = item;
                                do
                                {
                                    Console.Write("请输入该联系人的新手机号码：");
                                    phoneNum = Console.ReadLine();
                                } while (phoneNum.Length != 11);
                                findPerson.phone_number = phoneNum;
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
                Console.WriteLine("修改成功！");
            }
        }

    }
    
}

