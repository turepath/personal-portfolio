import cv2
import mediapipe as mp

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils

hands = mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.7)

img = cv2.imread("hand.jpg")
rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
res = hands.process(rgb_img)

if res.multi_hand_landmarks:
    for lm in res.multi_hand_landmarks:
        mp_draw.draw_landmarks(img, lm, mp_hands.HAND_CONNECTIONS)
else:
    print("没有检测到手部")

cv2.imwrite("hand_result.jpg", img)
print("图片处理完成，生成 hand_result.jpg")
cv2.imshow("result", img)
cv2.waitKey(0)
cv2.destroyAllWindows()
