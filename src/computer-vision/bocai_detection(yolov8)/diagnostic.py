import sys
import os
import torch

# 打印详细环境信息
print("=== 环境诊断信息 ===")
print(f"Python解释器路径: {sys.executable}")
print(f"Python版本: {sys.version}")
print(f"当前工作目录: {os.getcwd()}")
print(f"环境变量PATH前几项: {os.environ.get('PATH', '').split(';')[:5]}")
print(f"CUDA_PATH环境变量: {os.environ.get('CUDA_PATH', '未设置')}")

# PyTorch相关信息
print("\n=== PyTorch信息 ===")
try:
    import torch
    print(f"PyTorch版本: {torch.__version__}")
    print(f"CUDA版本: {torch.version.cuda if hasattr(torch.version, 'cuda') else 'N/A'}")
    print(f"cuDNN版本: {torch.backends.cudnn.version() if torch.backends.cudnn.is_available() else 'N/A'}")
    print(f"GPU可用: {torch.cuda.is_available()}")
    print(f"可用GPU数量: {torch.cuda.device_count()}")
    if torch.cuda.is_available():
        print(f"当前GPU: {torch.cuda.get_device_name(0)}")
        print(f"GPU内存: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
except ImportError:
    print("未找到PyTorch模块")
    
# 检查可能的DLL加载问题
print("\n=== DLL加载诊断 ===")
try:
    import torch
    if not torch.cuda.is_available():
        print("尝试诊断CUDA不可用原因:")
        # 检查CUDA相关DLL是否存在
        cuda_dll_path = os.path.join(os.path.dirname(torch.__file__), 'lib', 'cudart64_116.dll')
        if os.path.exists(cuda_dll_path):
            print(f"找到CUDA运行时DLL: {cuda_dll_path}")
        else:
            print(f"未找到CUDA运行时DLL: {cuda_dll_path}")
except Exception as e:
    print(f"诊断过程出错: {e}")