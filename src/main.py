"""摄像头双手关键点与数字 1～6 识别。运行 python main.py 即可启动。"""

from __future__ import annotations

import argparse
from contextlib import suppress
import hashlib
import json
import os
from pathlib import Path
import sys
import time
import traceback


APP_DIR = Path(sys.executable).resolve().parent if getattr(sys, "frozen", False) else Path(__file__).resolve().parent
RESOURCE_DIR = Path(getattr(sys, "_MEIPASS", APP_DIR))
MODEL_PATH = RESOURCE_DIR / "models" / "hand_landmarker.task"
DEFAULT_CONFIG = {
    "camera_index": None,
    "width": 640,
    "height": 480,
    "max_hands": 2,
    "mirror": True,
    "show_landmark_ids": False,
    "show_gestures": True,
    "min_detection_confidence": 0.5,
    "min_presence_confidence": 0.5,
    "min_tracking_confidence": 0.5,
    "min_handedness_confidence": 0.65,
}


def prepare_runtime():
    """运行产生的缓存和临时文件只放在项目中，不清理或删除已有文件。"""
    cache = APP_DIR / ".cache"
    for directory in (cache / "tmp", cache / "matplotlib", cache / "pip"):
        directory.mkdir(parents=True, exist_ok=True)
    for name in ("TEMP", "TMP", "TMPDIR"):
        os.environ[name] = str(cache / "tmp")
    os.environ["MPLCONFIGDIR"] = str(cache / "matplotlib")
    os.environ["PIP_CACHE_DIR"] = str(cache / "pip")
    os.environ["PYTHONNOUSERSITE"] = "1"


def load_config(path: Path | None = None) -> dict:
    path = path if path is not None else APP_DIR / "config.json"
    settings = DEFAULT_CONFIG.copy()
    if path.is_file():
        try:
            data = json.loads(path.read_text(encoding="utf-8-sig"))
        except (UnicodeError, json.JSONDecodeError) as error:
            raise ValueError("config.json 格式不正确，请按原来的 JSON 格式保存。") from error
        if not isinstance(data, dict):
            raise ValueError("config.json 的最外层应为一组配置项。")
        unknown = set(data) - set(settings)
        if unknown:
            raise ValueError("config.json 存在不支持的配置项：" + ", ".join(sorted(unknown)))
        settings.update(data)
    index = settings["camera_index"]
    if index is not None and (type(index) is not int or not 0 <= index <= 9):
        raise ValueError("camera_index 应为 null（自动选择），或 0～9 的整数。")
    for key, low, high in (("width", 160, 1920), ("height", 120, 1080), ("max_hands", 1, 2)):
        if type(settings[key]) is not int or not low <= settings[key] <= high:
            raise ValueError(f"{key} 应为 {low}～{high} 的整数。")
    for key in ("mirror", "show_landmark_ids", "show_gestures"):
        if type(settings[key]) is not bool:
            raise ValueError(f"{key} 应为 true 或 false。")
    for key in (name for name in settings if name.endswith("confidence")):
        if type(settings[key]) not in (int, float) or not 0 <= settings[key] <= 1:
            raise ValueError(f"{key} 应为 0～1 之间的数字。")
    return settings


def check_model(settings):
    import numpy as np
    from hand_tracker import HandTracker

    frame = np.zeros((settings["height"], settings["width"], 3), dtype=np.uint8)
    start = time.perf_counter()
    with HandTracker(MODEL_PATH, settings) as tracker:
        for timestamp in range(3):
            hands = tracker.detect(frame, timestamp)
    print("[通过] 本地模型已加载，CPU 推理已运行三帧。")
    print(f"空白画面检测手数：{len(hands)}；检查用时：{time.perf_counter() - start:.2f} 秒。")
    print("模型 SHA-256：", hashlib.sha256(MODEL_PATH.read_bytes()).hexdigest())
    print("本次没有打开摄像头，也没有保存画面。")
    # 无控制台的 EXE 也能留下可核对的检查结果；此模式不接触摄像头。
    if getattr(sys, "frozen", False):
        report = {
            "ok": True, "device": "CPU", "frames": 3,
            "detected_hands": len(hands), "camera_opened": False,
            "model_sha256": hashlib.sha256(MODEL_PATH.read_bytes()).hexdigest(),
            "executable": str(Path(sys.executable).resolve()),
            "resource_directory": str(RESOURCE_DIR),
        }
        (APP_DIR / ".cache" / "model-check.json").write_text(
            json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")


def check_camera(settings):
    from camera import Camera

    with Camera(settings["camera_index"], settings["width"], settings["height"]) as camera:
        for _ in range(3):
            frame = camera.read()
        print("[通过] 摄像头可以打开并连续读取画面：", camera.description)
        print(f"实际画面：{frame.shape[1]} × {frame.shape[0]}。")
    print("摄像头已释放。本次没有显示或保存画面。")


def run_preview(settings, camera_only=False, diagnose=False):
    import cv2
    from camera import Camera
    from drawing import draw_frame
    from gesture_classifier import classify_hand

    tracker = None
    diagnostics = None
    try:
        if not camera_only:
            from hand_tracker import HandTracker
            tracker = HandTracker(MODEL_PATH, settings)
        with Camera(settings["camera_index"], settings["width"], settings["height"]) as camera:
            print("摄像头已打开：", camera.description)
            print("程序正在运行。关闭画面窗口或按 Esc 退出。")
            window = "Hand Tracker"
            cv2.namedWindow(window, cv2.WINDOW_NORMAL)
            if diagnose:
                from tools.gesture_diagnostics import GestureDiagnostics
                diagnostics = GestureDiagnostics(APP_DIR / ".cache" / "diagnostics")
                print("诊断模式：准备 3 秒，然后跟随屏幕依次比 1～6，每个数字 5 秒。")
                print("请先用一只手，保持手掌朝向镜头；约 33 秒后自动结束，也可按 Esc 提前退出。")
                print("只记录关键点与规则数值，不保存照片或视频。文件：", diagnostics.path)
            started = time.perf_counter_ns()
            last_time = time.perf_counter()
            fps = 0.0
            while True:
                frame = camera.read()
                if settings["mirror"]:
                    frame = cv2.flip(frame, 1)
                timestamp = (time.perf_counter_ns() - started) // 1_000_000
                hands = tracker.detect(frame, timestamp) if tracker is not None else []
                # 按当前手的顺序立即分类，不按左右位置排序，不沿用上一帧数字。
                gesture_labels = ([classify_hand(hand) for hand in hands]
                                  if (settings["show_gestures"] or diagnose) and not camera_only else None)
                diagnostic_lines, diagnostic_finished = None, False
                if diagnostics is not None:
                    diagnostic_lines, diagnostic_finished = diagnostics.update(
                        hands, timestamp, (frame.shape[1], frame.shape[0]))
                now = time.perf_counter()
                elapsed = now - last_time
                last_time = now
                if elapsed > 0:
                    current_fps = 1.0 / elapsed
                    fps = current_fps if fps == 0 else 0.9 * fps + 0.1 * current_fps
                draw_frame(frame, hands, fps, settings["max_hands"],
                           settings["show_landmark_ids"], camera_only,
                           gesture_labels=gesture_labels, diagnostic_lines=diagnostic_lines)
                cv2.imshow(window, frame)
                if cv2.waitKey(1) & 0xFF in (27, ord("q")):
                    break
                if diagnostic_finished:
                    break
                try:
                    if cv2.getWindowProperty(window, cv2.WND_PROP_VISIBLE) < 1:
                        break
                except cv2.error:
                    break
    finally:
        if diagnostics is not None:
            diagnostics.close()
            print("诊断记录已保留：", diagnostics.path)
        if tracker is not None:
            tracker.close()
        # 没有图形界面或窗口已被关闭时，不让清理错误盖住最初的错误。
        with suppress(cv2.error):
            cv2.destroyAllWindows()


def main() -> int:
    parser = argparse.ArgumentParser(description="摄像头双手关键点与各自的数字 1～6 识别。")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true", help="只检查模型，运行空白画面推理，不打开摄像头")
    mode.add_argument("--check-camera", action="store_true", help="短暂读取摄像头后释放，不显示或保存画面")
    mode.add_argument("--camera-only", action="store_true", help="仅显示摄像头画面，不加载模型")
    mode.add_argument("--diagnose", action="store_true", help="按提示测试数字 1～6，只记录关键点和规则特征，约 33 秒后结束")
    args = parser.parse_args()
    try:
        prepare_runtime()
        settings = load_config()
        if args.check:
            check_model(settings)
        elif args.check_camera:
            check_camera(settings)
        else:
            run_preview(settings, args.camera_only, diagnose=args.diagnose)
        return 0
    except KeyboardInterrupt:
        print("已停止运行。")
        return 0
    except Exception as error:
        message = f"启动或运行失败：{error}"
        print(message, file=sys.stderr)
        log_path = APP_DIR / ".cache" / "errors.log"
        try:
            with log_path.open("a", encoding="utf-8") as log:
                log.write(time.strftime("\n%Y-%m-%d %H:%M:%S\n"))
                traceback.print_exc(file=log)
            print("详细错误已保留在项目的 .cache/errors.log 中。", file=sys.stderr)
        except OSError:
            pass
        if getattr(sys, "frozen", False) and not args.check:
            import ctypes
            ctypes.windll.user32.MessageBoxW(None, message, "Hand Tracker", 0x10)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
