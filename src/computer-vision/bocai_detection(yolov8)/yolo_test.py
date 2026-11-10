import os
import xmltodict
import torch
from PIL import Image
from torch.utils.data import Dataset

class YOLODataset(Dataset):
    def __init__(self,image_folder,label_folder,transform,label_transform):
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
        label_name=img_name.split(".")[0]+".txt"
        label_path=os.path.join(self.label_folder,label_name)
        with open(label_path,"r",encoding="utf-8") as f:
            label_content=f.read()
        object_infos=label_content.strip().split("\n")
        target=[]
        for object_info in object_infos:
            info_list=object_info.strip().split(" ")
            class_id=float(info_list[0])
            center_x=float(info_list[1])
            center_y=float(info_list[2])
            width=float(info_list[3])
            height=float(info_list[4])
            target.extend([class_id,center_x,center_y,width,height])
            
        target=torch.tensor(target)
        if self.transform is not None:
            image=self.transform(image)
        
        return image, target


if __name__ == '__main__':
    train_dataset=YOLODataset(r"D:\Hunan Agricultural University\机创大赛（菠菜组）\视觉\computer-train（v8）\YOLO_img\images",r"D:\Hunan Agricultural University\机创大赛（菠菜组）\视觉\computer-train（v8）\YOLO_img\labels",None,None)
    print(len(train_dataset))
    print(train_dataset[0])