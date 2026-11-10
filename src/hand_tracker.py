"""将摄像头图像转换为每只手的 21 个关键点和左右手信息。"""

from __future__ import annotations

from dataclasses import dataclass, replace
from io import BytesIO
import math
from pathlib import Path
import zipfile

import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks import python
from mediapipe.tasks.python import vision


@dataclass(frozen=True)
class HandData:
    # 点的顺序保持模型的固定编号；每个点为归一化的 (x, y, z)。
    landmarks: tuple[tuple[float, float, float], ...]
    handedness: str
    handedness_score: float
    # 同一只手的三维世界坐标，由模型直接提供，用于角度和距离判断。
    world_landmarks: tuple[tuple[float, float, float], ...] | None = None


def convert_result(result, mirrored: bool, min_score: float) -> list[HandData]:
    """保持每只手的关键点与类别绑定，不根据画面位置或列表顺序分配左右手。"""
    hands = []
    for index, landmarks in enumerate(result.hand_landmarks):
        if len(landmarks) != 21:
            continue
        points = tuple((float(p.x), float(p.y), float(p.z)) for p in landmarks)
        if not all(math.isfinite(value) for point in points for value in point):
            continue
        categories = result.handedness[index] if index < len(result.handedness) else []
        category = max(categories, key=lambda item: item.score) if categories else None
        score = float(category.score) if category is not None else 0.0
        label = category.category_name if category is not None else "Unknown"
        if not math.isfinite(score) or not 0 <= score <= 1:
            score = 0.0
            label = "Unknown"
        if label not in ("Left", "Right") or score < min_score:
            label = "Unknown"
        elif not mirrored:
            # 官方手部模型按自拍镜像约定标记左右手；未镜像输入时交换标签。
            label = "Right" if label == "Left" else "Left"
        world_lists = getattr(result, "hand_world_landmarks", [])
        world_points = None
        if index < len(world_lists) and len(world_lists[index]) == 21:
            candidate = tuple((float(p.x), float(p.y), float(p.z)) for p in world_lists[index])
            if all(math.isfinite(value) for point in candidate for value in point):
                world_points = candidate
        hands.append(HandData(points, label, score, world_points))

    # 单人双手场景中，身份冲突时保留骨架但不猜测左右手。
    for label in ("Left", "Right"):
        if sum(hand.handedness == label for hand in hands) > 1:
            hands = [replace(hand, handedness="Unknown") if hand.handedness == label else hand
                     for hand in hands]
    return hands


class HandTracker:
    def __init__(self, model_path: Path, settings: dict):
        if not model_path.is_file():
            raise FileNotFoundError(
                "还没有找到手部模型。请把 hand_landmarker.task 放进项目的 models 文件夹。"
            )
        # Python 读取模型后传入内容，避免底层库按错误编码打开中文路径。
        self.model_bytes = model_path.read_bytes()
        try:
            with zipfile.ZipFile(BytesIO(self.model_bytes)) as bundle:
                if sum(name.endswith(".tflite") for name in bundle.namelist()) < 2:
                    raise ValueError("模型包中缺少手部检测所需的模型。")
        except (zipfile.BadZipFile, ValueError) as error:
            raise ValueError("模型文件不完整或不是正确的 hand_landmarker.task，请重新核对下载文件。") from error

        self.mirrored = settings["mirror"]
        self.min_score = settings["min_handedness_confidence"]
        self.last_timestamp = -1
        options = vision.HandLandmarkerOptions(
            base_options=python.BaseOptions(
                model_asset_buffer=self.model_bytes,
                delegate=python.BaseOptions.Delegate.CPU,
            ),
            running_mode=vision.RunningMode.VIDEO,
            num_hands=settings["max_hands"],
            min_hand_detection_confidence=settings["min_detection_confidence"],
            min_hand_presence_confidence=settings["min_presence_confidence"],
            min_tracking_confidence=settings["min_tracking_confidence"],
        )
        self.detector = vision.HandLandmarker.create_from_options(options)

    def detect(self, frame_bgr: np.ndarray, timestamp_ms: int) -> list[HandData]:
        # MediaPipe 需要 RGB；OpenCV 从摄像头读到的是 BGR。
        rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        image = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb))
        timestamp = max(self.last_timestamp + 1, int(timestamp_ms))
        self.last_timestamp = timestamp
        result = self.detector.detect_for_video(image, timestamp)
        return convert_result(result, self.mirrored, self.min_score)

    def close(self):
        if self.detector is not None:
            self.detector.close()
            self.detector = None

    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.close()
