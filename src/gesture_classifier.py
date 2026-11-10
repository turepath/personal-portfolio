"""数字 1～6 的规则分类；学生可从 classify_hand 这个固定接口扩展。"""

from __future__ import annotations

import math
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from hand_tracker import HandData


# 状态顺序固定为：拇指、食指、中指、无名指、小指。
# True 表示伸出，False 表示弯曲；不能只计算伸出了几根手指。
DIGIT_PATTERNS = {
    (False, True, False, False, False): "1",
    (False, True, True, False, False): "2",
    (False, True, True, True, False): "3",
    (False, True, True, True, True): "4",
    (True, True, True, True, True): "5",
    (True, False, False, False, True): "6",
}


def distance(a, b) -> float:
    return math.dist(a, b)


def joint_angle(a, b, c) -> float | None:
    """以 b 为顶点的夹角，单位为度；三点在一条直线上时为 180 度。"""
    first = tuple(x - y for x, y in zip(a, b))
    second = tuple(x - y for x, y in zip(c, b))
    length = math.sqrt(sum(x * x for x in first) * sum(x * x for x in second))
    if length <= 1e-12:
        return None
    cosine = sum(x * y for x, y in zip(first, second)) / length
    return math.degrees(math.acos(max(-1.0, min(1.0, cosine))))


FINGER_NAMES = ("thumb", "index", "middle", "ring", "pinky")
RULE_VERSION = "2026-10-18"


def _long_finger_measurements(points, base: int, palm_length: float) -> dict:
    """综合指尖相对掌部的位置与伸展程度，不要求两个关节同时接近共线。"""
    mcp, pip, dip, tip = points[base:base + 4]
    pip_angle = joint_angle(mcp, pip, dip)
    dip_angle = joint_angle(pip, dip, tip)
    length = distance(mcp, pip) + distance(pip, dip) + distance(dip, tip)
    if pip_angle is None or dip_angle is None or length <= 1e-8:
        return {"state": None, "reason": "degenerate_finger"}

    # 腕部 → 中指指根定义手掌自身的前方，整个手旋转后仍使用同一相对方向。
    palm_axis = tuple((a - b) / palm_length for a, b in zip(points[9], points[0]))
    tip_offset = tuple(a - b for a, b in zip(tip, pip))
    forward = sum(a * b for a, b in zip(tip_offset, palm_axis)) / palm_length
    wrist_gain = (distance(tip, points[0]) - distance(pip, points[0])) / palm_length
    reach = distance(mcp, tip) / length
    state = None
    if forward >= 0.12 and wrist_gain >= 0.10 and reach >= 0.78 and pip_angle >= 125:
        state = True
    elif forward <= 0.04 and (wrist_gain <= 0.05 or reach <= 0.78):
        state = False
    return {"state": state, "pip_angle": pip_angle, "dip_angle": dip_angle,
            "reach": reach, "forward": forward, "wrist_gain": wrist_gain}


def _thumb_measurements(points, palm_width: float) -> dict:
    """拇指以外展与伸展程度为主，允许指根自然弯曲。"""
    cmc, mcp, ip, tip = points[1:5]
    mcp_angle = joint_angle(cmc, mcp, ip)
    ip_angle = joint_angle(mcp, ip, tip)
    if mcp_angle is None or ip_angle is None:
        return {"state": None, "reason": "degenerate_finger"}

    # 小指指根 → 食指指根，定义手掌自身的横向；不依赖屏幕方向或左右手标签。
    palm_axis = tuple(a - b for a, b in zip(points[5], points[17]))
    thumb_offset = tuple(a - b for a, b in zip(tip, points[5]))
    side = sum(a * b for a, b in zip(thumb_offset, palm_axis)) / palm_width ** 2
    spread = distance(tip, points[5]) / palm_width
    length = distance(mcp, ip) + distance(ip, tip)
    if length <= 1e-8:
        return {"state": None, "reason": "degenerate_finger"}
    reach = distance(mcp, tip) / length
    state = None
    # 手指根部天生有弯曲，不再用 MCP >= 135 度作为伸出的一票否决条件。
    if side >= 0.15 and spread >= 0.40 and reach >= 0.82 and ip_angle >= 125:
        state = True
    elif side <= 0.10 or (ip_angle <= 105 and side < 0.4):
        state = False
    return {"state": state, "mcp_angle": mcp_angle, "ip_angle": ip_angle,
            "side": side, "spread": spread, "reach": reach}


def inspect_hand(hand: HandData) -> dict:
    """返回数字、五指状态和几何特征，供诊断模式定位 UNKNOWN 的原因。"""
    report = {"digit": "UNKNOWN", "states": None, "features": {}, "reason": "missing_world"}
    points = hand.world_landmarks
    if points is None or len(points) != 21:
        return report
    if any(len(point) != 3 or not all(math.isfinite(value) for value in point)
           for point in points):
        report["reason"] = "invalid_world"
        return report
    palm_width = distance(points[5], points[17])
    palm_length = distance(points[0], points[9])
    if palm_width <= 1e-8 or palm_length <= 1e-8:
        report["reason"] = "degenerate_palm"
        return report

    features = [_thumb_measurements(points, palm_width)]
    features.extend(_long_finger_measurements(points, base, palm_length)
                    for base in (5, 9, 13, 17))
    states = tuple(item["state"] for item in features)
    uncertain = [name for name, state in zip(FINGER_NAMES, states) if state is None]
    digit = DIGIT_PATTERNS.get(states, "UNKNOWN") if not uncertain else "UNKNOWN"
    report.update(digit=digit, states=states,
                  features=dict(zip(FINGER_NAMES, features)),
                  reason=("uncertain:" + ",".join(uncertain) if uncertain
                          else "undefined_pattern" if digit == "UNKNOWN" else "ok"))
    return report


def finger_states(hand: HandData) -> tuple[bool | None, ...] | None:
    """返回五指状态；其中 None 表示该手指不确定，整体 None 表示数据不可用。"""
    return inspect_hand(hand)["states"]


def classify_hand(hand: HandData) -> str:
    """每次只判断一只手，返回 '1'～'6' 或 'UNKNOWN'；不保留上一帧结果。"""
    return inspect_hand(hand)["digit"]
