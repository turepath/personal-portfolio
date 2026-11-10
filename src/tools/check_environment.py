"""Check this project's named Conda environment without opening the camera."""

from __future__ import annotations

import importlib
from importlib.metadata import version
import os
from pathlib import Path
import struct
import subprocess
import sys


PROJECT_DIR = Path(__file__).resolve().parent.parent
ENVIRONMENT_DIR = PROJECT_DIR / ".conda-envs" / "hand-gesture"


def main() -> int:
    # 在导入第三方工具前设置缓存位置，检查过程也只使用项目内的临时目录。
    cache = PROJECT_DIR / ".cache"
    for directory in (cache / "tmp", cache / "matplotlib", cache / "pip"):
        directory.mkdir(parents=True, exist_ok=True)
    for name in ("TEMP", "TMP", "TMPDIR"):
        os.environ[name] = str(cache / "tmp")
    os.environ["MPLCONFIGDIR"] = str(cache / "matplotlib")
    os.environ["PIP_CACHE_DIR"] = str(cache / "pip")
    # pip check 只检查本环境，不读取项目外的 pip 配置文件。
    os.environ["PIP_CONFIG_FILE"] = os.devnull

    print("开始检查手势识别项目的环境……")

    if Path(sys.prefix).resolve() != ENVIRONMENT_DIR.resolve():
        print("尚未进入本项目的 hand-gesture 环境。")
        print("请在 Anaconda Prompt 中先运行“准备项目.bat”，再输入：")
        print("conda activate hand-gesture")
        return 1

    if sys.version_info[:2] != (3, 12) or struct.calcsize("P") != 8:
        print("本项目需要 64 位的 Python 3.12，请把这条提示发给教师。")
        print("当前版本：", sys.version.split()[0])
        return 1

    print("[通过] 已进入本项目的 hand-gesture 环境。")
    print("[通过] Python 3.12，64 位。")

    packages = (
        ("MediaPipe", "mediapipe", "mediapipe", "0.10.35"),
        ("OpenCV", "opencv-contrib-python", "cv2", "4.12.0.88"),
        ("NumPy", "numpy", "numpy", "2.2.6"),
    )

    for label, distribution, module, expected in packages:
        try:
            importlib.import_module(module)
            installed = version(distribution)
        except Exception as error:
            print(f"[未通过] {label} 还不能正常使用。")
            print("错误信息：", error)
            print("请把以上提示发给教师，暂时不用修改其他环境。")
            return 1
        if installed != expected:
            print(f"[未通过] {label} 的版本应为 {expected}，当前为 {installed}。")
            print("请把这条提示发给教师。")
            return 1
        print(f"[通过] {label} {installed}")

    try:
        from mediapipe.tasks.python import vision

        if not hasattr(vision, "HandLandmarker"):
            raise RuntimeError("找不到手部关键点检测功能 HandLandmarker")
    except Exception as error:
        print("[未通过] 手部关键点检测功能还不能正常导入。")
        print("错误信息：", error)
        return 1

    print("[通过] 手部关键点检测功能可以导入。")
    result = subprocess.run(
        [sys.executable, "-m", "pip", "check"],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if result.returncode:
        print("[未通过] 安装的工具之间存在依赖问题，请将以下提示发给教师。")
        print(result.stdout.strip())
        print(result.stderr.strip())
        return 1

    print("[通过] 安装的工具之间没有发现依赖冲突。")
    print()
    print("检查通过，环境准备完成！")
    print("本次没有打开摄像头，也没有下载模型。后续再测试识别功能。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
