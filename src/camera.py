"""摄像头读取：自动选择设备，并在结束或异常时释放设备。"""

from __future__ import annotations

import sys
import time

import cv2
import numpy as np


def valid_frame(frame) -> bool:
    """摄像头应返回非空的三通道彩色图像。"""
    return (
        isinstance(frame, np.ndarray)
        and frame.ndim == 3
        and frame.shape[2] == 3
        and frame.shape[0] > 0
        and frame.shape[1] > 0
        and frame.dtype == np.uint8
    )


class Camera:
    def __init__(self, index: int | None = None, width: int = 640, height: int = 480):
        self.index = index
        self.width = width
        self.height = height
        self.capture = None
        self.first_frame = None
        self.description = ""

    @staticmethod
    def backends():
        if sys.platform == "win32":
            return ((cv2.CAP_DSHOW, "DirectShow"), (cv2.CAP_MSMF, "Media Foundation"))
        return ((cv2.CAP_ANY, "Default"),)

    def open(self):
        if self.capture is not None:
            return self
        indices = range(3) if self.index is None else (self.index,)
        for index in indices:
            for backend, name in self.backends():
                capture = None
                try:
                    capture = cv2.VideoCapture(index, backend)
                    if not capture.isOpened():
                        continue
                    capture.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
                    capture.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
                    for _ in range(5):
                        ok, frame = capture.read()
                        if ok and valid_frame(frame):
                            self.capture = capture
                            self.first_frame = frame
                            self.description = f"Camera {index} / {name}"
                            return self
                        time.sleep(0.02)
                except cv2.error:
                    pass
                finally:
                    if capture is not None and capture is not self.capture:
                        capture.release()
        raise RuntimeError(
            "无法打开可读取画面的摄像头。请关闭可能占用摄像头的软件，"
            "并检查 Windows 的摄像头权限。也可在 config.json 中指定 camera_index。"
        )

    def read(self):
        if self.capture is None:
            raise RuntimeError("摄像头尚未打开。")
        if self.first_frame is not None:
            frame, self.first_frame = self.first_frame, None
            return frame
        for _ in range(5):
            ok, frame = self.capture.read()
            if ok and valid_frame(frame):
                return frame
            time.sleep(0.02)
        raise RuntimeError("摄像头连续读取失败，请检查设备是否断开或被其他软件占用。")

    def close(self):
        if self.capture is not None:
            self.capture.release()
            self.capture = None
        self.first_frame = None

    def __enter__(self):
        return self.open()

    def __exit__(self, *_):
        self.close()
