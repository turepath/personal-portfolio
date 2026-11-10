"""在当前画面上绘制骨架、左右手、各自的数字与运行状态。"""

import cv2


HAND_CONNECTIONS = (
    (0, 1), (1, 2), (2, 3), (3, 4),
    (0, 5), (5, 6), (6, 7), (7, 8),
    (5, 9), (9, 10), (10, 11), (11, 12),
    (9, 13), (13, 14), (14, 15), (15, 16),
    (13, 17), (17, 18), (18, 19), (19, 20), (0, 17),
)
COLORS = {"Left": (90, 230, 100), "Right": (255, 180, 65), "Unknown": (0, 210, 255)}


def pixel_point(point, width: int, height: int) -> tuple[int, int]:
    """把模型的归一化坐标转换为画面内的像素坐标。"""
    return (
        max(0, min(width - 1, round(point[0] * width))),
        max(0, min(height - 1, round(point[1] * height))),
    )


def draw_frame(frame, hands, fps: float, max_hands: int, show_ids: bool = False,
               camera_only: bool = False, gesture_labels: list[str] | None = None,
               diagnostic_lines: list[str] | None = None):
    if gesture_labels is not None and len(gesture_labels) != len(hands):
        raise ValueError("数字结果的数量必须与当前检测到的手数一致。")
    height, width = frame.shape[:2]
    for hand_index, hand in enumerate(hands):
        color = COLORS.get(hand.handedness, COLORS["Unknown"])
        points = [pixel_point(point, width, height) for point in hand.landmarks]
        for start, end in HAND_CONNECTIONS:
            cv2.line(frame, points[start], points[end], color, 2, cv2.LINE_AA)
        for index, point in enumerate(points):
            cv2.circle(frame, point, 4, (255, 255, 255), -1, cv2.LINE_AA)
            cv2.circle(frame, point, 2, color, -1, cv2.LINE_AA)
            if show_ids:
                cv2.putText(frame, str(index), (point[0] + 5, point[1] - 5),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.35, color, 1, cv2.LINE_AA)
        x = min(point[0] for point in points)
        y = min(height - 12, max(90, min(point[1] for point in points) - 12))
        label = hand.handedness
        if gesture_labels is not None:
            label = f"{label}: {gesture_labels[hand_index]}"
        font = cv2.FONT_HERSHEY_SIMPLEX
        scale = 0.7
        label_width = cv2.getTextSize(label, font, scale, 2)[0][0]
        if label_width > width - 8:
            scale *= (width - 8) / label_width
            label_width = cv2.getTextSize(label, font, scale, 2)[0][0]
        x = max(2, min(x, width - label_width - 4))
        cv2.putText(frame, label, (x, y), font, scale, color, 2, cv2.LINE_AA)

    cv2.rectangle(frame, (0, 0), (width - 1, 62), (30, 30, 30), -1)
    text = "Camera preview" if camera_only else f"Hands: {len(hands)}/{max_hands}"
    cv2.putText(frame, f"{text}   FPS: {fps:.1f}", (12, 25),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv2.LINE_AA)
    cv2.putText(frame, "Close window or press Esc to exit", (12, 49),
                cv2.FONT_HERSHEY_SIMPLEX, 0.42, (200, 200, 200), 1, cv2.LINE_AA)
    if diagnostic_lines:
        # 只有显式进入诊断模式时才显示规则状态，正常界面不增加操作项。
        count = max(0, min(len(diagnostic_lines), (height - 74) // 20))
        top = height - count * 20 - 8
        cv2.rectangle(frame, (0, top), (width - 1, height - 1), (25, 25, 25), -1)
        for index, line in enumerate(diagnostic_lines[:count]):
            cv2.putText(frame, line, (8, top + 18 + index * 20),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.42, (230, 230, 230), 1, cv2.LINE_AA)
    return frame
