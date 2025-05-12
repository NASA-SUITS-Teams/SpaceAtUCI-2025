import cv2
import numpy as np
import torch
from ultralytics import YOLO

class YOLOSegmentation:
    def __init__(self, model_path=None):
        """
        Initialize YOLOv8 segmentation model
        
        Args:
            model_path: Path to custom model, if None uses pretrained model
        """
        self.model = YOLO(model_path if model_path else "yolov8n-seg.pt")
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"Using device: {self.device}")
        
    def process_frame(self, frame):
        """
        Process a single frame with YOLOv8-seg
        
        Args:
            frame: Input image frame from webcam
            
        Returns:
            Processed frame with segmentation masks
        """
        results = self.model(frame, device=self.device)
        
        # Visualize results on the frame
        annotated_frame = results[0].plot()
        
        return annotated_frame
        
    def run_webcam(self, cam_id=0):
        """
        Run segmentation on webcam feed
        
        Args:
            cam_id: Camera ID (default is 0 for primary webcam)
        """
        cap = cv2.VideoCapture(cam_id)
        
        if not cap.isOpened():
            print("Error: Could not open webcam")
            return
            
        while True:
            ret, frame = cap.read()
            
            if not ret:
                print("Error: Failed to capture frame")
                break
                
            # Process frame with YOLOv8-seg
            processed_frame = self.process_frame(frame)
            
            # Display the processed frame
            cv2.imshow("YOLOv8 Segmentation", processed_frame)
            
            # Break the loop if 'q' is pressed
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
        # Release resources
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    # Create segmentation model instance
    segmentation = YOLOSegmentation()
    
    # Run webcam segmentation
    segmentation.run_webcam() 