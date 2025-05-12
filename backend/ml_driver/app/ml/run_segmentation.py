#!/usr/bin/env python3
"""
Simple script to run YOLOv8 segmentation on webcam feed.
Press 'q' to exit.
"""

from yolo_segmentation import YOLOSegmentation

def main():
    # Create segmentation model with default YOLOv8n-seg model
    # You can specify a custom model path if needed:
    # segmentation = YOLOSegmentation("path/to/custom/model.pt")
    segmentation = YOLOSegmentation()
    
    # Run webcam segmentation (default camera)
    # You can specify a different camera ID if needed:
    # segmentation.run_webcam(cam_id=1)
    segmentation.run_webcam()

if __name__ == "__main__":
    main() 