import cv2
import numpy as np
import torch
from ultralytics import YOLO
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

class iPhoneYOLOSegmentation:
    def __init__(self, camera_index=None, model_path=None):
        """
        Initialize YOLOv8 segmentation with iPhone camera
        
        Args:
            camera_index: Camera index to use, if None will try to auto-detect iPhone
            model_path: Path to custom model, if None uses pretrained model
        """
        # Initialize YOLO model
        self.model = YOLO(model_path if model_path else "yolov8n-seg.pt")
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"Using device: {self.device}")
        
        # Auto-detect iPhone camera if not specified
        if camera_index is None:
            cameras = list_available_cameras()
            print(f"Found {len(cameras)} camera devices:")
            for cam in cameras:
                print(f"Camera {cam['index']}: {cam['resolution']} @ {cam['fps']} FPS")
            
            # On macOS with Continuity Camera, iPhone is often not the first camera
            self.camera_index = 1 if len(cameras) > 1 else 0
            print(f"\nAutomatically selecting camera index {self.camera_index}")
            print("If this is not your iPhone camera, please specify the correct index")
        else:
            self.camera_index = camera_index
    
    def process_frame(self, frame):
        """
        Process a single frame with YOLOv8-seg
        
        Args:
            frame: Input image frame from iPhone camera
            
        Returns:
            Processed frame with bounding boxes and simplified segmentation
        """
        # Run inference
        results = self.model(frame, device=self.device)
        
        # Create a copy of the original frame
        output_frame = frame.copy()
        
        # Process results
        if len(results) > 0:
            # Get the first result
            result = results[0]
            
            # Draw bounding boxes
            for i, box in enumerate(result.boxes.data):
                x1, y1, x2, y2, conf, cls = box
                
                # Convert to integers
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                
                # Get class name and confidence
                class_id = int(cls)
                class_name = result.names[class_id]
                confidence = float(conf)
                
                # Generate a color based on class ID
                color = (
                    int(hash(class_name) & 0xFF), 
                    int(hash(class_name + "salt") & 0xFF), 
                    int(hash(class_name + "pepper") & 0xFF)
                )
                
                # Draw bounding box
                cv2.rectangle(output_frame, (x1, y1), (x2, y2), color, 2)
                
                # Add label with class name and confidence
                label = f"{class_name}: {confidence:.2f}"
                text_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
                cv2.rectangle(output_frame, (x1, y1 - text_size[1] - 5), (x1 + text_size[0], y1), color, -1)
                cv2.putText(output_frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
            
            # Draw simplified segmentation masks (if available)
            if result.masks is not None:
                # Get masks
                masks = result.masks.data.cpu().numpy()
                
                # Draw simplified segmentation masks
                for i, mask in enumerate(masks):
                    # Get corresponding box
                    if i < len(result.boxes.data):
                        box = result.boxes.data[i]
                        class_id = int(box[5])
                        class_name = result.names[class_id]
                        
                        # Generate color based on class ID
                        color = (
                            int(hash(class_name) & 0xFF), 
                            int(hash(class_name + "salt") & 0xFF), 
                            int(hash(class_name + "pepper") & 0xFF)
                        )
                        
                        # Create binary mask
                        binary_mask = mask.astype(np.uint8)
                        
                        # Find contours of the mask
                        contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                        
                        # Draw contours instead of filled masks for a simpler look
                        cv2.drawContours(output_frame, contours, -1, color, 2)
        
        return output_frame
    
    def run(self):
        """
        Run YOLOv8 segmentation on iPhone camera feed
        """
        # Open the iPhone camera
        cap = cv2.VideoCapture(self.camera_index)
        
        if not cap.isOpened():
            print(f"Error: Could not open camera with index {self.camera_index}")
            return
        
        # Get and print camera properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        print(f"Camera opened successfully: {width}x{height} @ {fps} FPS")
        print("Press 'q' to quit")
        
        # Create window
        window_name = "iPhone YOLOv8 Segmentation"
        cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        
        # Performance tracking
        frame_count = 0
        start_time = time.time()
        fps_display_interval = 30  # Update FPS every 30 frames
        
        try:
            while True:
                # Capture frame
                ret, frame = cap.read()
                
                if not ret:
                    print("Error: Failed to capture frame")
                    break
                
                # Process frame with YOLOv8-seg
                processed_frame = self.process_frame(frame)
                
                # Calculate and display FPS
                frame_count += 1
                if frame_count % fps_display_interval == 0:
                    end_time = time.time()
                    elapsed_time = end_time - start_time
                    fps = fps_display_interval / elapsed_time
                    start_time = time.time()
                    
                    # Add FPS text to frame
                    cv2.putText(processed_frame, f"FPS: {fps:.1f}", (10, 30), 
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                
                # Display the processed frame
                cv2.imshow(window_name, processed_frame)
                
                # Break the loop if 'q' is pressed
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
                    
        finally:
            # Release resources
            cap.release()
            cv2.destroyAllWindows()
            print("Camera released")

if __name__ == "__main__":
    # Create iPhone YOLO segmentation instance
    # You can specify a camera index if auto-detection doesn't work:
    # iphone_yolo = iPhoneYOLOSegmentation(camera_index=1)
    iphone_yolo = iPhoneYOLOSegmentation()
    
    # Run segmentation on iPhone camera feed
    iphone_yolo.run() 