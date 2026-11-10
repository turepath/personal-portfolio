import os
import xmltodict
import torch
from PIL import Image
from torch.utils.data import Dataset


class VOCDataset(Dataset):
    def __init__(self,image_folder,label_folder,transform,label_transform):#transform是想对图像的变换，label_transform是想对标签的变换
        self.image_folder=image_folder
        self.label_folder=label_folder
        self.transform=transform
        self.label_transform=label_transform
        self.img_names=os.listdir(self.image_folder)#将文件名字合在列表中

    def __len__(self):
        return len(self.img_names)

    def __getitem__(self, index):
        img_name=self.img_names[index]
        img_path=os.path.join(self.image_folder,img_name)
        image=Image.open(img_path).convert("RGB")
        label_name=img_name.split(".")[0]+".xml"
        label_path=os.path.join(self.label_folder,label_name)
        with open(label_path,"r",encoding="utf-8") as f:
            label_content=f.read()
        label_dict=xmltodict.parse(label_content)
        
        # 获取objects数据
        objects = label_dict["annotation"]["object"]
        target = []
        # 处理只有一个标签和多个标签的情况
        if isinstance(objects, dict):
            # 只有一个标签的情况
            object_name = objects["name"]
            object_xmax = objects["bndbox"]["xmax"]
            object_xmin = objects["bndbox"]["xmin"]
            object_ymax = objects["bndbox"]["ymax"]
            object_ymin = objects["bndbox"]["ymin"]
            target.extend([object_name, object_xmax, object_xmin, object_ymax, object_ymin])
        else:
            # 多个标签的情况
            for obj in objects:
                object_name = obj["name"]
                object_xmax = obj["bndbox"]["xmax"]
                object_xmin = obj["bndbox"]["xmin"]
                object_ymax = obj["bndbox"]["ymax"]
                object_ymin = obj["bndbox"]["ymin"]
                target.extend([object_name, object_xmax, object_xmin, object_ymax, object_ymin])
        #target = torch.tensor(target)#含有字符串类型"name"无法转换
        # 将target转换为tensor
        # 注意：由于包含字符串类型，需要先处理或转换
        # 这里简单处理，只转换数值部分（如果需要）
        # target = torch.tensor(target)  # 这会失败，因为包含字符串
        
        return image, target


if __name__ == '__main__':
    train_dataset=VOCDataset(r"D:\Hunan Agricultural University\机创大赛（菠菜组）\视觉\computer-train（v8）\VOC_img\images",r"D:\Hunan Agricultural University\机创大赛（菠菜组）\视觉\computer-train（v8）\VOC_img\xml",None,None)
    print(len(train_dataset))
    print(train_dataset[0])


