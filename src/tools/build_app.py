"""使用项目内的 PyInstaller 构建 EXE；不覆盖或删除旧构建。"""
from __future__ import annotations

from datetime import datetime
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / '.cache' / 'packaging-tools-20261018'


def build() -> int:
    if Path(sys.prefix).resolve() != (ROOT / '.conda-envs' / 'hand-gesture').resolve():
        print('请使用本项目的 hand-gesture 环境运行打包脚本。')
        return 1
    if not (TOOLS / 'PyInstaller' / '__init__.py').is_file():
        print('尚未安装打包工具。请在本项目的 Anaconda Prompt 中逐条输入：')
        print('conda activate hand-gesture')
        print('python -m pip install --target .cache\\packaging-tools-20261018 pyinstaller==6.22.3')
        return 1
    run = datetime.now().strftime('%Y%m%d-%H%M%S-%f')
    cache = ROOT / '.cache' / 'build' / run
    output = ROOT / '交付' / ('应用构建-' + run)
    cache.mkdir(parents=True, exist_ok=False)
    output.mkdir(parents=True, exist_ok=False)
    env = os.environ.copy()
    for name in ('TEMP', 'TMP', 'TMPDIR'):
        env[name] = str(cache)
    env.update(PYINSTALLER_CONFIG_DIR=str(cache / 'pyinstaller-cache'),
               MPLCONFIGDIR=str(cache / 'matplotlib'),
               PYTHONNOUSERSITE='1', PYTHONDONTWRITEBYTECODE='1',
               PYTHONUTF8='1', PYTHONIOENCODING='utf-8',
               PYTHONPATH=str(TOOLS))
    command = [sys.executable, '-m', 'PyInstaller',
               '--distpath', str(output), '--workpath', str(cache / 'work'),
               str(ROOT / 'tools' / 'hand_tracker.spec')]
    print('正在构建，输出目录：', output, flush=True)
    with (cache / 'build.log').open('w', encoding='utf-8') as log:
        result = subprocess.run(command, cwd=ROOT, env=env, stdout=log, stderr=subprocess.STDOUT)
    if result.returncode:
        print('打包未完成，保留日志：', cache / 'build.log')
        return result.returncode
    app = output / 'HandTracker'
    shutil.copy2(ROOT / 'config.json', app / 'config.json')
    manifest = {'application': str(app), 'build_log': str(cache / 'build.log'),
                'python': sys.version, 'pyinstaller': '6.22.3',
                'camera_tested': False}
    (output / 'build-result.json').write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print('打包完成：', app)
    print('未打开摄像头；请继续执行 EXE 的 --check 检查。')
    return 0


if __name__ == '__main__':
    raise SystemExit(build())
