from tensorflow_core.contrib.labeled_tensor import batch
from ultralytics import YOLO
import os
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'
# Load a model
# model = YOLO("yolov8n.yaml")  # build a new model from scratch
model = YOLO("yolov8n.pt")  # load a pretrained model (recommended for training)

# Use the model
model.train(data= r"D:/dataset/data.yaml", epochs=100, workers=8,batch=8)  # train the model
metrics = model.val()  # evaluate model performance on the validation set
results = model("D:/dataset/lables/test")  # 使用您自己的验证集图像
#path = model.export(format="onnx")  # export the model to ONNX format
