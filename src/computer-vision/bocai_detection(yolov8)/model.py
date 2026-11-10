from torch import nn
import torch
from torchvision import transforms
from yolo_test import YOLODataset

class selfcreate_Model(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 20, 5)
        self.conv2 = nn.Conv2d(20, 20, 5)

    def forward(self, x):
        x = torch.nn.functional.relu(self.conv1(x))
        return torch.nn.functional.relu(self.conv2(x))


if __name__ == '__main__':
    model=selfcreate_Model()
    dataset=YOLODataset(r"D:\Hunan Agricultural University\机创大赛（菠菜组）\视觉\computer-train（v8）\YOLO_img\images",
    r"D:\Hunan Agricultural University\机创大赛（菠菜组）\视觉\computer-train（v8）\YOLO_img\labels",
    transforms.Compose([transforms.ToTensor()]),
    None)
    image,target=dataset[0]
    output=model(image)
    print(model)
    print(output)
    #torch.onnx.export(model,image,"model.onnx")保存模型文件