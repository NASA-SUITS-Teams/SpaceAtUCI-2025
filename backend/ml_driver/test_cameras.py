import cv2
import time

def test_camera(index):
    print(f"Testing camera index {index}...")
    cap = cv2.VideoCapture(index)
    
    if not cap.isOpened():
        print(f"Camera index {index} could not be opened.")
        return False
    
    # Get camera info
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    print(f"Camera {index}: {width}x{height} @ {fps} FPS")
    
    # Capture a few frames to see what the camera shows
    for i in range(5):
        ret, frame = cap.read()
        if not ret:
            print(f"Failed to capture frame from camera {index}")
            cap.release()
            return False
        
        # Save the frame as an image
        filename = f"camera_{index}_frame_{i}.jpg"
        cv2.imwrite(filename, frame)
        print(f"Saved frame to {filename}")
        time.sleep(0.5)
    
    cap.release()
    return True

# Test cameras with indices 0 through 5
for i in range(6):
    test_camera(i)

print("Camera testing complete. Check the saved images to identify your iPhone camera.") 