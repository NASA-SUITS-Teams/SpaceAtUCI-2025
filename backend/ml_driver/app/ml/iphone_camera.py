import cv2
import numpy as np
import time

def list_available_cameras():
    """
    List all available camera devices
    """
    index = 0
    available_cameras = []
    
    while True:
        cap = cv2.VideoCapture(index)
        if not cap.isOpened():
            break
        
        # Get camera info
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        available_cameras.append({
            'index': index,
            'resolution': f"{width}x{height}",
            'fps': fps
        })
        
        cap.release()
        index += 1
    
    return available_cameras

def capture_iphone_camera(camera_index=None):
    """
    Capture video from iPhone using Continuity Camera
    
    Args:
        camera_index: Camera index to use, if None will try to auto-detect iPhone
    """
    # If no specific camera index provided, list available cameras
    if camera_index is None:
        cameras = list_available_cameras()
        print(f"Found {len(cameras)} camera devices:")
        for cam in cameras:
            print(f"Camera {cam['index']}: {cam['resolution']} @ {cam['fps']} FPS")
        
        # On macOS with Continuity Camera, iPhone is often not the first camera
        # Try camera index 1 if multiple cameras are available
        camera_index = 1 if len(cameras) > 1 else 0
        print(f"\nAutomatically selecting camera index {camera_index}")
        print("If this is not your iPhone camera, please specify the correct index")
    
    # Open the selected camera
    cap = cv2.VideoCapture(camera_index)
    
    if not cap.isOpened():
        print(f"Error: Could not open camera with index {camera_index}")
        return
    
    # Get and print camera properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    print(f"Camera opened successfully: {width}x{height} @ {fps} FPS")
    print("Press 'q' to quit")
    
    # Create window
    window_name = "iPhone Camera Feed"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    
    try:
        while True:
            # Capture frame
            ret, frame = cap.read()
            
            if not ret:
                print("Error: Failed to capture frame")
                break
            
            # Display the frame
            cv2.imshow(window_name, frame)
            
            # Break the loop if 'q' is pressed
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
    finally:
        # Release resources
        cap.release()
        cv2.destroyAllWindows()
        print("Camera released")

if __name__ == "__main__":
    # List all available cameras first
    print("Scanning for available cameras...")
    cameras = list_available_cameras()
    
    if not cameras:
        print("No cameras found!")
    else:
        # Try to capture from iPhone camera
        # You can specify a different camera index if needed
        capture_iphone_camera() 