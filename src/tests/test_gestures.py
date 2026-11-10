"""用合成的关节坐标检查数字规则与双手集成，不使用摄像头。"""

from __future__ import annotations

import math
from pathlib import Path
import sys
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch


PROJECT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_DIR))
import main

main.prepare_runtime()

import cv2
import numpy as np
from drawing import draw_frame
from gesture_classifier import classify_hand, finger_states, inspect_hand, joint_angle
from hand_tracker import HandData, convert_result


def make_hand(raised, label="Left"):
    """构造指骨展开或折叠的三维样本；raised 是伸出手指的英文名称集合。"""
    points = [(0.0, 0.035, 0.0)] * 21
    bases = (("index", 5, 0.03, -0.04), ("middle", 9, 0.01, -0.05),
             ("ring", 13, -0.01, -0.045), ("pinky", 17, -0.03, -0.035))
    for name, base, x, y in bases:
        if name in raised:
            finger = [(x, y, 0), (x, y - 0.03, 0),
                      (x, y - 0.05, 0), (x, y - 0.065, 0)]
        else:
            finger = [(x, y, 0), (x, y - 0.02, 0),
                      (x, y - 0.009, -0.020), (x, y + 0.008, -0.015)]
        points[base:base + 4] = finger
    if "thumb" in raised:
        points[1:5] = [(0.022, 0.015, 0), (0.043, 0, 0),
                       (0.065, -0.015, 0), (0.084, -0.027, 0)]
    else:
        points[1:5] = [(0.022, 0.015, 0), (0.037, -0.001, 0),
                       (0.023, -0.015, -0.005), (0.004, -0.019, -0.007)]
    world = tuple(points)
    image = tuple((0.5 + x * 2.2, 0.65 + y * 3.2, z * 2.2) for x, y, z in world)
    return HandData(image, label, 0.95, world)


def transform(hand, scale=1.0, mirrored=False, angles=(0, 0, 0)):
    """改变三维坐标的镜像、朝向、尺度和位置，检查规则不依赖固定画面方向。"""
    rx, ry, rz = angles
    transformed = []
    for x, y, z in hand.world_landmarks:
        if mirrored:
            x = -x
        y, z = y * math.cos(rx) - z * math.sin(rx), y * math.sin(rx) + z * math.cos(rx)
        x, z = x * math.cos(ry) + z * math.sin(ry), -x * math.sin(ry) + z * math.cos(ry)
        x, y = x * math.cos(rz) - y * math.sin(rz), x * math.sin(rz) + y * math.cos(rz)
        transformed.append((x * scale + 0.3, y * scale - 0.2, z * scale + 0.1))
    return HandData(hand.landmarks, hand.handedness, hand.handedness_score, tuple(transformed))


DIGIT_CASES = (
    ("1", {"index"}),
    ("2", {"index", "middle"}),
    ("3", {"index", "middle", "ring"}),
    ("4", {"index", "middle", "ring", "pinky"}),
    ("5", {"thumb", "index", "middle", "ring", "pinky"}),
    ("6", {"thumb", "pinky"}),
)


class ClassifierTests(unittest.TestCase):
    def test_digits_one_to_six_for_both_hands(self):
        for digit, raised in DIGIT_CASES:
            for label in ("Left", "Right"):
                with self.subTest(digit=digit, label=label):
                    hand = make_hand(raised, label)
                    if label == "Right":
                        hand = transform(hand, mirrored=True)
                    self.assertEqual(classify_hand(hand), digit)

    def test_rotation_reflection_scale_and_translation(self):
        for digit, raised in DIGIT_CASES:
            for scale in (0.25, 1.0, 4.0):
                for mirrored in (False, True):
                    for angles in ((0, 0, 0.8), (0.6, -0.4, 1.0), (-0.8, 0.7, -1.2)):
                        with self.subTest(digit=digit, scale=scale, mirror=mirrored, angles=angles):
                            hand = transform(make_hand(raised), scale, mirrored, angles)
                            self.assertEqual(classify_hand(hand), digit)

    def test_undefined_combinations_are_unknown(self):
        for raised in (set(), {"thumb"}, {"pinky"}, {"index", "pinky"},
                       {"thumb", "index", "middle"}):
            with self.subTest(raised=raised):
                self.assertEqual(classify_hand(make_hand(raised)), "UNKNOWN")

    def test_six_is_not_two(self):
        self.assertEqual(classify_hand(make_hand({"thumb", "pinky"})), "6")
        self.assertEqual(classify_hand(make_hand({"index", "middle"})), "2")

    def test_straight_thumb_across_palm_is_not_open_thumb(self):
        hand = make_hand({"index", "middle", "ring", "pinky"})
        points = list(hand.world_landmarks)
        # 拇指的三个关节虽接近共线，但指尖位于掌内，四指手形仍是 4。
        points[1:5] = [(0.03, 0.015, 0), (0.02, 0.005, 0),
                       (0.01, -0.005, 0), (0, -0.015, 0)]
        self.assertEqual(classify_hand(HandData(hand.landmarks, "Left", 0.95, tuple(points))), "4")

    def test_half_bent_finger_is_unknown(self):
        hand = make_hand({"index"})
        points = list(hand.world_landmarks)
        # 指尖既没有向前充分伸出，也没有收回掌部，保留过渡姿态。
        x, y, z = points[6]
        direction = math.radians(80)
        points[7] = (x, y - 0.02 * math.cos(direction), z - 0.02 * math.sin(direction))
        points[8] = (x, y - 0.035 * math.cos(direction), z - 0.035 * math.sin(direction))
        partial = HandData(hand.landmarks, "Left", 0.95, tuple(points))
        self.assertIsNone(finger_states(partial)[1])
        self.assertEqual(classify_hand(partial), "UNKNOWN")

    def test_naturally_curved_open_fingers_do_not_need_straight_distal_joints(self):
        for digit, raised in DIGIT_CASES:
            hand = make_hand(raised)
            points = list(hand.world_landmarks)
            for name, base in (("index", 5), ("middle", 9), ("ring", 13), ("pinky", 17)):
                if name not in raised:
                    continue
                x, y, z = points[base + 1]
                first, second = math.radians(25), math.radians(65)
                points[base + 2] = (x, y - 0.02 * math.cos(first), z - 0.02 * math.sin(first))
                dx, dy, dz = points[base + 2]
                points[base + 3] = (dx, dy - 0.015 * math.cos(second),
                                    dz - 0.015 * math.sin(second))
            curved = HandData(hand.landmarks, hand.handedness, 0.95, tuple(points))
            with self.subTest(digit=digit):
                self.assertEqual(classify_hand(curved), digit)

    def test_thumb_base_can_bend_while_tip_is_spread_out(self):
        for digit, raised in (("5", {"thumb", "index", "middle", "ring", "pinky"}),
                              ("6", {"thumb", "pinky"})):
            hand = make_hand(raised)
            points = list(hand.world_landmarks)
            points[1] = (0.025, 0.016, 0.03)
            opened = HandData(hand.landmarks, "Left", 0.95, tuple(points))
            with self.subTest(digit=digit):
                self.assertLess(joint_angle(points[1], points[2], points[3]), 135)
                self.assertEqual(classify_hand(opened), digit)

    def test_closed_thumb_near_index_retains_digit_one(self):
        hand = make_hand({"index"})
        points = list(hand.world_landmarks)
        points[1:5] = [(-0.002, 0.018, 0), (0.01, 0.005, 0),
                       (0.023, -0.007, 0), (0.0354, -0.019, 0)]
        self.assertEqual(classify_hand(HandData(hand.landmarks, "Left", 0.95, tuple(points))), "1")

    def test_diagnostics_explain_uncertain_and_undefined_hands(self):
        report = inspect_hand(make_hand(set()))
        self.assertEqual(report["reason"], "undefined_pattern")
        self.assertEqual(report["states"], (False,) * 5)
        self.assertIn("forward", report["features"]["middle"])
        hand = make_hand({"index"})
        report = inspect_hand(HandData(hand.landmarks, "Left", 0.95))
        self.assertEqual(report["reason"], "missing_world")
        self.assertIsNone(report["states"])

    def test_bad_or_missing_world_coordinates_are_unknown(self):
        hand = make_hand({"index"})
        invalid = (None, (), hand.world_landmarks[:20], ((0, 0, 0),) * 21,
                   ((float("nan"), 0, 0),) + hand.world_landmarks[1:],
                   ((float("inf"), 0, 0),) + hand.world_landmarks[1:])
        for world in invalid:
            with self.subTest(world=world):
                self.assertEqual(classify_hand(HandData(hand.landmarks, "Left", 0.95, world)),
                                 "UNKNOWN")

    def test_missing_identity_does_not_change_digit(self):
        self.assertEqual(classify_hand(make_hand({"thumb", "pinky"}, "Unknown")), "6")

    def test_joint_angle_and_degenerate_segment(self):
        self.assertAlmostEqual(joint_angle((0, 1, 0), (0, 0, 0), (1, 0, 0)), 90)
        self.assertAlmostEqual(joint_angle((-1, 0, 0), (0, 0, 0), (1, 0, 0)), 180)
        self.assertIsNone(joint_angle((0, 0, 0), (0, 0, 0), (1, 0, 0)))


class IntegrationTests(unittest.TestCase):
    def native_result(self, hands):
        def native(points):
            return [SimpleNamespace(x=x, y=y, z=z) for x, y, z in points]
        return SimpleNamespace(
            hand_landmarks=[native(h.landmarks) for h in hands],
            hand_world_landmarks=[native(h.world_landmarks) for h in hands],
            handedness=[[SimpleNamespace(category_name=h.handedness, score=0.95)] for h in hands],
        )

    def test_world_coordinates_stay_with_the_correct_hand_after_reordering(self):
        left = make_hand({"index", "middle", "ring"}, "Left")
        right = make_hand({"thumb", "pinky"}, "Right")
        for hands in ([left, right], [right, left]):
            converted = convert_result(self.native_result(hands), True, 0.65)
            actual = {hand.handedness: classify_hand(hand) for hand in converted}
            self.assertEqual(actual, {"Left": "3", "Right": "6"})

    def test_bad_world_result_keeps_valid_image_skeleton(self):
        raw = self.native_result([make_hand({"index"})])
        raw.hand_world_landmarks[0][0].x = float("nan")
        converted = convert_result(raw, True, 0.65)
        self.assertEqual(len(converted), 1)
        self.assertEqual(len(converted[0].landmarks), 21)
        self.assertIsNone(converted[0].world_landmarks)
        self.assertEqual(classify_hand(converted[0]), "UNKNOWN")

    def test_drawn_labels_match_hands_and_unknown_does_not_affect_other_hand(self):
        hands = [make_hand(set(), "Left"), make_hand({"thumb", "pinky"}, "Right")]
        labels = [classify_hand(hand) for hand in hands]
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        with patch("drawing.cv2.putText", wraps=cv2.putText) as put_text:
            draw_frame(frame, hands, 20, 2, gesture_labels=labels)
        texts = [call.args[1] for call in put_text.call_args_list]
        self.assertIn("Left: UNKNOWN", texts)
        self.assertIn("Right: 6", texts)

    def test_bone_only_mode_does_not_draw_numbers(self):
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        with patch("drawing.cv2.putText", wraps=cv2.putText) as put_text:
            draw_frame(frame, [make_hand({"index"})], 20, 2)
        self.assertIn("Left", [call.args[1] for call in put_text.call_args_list])
        self.assertNotIn("Left: 1", [call.args[1] for call in put_text.call_args_list])

    def test_number_of_labels_must_match_current_hands(self):
        with self.assertRaisesRegex(ValueError, "数量"):
            draw_frame(np.zeros((480, 640, 3), dtype=np.uint8), [], 20, 2, gesture_labels=["1"])

    def run_mock_preview(self, frame_results, show_gestures=True, camera_only=False):
        camera = Mock()
        camera.__enter__ = Mock(return_value=camera)
        camera.__exit__ = Mock(return_value=False)
        camera.read.return_value = np.zeros((480, 640, 3), dtype=np.uint8)
        tracker = Mock()
        tracker.detect.side_effect = frame_results
        settings = {**main.DEFAULT_CONFIG, "show_gestures": show_gestures}
        keys = [-1] * (len(frame_results) - 1) + [27]
        with patch("camera.Camera", return_value=camera), \
             patch("hand_tracker.HandTracker", return_value=tracker) as create_tracker, \
             patch("drawing.draw_frame") as draw, patch("cv2.namedWindow"), \
             patch("cv2.imshow"), patch("cv2.waitKey", side_effect=keys), \
             patch("cv2.getWindowProperty", return_value=1), patch("cv2.destroyAllWindows"), \
             patch("builtins.print"):
            main.run_preview(settings, camera_only)
        camera.__exit__.assert_called_once()
        if camera_only:
            create_tracker.assert_not_called()
        else:
            tracker.close.assert_called_once()
        return draw.call_args_list

    def test_preview_updates_each_hand_and_does_not_keep_disappeared_numbers(self):
        left = make_hand({"index", "middle", "ring"}, "Left")
        right = make_hand({"thumb", "pinky"}, "Right")
        calls = self.run_mock_preview([[left, right], [right], []])
        self.assertEqual([call.kwargs["gesture_labels"] for call in calls],
                         [["3", "6"], ["6"], []])
        self.assertEqual([h.handedness for h in calls[1].args[1]], ["Right"])

    def test_bone_only_config_and_camera_preview_skip_classification(self):
        hand = make_hand({"index"})
        with patch("gesture_classifier.classify_hand", side_effect=AssertionError("should not run")):
            for camera_only in (False, True):
                calls = self.run_mock_preview([[hand]], show_gestures=False,
                                              camera_only=camera_only)
                self.assertIsNone(calls[0].kwargs["gesture_labels"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
