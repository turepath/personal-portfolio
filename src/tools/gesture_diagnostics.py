"""按屏幕提示收集关键点和规则特征，不保存摄像头照片或视频。"""

from __future__ import annotations

import json
import math
from pathlib import Path
import time

from gesture_classifier import FINGER_NAMES, RULE_VERSION, inspect_hand


class GestureDiagnostics:
    """准备 3 秒，依次提示 1～6、每个 5 秒；记录的提示不等于人工确认的标签。"""

    DURATION = 33.0

    def __init__(self, directory: Path, clock=None):
        self.clock = clock if clock is not None else time.perf_counter
        self.started = self.clock()
        self.last_sample = -1.0
        directory.mkdir(parents=True, exist_ok=True)
        self.path = directory / ("gesture-" + time.strftime("%Y%m%d-%H%M%S")
                                 + f"-{time.time_ns()}.jsonl")
        self.file = self.path.open("x", encoding="utf-8")
        self.file.write(json.dumps({"type": "metadata", "rules": RULE_VERSION,
                                    "finger_order": FINGER_NAMES,
                                    "duration_seconds": self.DURATION,
                                    "note": "prompt_digit is a screen instruction, not a verified label"}) + "\n")
        self.file.flush()

    def update(self, hands, timestamp_ms: int, frame_size: tuple[int, int]):
        elapsed = max(0.0, self.clock() - self.started)
        finished = elapsed >= self.DURATION
        digit = str(int((elapsed - 3) // 5) + 1) if 3 <= elapsed < self.DURATION else None
        if finished:
            prompt = "Diagnostic complete"
        elif digit is None:
            prompt = f"Get ready: {math.ceil(3 - elapsed)}s"
        else:
            remaining = math.ceil(3 + int(digit) * 5 - elapsed)
            prompt = f"Show {digit} with ONE hand: {remaining}s"
        lines = [prompt, "T I M R P = thumb / index / middle / ring / pinky"]
        records = []
        for hand in hands:
            report = inspect_hand(hand)
            states = report["states"]
            flags = " ".join("?" if state is None else "1" if state else "0"
                             for state in states) if states is not None else "? ? ? ? ?"
            lines.append(f"{hand.handedness}: {flags} -> {report['digit']}")
            records.append({"handedness": hand.handedness,
                            "handedness_score": hand.handedness_score,
                            **report, "landmarks": hand.landmarks,
                            "world_landmarks": hand.world_landmarks})
        if elapsed - self.last_sample >= 0.5 or finished:
            self.last_sample = elapsed
            record = {"type": "sample", "elapsed_seconds": elapsed,
                      "timestamp_ms": timestamp_ms, "frame_size": frame_size,
                      "prompt_digit": digit, "hands": records}
            self.file.write(json.dumps(record, allow_nan=False) + "\n")
            self.file.flush()
            summary = "; ".join(lines[2:]) if hands else "no hands"
            print(f"[诊断] 提示 {digit or '-'}；{summary}")
        return lines, finished

    def close(self):
        if not self.file.closed:
            self.file.close()
