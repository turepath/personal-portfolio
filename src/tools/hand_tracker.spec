# PyInstaller 文件夹构建；由 build_app.py 在独立目录中执行。
from pathlib import Path
from PyInstaller.utils.hooks import collect_all

ROOT = Path(SPECPATH).resolve().parent
mp_data, mp_binaries, mp_hidden = collect_all('mediapipe')
a = Analysis(
    [str(ROOT / 'main.py')],
    pathex=[str(ROOT)],
    binaries=mp_binaries,
    datas=mp_data + [(str(ROOT / 'models' / 'hand_landmarker.task'), 'models')],
    hiddenimports=mp_hidden + ['mediapipe.tasks.c'],
    hookspath=[],
    runtime_hooks=[str(ROOT / 'tools' / 'frozen_runtime.py')],
    excludes=['IPython', 'pytest', 'tkinter'],
    noarchive=False,
)

# 教学 EXE 只读取 Windows 摄像头，不提供视频文件编解码或 ASIO 音频功能。
# 构建时不收集相关文件；不会删除安装环境中的任何文件。
def include_runtime(entry):
    name = Path(entry[0]).name.lower()
    if 'ffmpeg' in name:
        return False
    if name.startswith('libportaudio') and name != 'libportaudio64bit.dll':
        return False
    if any(word in name for word in ('license', 'licence', 'notice', 'copying', 'authors')):
        return False  # 原始许可集中收入交付包“第三方说明”。
    if name.lower().startswith('readme'):
        return False
    return True
a.binaries = [item for item in a.binaries if include_runtime(item)]
a.datas = [item for item in a.datas if include_runtime(item)]

pyz = PYZ(a.pure)
exe = EXE(
    pyz, a.scripts, [], exclude_binaries=True,
    name='手势识别', debug=False, bootloader_ignore_signals=False,
    strip=False, upx=False, console=False,
)
coll = COLLECT(exe, a.binaries, a.datas, strip=False, upx=False, name='HandTracker')
