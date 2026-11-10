def calculate_BMI( weight , height ):
    weight = float(weight)
    height = float(height)
    BMI=weight/(height**2)
    print(f"你的BMI值为{BMI:.1f}")
    if BMI <=18.5:
        print("此BMI值属于偏瘦范围")
    elif (18.5<BMI<=30):
        print("此BMI值属于正常范围")
    elif 25<BMI<=30:
        print("此BMI值属于偏胖范围")
    else:
        print("肥胖")
    return BMI

user_weight = input("请输入体重（kg）：")
user_height = input("请输入身高（m）：")
calculate_BMI(user_weight, user_height)
