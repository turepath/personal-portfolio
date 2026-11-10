import torch

# 检查PyTorch版本
print(f"PyTorch版本: {torch.__version__}")

# 检查CUDA是否可用
print(f"CUDA可用: {torch.cuda.is_available()}")

if torch.cuda.is_available():
    # 获取GPU数量
    print(f"GPU数量: {torch.cuda.device_count()}")
    
    # 获取当前GPU名称
    print(f"当前GPU: {torch.cuda.get_device_name(0)}")
    
    # 获取CUDA版本
    print(f"CUDA版本: {torch.version.cuda}")
else:
    print("未检测到可用的GPU。请检查CUDA安装和GPU驱动。")