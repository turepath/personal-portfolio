"""无需摄像头的回归检查。测试文件全部保留在项目的 .cache/tests 中。"""

from __future__ import annotations

import json
from pathlib import Path
import sys
import time
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch


PROJECT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_DIR))
import main

main.prepare_runtime()

import cv2
import numpy as np
from camera import Camera, valid_frame
from drawing import draw_frame, pixel_point
from hand_tracker import HandData, HandTracker, convert_result


# 不用会自动删除文件的临时目录；每次运行保留一份配置测试样本。
TEST_DIR = PROJECT_DIR / ".cache" / "tests" / str(time.time_ns())
TEST_DIR.mkdir(parents=True, exist_ok=True)


def landmarks(x=0.3):
    return [SimpleNamespace(x=x, y=0.5, z=0.0) for _ in range(21)]


def category(label, score=0.95):
    return SimpleNamespace(category_name=label, score=score)


def result(points, labels):
    return SimpleNamespace(hand_landmarks=points, handedness=labels)


class ConfigTests(unittest.TestCase):
    def config(self, name, data):
        path = TEST_DIR / name
        path.write_text(json.dumps(data), encoding="utf-8-sig")
        return path

    def test_missing_config_uses_defaults(self):
        self.assertEqual(main.load_config(TEST_DIR / "不存在.json"), main.DEFAULT_CONFIG)

    def test_chinese_path_spaces_and_partial_config(self):
        settings = main.load_config(self.config("中文 空格配置.json", {"camera_index": 1}))
        self.assertEqual(settings["camera_index"], 1)
        self.assertEqual(settings["max_hands"], 2)

    def test_invalid_config_rejected(self):
        cases = [[], {"widht": 640}, {"width": "640"}, {"width": 0},
                 {"camera_index": True}, {"camera_index": -1}, {"mirror": 1},
                 {"max_hands": 3}, {"show_gestures": "true"}, {"min_detection_confidence": -0.1},
                 {"min_tracking_confidence": float("nan")}]
        for index, data in enumerate(cases):
            with self.subTest(data=data), self.assertRaises(ValueError):
                main.load_config(self.config(f"invalid-{index}.json", data))

    def test_broken_json_rejected(self):
        path = TEST_DIR / "broken.json"
        path.write_text("{", encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "格式不正确"):
            main.load_config(path)


class HandDataTests(unittest.TestCase):
    def test_two_hands_stay_attached_to_their_landmarks(self):
        raw = result([landmarks(0.8), landmarks(0.2)],
                     [[category("Left")], [category("Right")]])
        hands = convert_result(raw, mirrored=True, min_score=0.65)
        self.assertEqual([(h.handedness, h.landmarks[0][0]) for h in hands],
                         [("Left", 0.8), ("Right", 0.2)])
        reversed_raw = result(raw.hand_landmarks[::-1], raw.handedness[::-1])
        reversed_hands = convert_result(reversed_raw, True, 0.65)
        self.assertEqual(reversed_hands, hands[::-1])

    def test_unmirrored_input_swaps_model_convention(self):
        raw = result([landmarks()], [[category("Left")]])
        self.assertEqual(convert_result(raw, False, 0.65)[0].handedness, "Right")

    def test_uncertain_or_missing_identity_keeps_skeleton(self):
        for labels in ([], [[]], [[category("Left", 0.5)]], [[category("Other")]],
                       [[category("Right", float("nan"))]]):
            with self.subTest(labels=labels):
                hands = convert_result(result([landmarks()], labels), True, 0.65)
                self.assertEqual(len(hands), 1)
                self.assertEqual(hands[0].handedness, "Unknown")
                self.assertEqual(len(hands[0].landmarks), 21)

    def test_conflicting_identity_is_not_guessed(self):
        raw = result([landmarks(0.2), landmarks(0.8)],
                     [[category("Right")], [category("Right")]])
        self.assertEqual([h.handedness for h in convert_result(raw, True, 0.65)],
                         ["Unknown", "Unknown"])

    def test_disappeared_hand_does_not_keep_previous_result(self):
        raw = result([landmarks()], [[category("Left")]])
        self.assertEqual(len(convert_result(raw, True, 0.65)), 1)
        self.assertEqual(convert_result(result([], []), True, 0.65), [])

    def test_invalid_landmarks_are_skipped(self):
        bad_points = landmarks(float("inf"))
        raw = result([landmarks()[:20], bad_points, landmarks()],
                     [[category("Left")], [category("Left")], [category("Right")]])
        hands = convert_result(raw, True, 0.65)
        self.assertEqual(len(hands), 1)
        self.assertEqual(hands[0].handedness, "Right")

    def test_missing_or_corrupt_model_has_clear_error(self):
        with self.assertRaisesRegex(FileNotFoundError, "models"):
            HandTracker(TEST_DIR / "missing.task", main.DEFAULT_CONFIG)
        path = TEST_DIR / "corrupt.task"
        path.write_bytes(b"not a model")
        with self.assertRaisesRegex(ValueError, "模型文件不完整"):
            HandTracker(path, main.DEFAULT_CONFIG)

    def test_rgb_conversion_and_increasing_video_timestamps(self):
        tracker = HandTracker.__new__(HandTracker)
        tracker.last_timestamp = -1
        tracker.mirrored = True
        tracker.min_score = 0.65
        tracker.detector = Mock()
        tracker.detector.detect_for_video.return_value = result([], [])
        bgr = np.full((8, 8, 3), (10, 20, 30), dtype=np.uint8)
        for timestamp in (10, 10, 5, 20):
            self.assertEqual(tracker.detect(bgr, timestamp), [])
        calls = tracker.detector.detect_for_video.call_args_list
        self.assertEqual([call.args[1] for call in calls], [10, 11, 12, 20])
        self.assertEqual(calls[0].args[0].numpy_view()[0, 0].tolist(), [30, 20, 10])
        detector = tracker.detector
        tracker.close()
        tracker.close()
        detector.close.assert_called_once()


class CameraTests(unittest.TestCase):
    def setUp(self):
        self.frame = np.zeros((120, 160, 3), dtype=np.uint8)

    def capture(self, opened=True, reads=None):
        capture = Mock()
        capture.isOpened.return_value = opened
        capture.read.side_effect = reads
        if reads is None:
            capture.read.side_effect = None
            capture.read.return_value = (True, self.frame)
        return capture

    def test_unusable_backend_is_released_and_next_backend_is_tried(self):
        failed = self.capture(opened=False)
        working = self.capture()
        with patch.object(Camera, "backends", return_value=((1, "A"), (2, "B"))), \
             patch("camera.cv2.VideoCapture", side_effect=[failed, working]) as create:
            with Camera(index=2) as camera:
                self.assertIs(camera.read(), self.frame)
                self.assertEqual(camera.description, "Camera 2 / B")
            self.assertEqual([call.args for call in create.call_args_list], [(2, 1), (2, 2)])
        failed.release.assert_called_once()
        working.release.assert_called_once()

    def test_automatic_device_fallback(self):
        failed = self.capture(opened=False)
        working = self.capture()
        with patch.object(Camera, "backends", return_value=((1, "A"),)), \
             patch("camera.cv2.VideoCapture", side_effect=[failed, working]) as create:
            with Camera() as camera:
                self.assertIn("Camera 1", camera.description)
            self.assertEqual([call.args[0] for call in create.call_args_list], [0, 1])

    def test_opened_device_without_frames_is_released(self):
        empty = self.capture(reads=[(False, None)] * 5)
        with patch.object(Camera, "backends", return_value=((1, "A"),)), \
             patch("camera.cv2.VideoCapture", return_value=empty), \
             patch("camera.time.sleep"), self.assertRaisesRegex(RuntimeError, "无法打开"):
            Camera(index=0).open()
        empty.release.assert_called_once()

    def test_transient_read_failure_recovers(self):
        camera = Camera()
        camera.capture = self.capture(reads=[(True, None), (False, None), (True, self.frame)])
        with patch("camera.time.sleep"):
            self.assertIs(camera.read(), self.frame)
        camera.close()

    def test_disconnection_releases_device_on_exception(self):
        capture = self.capture(reads=[(True, self.frame)] + [(False, None)] * 5)
        with patch("camera.cv2.VideoCapture", return_value=capture), \
             patch("camera.time.sleep"), self.assertRaisesRegex(RuntimeError, "连续读取失败"):
            with Camera(index=0) as camera:
                camera.read()
                camera.read()
        capture.release.assert_called_once()

    def test_invalid_frame_shapes_are_rejected(self):
        for frame in (None, np.zeros((0, 1, 3), dtype=np.uint8),
                      np.zeros((2, 2), dtype=np.uint8),
                      np.zeros((2, 2, 4), dtype=np.uint8),
                      np.zeros((2, 2, 3), dtype=np.float32)):
            with self.subTest(frame=frame):
                self.assertFalse(valid_frame(frame))
        self.assertTrue(valid_frame(self.frame))


class DrawingAndLifecycleTests(unittest.TestCase):
    def test_outside_points_stay_inside_image(self):
        self.assertEqual(pixel_point((-0.2, 1.5, 0), 640, 480), (0, 479))
        self.assertEqual(pixel_point((1, 1, 0), 640, 480), (639, 479))

    def test_two_hands_can_be_drawn_without_saving_image(self):
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        hands = [HandData(tuple((p.x, p.y, p.z) for p in landmarks(x)), label, 0.95)
                 for x, label in ((0.2, "Left"), (0.8, "Right"))]
        self.assertIs(draw_frame(frame, hands, 20, 2, True), frame)
        self.assertGreater(np.count_nonzero(frame[100:]), 0)

    def test_main_loop_releases_camera_and_model_when_esc_pressed(self):
        fake_camera = Mock()
        fake_camera.__enter__ = Mock(return_value=fake_camera)
        fake_camera.__exit__ = Mock(return_value=False)
        fake_camera.read.return_value = np.zeros((120, 160, 3), dtype=np.uint8)
        tracker = Mock()
        tracker.detect.return_value = []
        with patch("camera.Camera", return_value=fake_camera), \
             patch("hand_tracker.HandTracker", return_value=tracker), \
             patch("cv2.namedWindow"), patch("cv2.imshow"), \
             patch("cv2.waitKey", return_value=27), patch("cv2.destroyAllWindows") as destroy, \
             patch("builtins.print"):
            main.run_preview(main.DEFAULT_CONFIG)
        tracker.close.assert_called_once()
        fake_camera.__exit__.assert_called_once()
        destroy.assert_called_once()

    def test_no_window_cleanup_error_hides_original_model_error(self):
        with patch("hand_tracker.HandTracker", side_effect=RuntimeError("original error")), \
             patch("cv2.destroyAllWindows", side_effect=cv2.error("no GUI")), \
             self.assertRaisesRegex(RuntimeError, "original error"):
            main.run_preview(main.DEFAULT_CONFIG)


if __name__ == "__main__":
    unittest.main(verbosity=2)
