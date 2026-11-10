using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace day5
{
    enum BloodType
    {
        COLD,HOT,WARM
    }
    

     class Horse
    {
        public string Host
        {
            get;set;
        }
        public string Color
        {
            get;set;
        }
        public BloodType BloodType
        {
            get;set;
        }
        public Horse(string host,string color,BloodType blood)
        {
            Host = host;
            Color = color;
            BloodType = blood;
        }
    }
}
