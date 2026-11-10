using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace 综合案例__通讯录管理系统
{
    internal class Show : Person
    {
        //读取所有联系人信息，并返回所有联系人信息的集合
        public ArrayList ReadAll()
        {

            ArrayList allItems = new ArrayList();//ArrayList是一个位于System.Collections命名空间下的动态数组集合类，它允许存储不同类型的数据，并且其大小可以动态增长。

            //读取“通讯录.txt”文件中的联系人数据
            using (StreamReader sReader = new StreamReader(Person.FilePath))//StreamReader类用于从流中读取字符数据，通常用于读取文本文件。
            {
                string str = sReader.ReadLine();
                while (str != null)//null为ReadLine读取的最后一行
                {
                    //将联系人数据转换为联系人对象
                    Person person = ReadPerson(str);
                    
                    //将联系人对象添加到allItems
                    allItems.Add(person);
                }
            }
            return allItems;
        }


        //将读取的联系人数据转换为联系人对象并返回
        Person ReadPerson(string str)
        {
            
            string[] character = str.Split(',');//将字符串 str 按照逗号 , 进行分割,存储在character数组中

            //将character中的元素赋给person对象的相应字段或属性
            Person person = new Person();
            person.id = int.Parse(character[0]);
            person.name = character[1];           
            person.gender = (pGender)Enum.Parse(typeof(pGender), character[2]);//将character中索引为2的元素转换成pGender枚举类型，并将其赋给person对象的Gender属性
            person.phone_number = character[3];
            
            return person;
        }


        //显示联系人信息
        public void ShowAll(ArrayList list)

        {
            Console.WriteLine("序号    姓名   性别        手机号");
            Console.WriteLine("-------------------------------------");
            foreach (Person item in list)
            {

                Console.Write(item.id + "\t");
                Console.Write(item.name + "\t");
                Console.Write(item.gender + "\t");
                Console.Write(item.phone_number + "\n");
            }
        }


        //显示所有联系人信息
        public void ShowAllInfo()           
        {
            //声明并初始化集合allItems
            ArrayList allItems = ReadAll();
            ShowAll(allItems);
            Console.WriteLine("-------------------------------------");
            Console.WriteLine("通讯录读取完毕，共有{0}个联系人。", allItems.Count);
        }
        
        
    }

    
}

