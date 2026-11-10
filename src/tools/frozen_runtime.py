"""第三方库导入前，将 EXE 的运行缓存定位到其自身文件夹。"""
import os
from pathlib import Path
import sys

cache = Path(sys.executable).resolve().parent / '.cache'
for name in ('tmp', 'matplotlib'):
    (cache / name).mkdir(parents=True, exist_ok=True)
for name in ('TEMP', 'TMP', 'TMPDIR'):
    os.environ[name] = str(cache / 'tmp')
os.environ['MPLCONFIGDIR'] = str(cache / 'matplotlib')
os.environ['PYTHONNOUSERSITE'] = '1'

# windowed 模式没有终端，为使用 .write/.flush 的第三方代码提供空输出。
# 这里只写入系统的空设备，不创建项目外文件。
if sys.stdout is None:
    sys.stdout = open(os.devnull, 'w', encoding='utf-8')
if sys.stderr is None:
    sys.stderr = open(os.devnull, 'w', encoding='utf-8')


# 此教学程序不使用音频 ASIO；避免用户全局变量要求加载未随包分发的 ASIO DLL。
os.environ.pop('SD_ENABLE_ASIO', None)
if '--check' in sys.argv:
    import json
    import cv2
    backend_report = {
        'DirectShow': cv2.videoio_registry.hasBackend(cv2.CAP_DSHOW),
        'MediaFoundation': cv2.videoio_registry.hasBackend(cv2.CAP_MSMF),
        'camera_opened': False,
    }
    (cache / 'backend-check.json').write_text(
        json.dumps(backend_report, indent=2), encoding='utf-8')
