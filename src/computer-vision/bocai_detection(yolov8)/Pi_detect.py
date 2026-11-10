import cv2
import numpy as np
import onnxruntime as ort

# Load model
model_path = '/home/pi/bocai/best.onnx'
session = ort.InferenceSession(model_path)

# Turn on the camera
cap = cv2.VideoCapture(0)

#cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
#cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

CLASS_NAME = "yellow"
CONF_THRESHOLD = 0.5 

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Preprocessed image
    input_shape = (640, 640)
    resized_frame = cv2.resize(frame, input_shape)
    input_image = resized_frame.astype(np.float32) / 255.0
    input_image = np.transpose(input_image, (2, 0, 1))
    input_image = np.expand_dims(input_image, axis=0)

    # Make inferences
    inputs = {session.get_inputs()[0].name: input_image}
    outputs = session.run(None, inputs)
    #print("outputs shape:", len(outputs))
    #print("outputs[0] shape:", outputs[0].shape)
    
    # Post-processing output
    # Suppose the output is a list containing bounding boxes and categories
    #boxes = outputs[0]
    
    predictions = outputs[0][0].T
    h, w = frame.shape[:2]
    
    #classes = outputs[1]

    # Draw the bounding box
    #for box, cls in zip(boxes, classes):
        #x1, y1, x2, y2 = map(int, box)
        #cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        #cv2.putText(frame, "yellow", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
    for pred in predictions:
        x_center, y_center, width, height, conf = pred
        if conf < CONF_THRESHOLD:
            continue
        x1 = int((x_center - width / 2) * w / 640)
        y1 = int((y_center - height / 2) * h / 640)
        x2 = int((x_center + width / 2) * w / 640)
        y2 = int((y_center + height / 2) * h / 640) 
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        label = f"{CLASS_NAME} {conf:.2f}"
        cv2.putText(frame, label, (x1, y1 - 10), 
        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    # Display results
    cv2.imshow('Object Detection', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()