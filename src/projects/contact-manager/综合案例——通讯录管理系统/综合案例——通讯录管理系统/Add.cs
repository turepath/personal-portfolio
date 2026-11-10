using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace 综合案例__通讯录管理系统
{
    internal class Add:Person
    {
        //提示用户输入要添加的联系人信息，创建联系人对象
        Person CreateNewPerson()
        {
            Person newPerson = new Person();
            Console.Write("请输入要添加的联系人姓名：");

            newPerson.name = Console.ReadLine();
            int iGender;
            do
            {
                Console.Write("请输入{0}的性别（0表示男性，1表示女性）：", newPerson.name);
                iGender = int.Parse(Console.ReadLine());
            } while (iGender != 0 && iGender != 1);
            //将IGender转换为pGender枚举类型，并赋给Gender属性
            newPerson.gender = (pGender)iGender;
            string phoneNum;
            do
            {
                Console.Write("请输入{0}的手机号码（必须为11位数字）：", newPerson.name);
                phoneNum = Console.ReadLine();
            } while (phoneNum.Length != 11);
            newPerson.phone_number = phoneNum;
            return newPerson;
        }

        //主函数
        public void Add_person()
        {
            //创建ArrayList类对象allItems
            ArrayList allItems = new ArrayList();
            bool isContinue;			//是否继续添加联系人
            //将CreateNewPerson()方法创建的联系人对象添加到allItems中
            do
            {
                allItems.Add(CreateNewPerson());
                Console.Write("是否继续添加（Y/N）：");
                string judge = Console.ReadLine();
                if (judge.Equals("Y") || judge.Equals("y"))
                {
                    isContinue = true;
                }
                else
                {
                    isContinue = false;
                }
            }
            while (isContinue);

            //将联系人信息添加到“通讯录.txt”文件中
            using (StreamWriter sWriter = File.AppendText(Person.FilePath))
            {
                foreach (Person item in allItems)
                {
                    sWriter.WriteLine(Convert.ToString
                    (allItems.IndexOf(item)) + "," + item.name + "," + item.gender + "," + item.phone_number);
                }
            }

            /*将读取的联系人信息保存在allItems中，并将allItems中的联系人重新写入“通讯录.txt”文件中*/
            Show printItem = new Show();
            allItems = printItem.ReadAll();
            string content = "";
            foreach ( Person item in allItems)
            {
                content += Convert.ToString(allItems.IndexOf(item)) + "," + item.name + "," + item.gender + "," + item.phone_number + "\n";
            }
            File.WriteAllText(Person.FilePath, content);
        }


        

    }
}
