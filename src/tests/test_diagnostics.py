"""诊断计时、文件和主循环检查，使用模拟时钟与模拟摄像头。"""

from __future__ import annotations

import json
from pathlib import Path
import sys
import time
import unittest
from unittest.mock import Mock, patch


PROJECT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_DIR))
import main

main.prepare_runtime()

import cv2
import numpy as np
from drawing import draw_frame
from gesture_classifier import RULE_VERSION
from test_gestures import make_hand
from tools.gesture_diagnostics import GestureDiagnostics


TEST_DIR = PROJECT_DIR / ".cache" / "tests" / ("diagnostics-" + str(time.time_ns()))


class DiagnosticsTests(unittest.TestCase):
    def test_automatic_prompts_and_keypoint_only_log(self):
        now = [0.0]
        session = GestureDiagnostics(TEST_DIR, clock=lambda: now[0])
        try:
            for elapsed, target in ((0, None), (3, "1"), (8, "2"), (28, "6"), (33, None)):
                now[0] = elapsed
                with patch("builtins.print"):
                    lines, finished = session.update([make_hand({"index"})],
                                                     int(elapsed * 1000), (640, 480))
                self.assertEqual(finished, elapsed >= 33)
                self.assertIn("1", lines[-1])
                if target is not None:
                    self.assertIn(f"Show {target}", lines[0])
        finally:
            session.close()
            session.close()
        records = [json.loads(line) for line in session.path.read_text(encoding="utf-8").splitlines()]
        self.assertEqual(records[0]["rules"], RULE_VERSION)
        samples = records[1:]
        self.assertEqual([sample["prompt_digit"] for sample in samples], [None, "1", "2", "6", None])
        self.assertEqual(len(samples[1]["hands"][0]["world_landmarks"]), 21)
        self.assertEqual(samples[1]["hands"][0]["digit"], "1")
        self.assertEqual(samples[1]["hands"][0]["reason"], "ok")
        self.assertEqual(list(TEST_DIR.glob("*.png")), [])
        self.assertEqual(list(TEST_DIR.glob("*.jpg")), [])

    def test_no_hands_and_sampling_interval(self):
        now = [0.0]
        session = GestureDiagnostics(TEST_DIR, clock=lambda: now[0])
        try:
            with patch("builtins.print"):
                session.update([], 0, (640, 480))
                now[0] = 0.1
                session.update([], 100, (640, 480))
                now[0] = 0.6
                session.update([], 600, (640, 480))
        finally:
            session.close()
        records = [json.loads(line) for line in session.path.read_text(encoding="utf-8").splitlines()]
        self.assertEqual(len(records), 3)
        self.assertEqual(records[1]["hands"], [])
        self.assertEqual(records[2]["elapsed_seconds"], 0.6)

    def test_diagnostic_overlay_is_optional(self):
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        with patch("drawing.cv2.putText", wraps=cv2.putText) as text:
            draw_frame(frame, [], 20, 2, diagnostic_lines=["Show 2", "Left: 0 1 1 0 0 -> 2"])
        labels = [call.args[1] for call in text.call_args_list]
        self.assertIn("Show 2", labels)
        self.assertIn("Left: 0 1 1 0 0 -> 2", labels)

    def test_diagnostic_completion_closes_resources_without_real_camera(self):
        camera = Mock()
        camera.__enter__ = Mock(return_value=camera)
        camera.__exit__ = Mock(return_value=False)
        camera.read.return_value = np.zeros((480, 640, 3), dtype=np.uint8)
        tracker = Mock()
        tracker.detect.return_value = [make_hand({"index"})]
        diagnostic = Mock()
        diagnostic.update.return_value = (["Diagnostic complete"], True)
        settings = {**main.DEFAULT_CONFIG, "show_gestures": False}
        with patch("camera.Camera", return_value=camera), \
             patch("hand_tracker.HandTracker", return_value=tracker), \
             patch("tools.gesture_diagnostics.GestureDiagnostics", return_value=diagnostic), \
             patch("drawing.draw_frame") as draw, patch("cv2.namedWindow"), \
             patch("cv2.imshow"), patch("cv2.waitKey", return_value=-1), \
             patch("cv2.destroyAllWindows"), patch("builtins.print"):
            main.run_preview(settings, diagnose=True)
        self.assertEqual(draw.call_args.kwargs["gesture_labels"], ["1"])
        self.assertEqual(draw.call_args.kwargs["diagnostic_lines"], ["Diagnostic complete"])
        diagnostic.close.assert_called_once()
        tracker.close.assert_called_once()
        camera.__exit__.assert_called_once()


if __name__ == "__main__":
    unittest.main(verbosity=2)
