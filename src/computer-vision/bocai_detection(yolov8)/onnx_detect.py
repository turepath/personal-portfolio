import numpy as np
import cv2
import onnxruntime as ort

# Simplified preprocessing function
def preprocess(image_path):
    # Read image
    img = cv2.imread(image_path)
    # Resize to 640x640
    img = cv2.resize(img, (640, 640))
    # Convert to RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    # Normalize
    img = img.astype(np.float32) / 255.0
    # Adjust dimensions to [1, 3, 640, 640]
    img = np.transpose(img, (2, 0, 1))
    img = np.expand_dims(img, axis=0)
    return img

# Simplified main function
def main(model_path, image_path):
    try:
        # Step 1: Load model
        session = ort.InferenceSession(model_path)
        input_name = session.get_inputs()[0].name
        
        # Step 2: Read image
        img = preprocess(image_path)
        
        # Step 3: Detect image
        output = session.run(None, {input_name: img})
        
        # Simple check for detection results
        detections = output[0]
        if len(detections) > 0 and np.max(detections[:, 4]) > 0.25:
            print("1")
        else:
            print("0")
            
    except Exception as e:
        print("0")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("0")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])