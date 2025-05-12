import asyncio
import base64
import cv2
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import time
from typing import List, Dict, Any

# Import the YOLOv8 segmentation class
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from ml.iphone_yolo_segmentation import iPhoneYOLOSegmentation, list_available_cameras

# Create FastAPI app
app = FastAPI(title="Camera Stream API")

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connection manager for WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, data: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(data)
            except Exception:
                # Handle disconnection or errors
                pass

# Create connection manager instance
manager = ConnectionManager()

# Camera stream settings
CAMERA_INDEX = 1  # Default camera index for iPhone (adjust if needed)
STREAM_FPS = 15   # Target FPS for streaming
FRAME_WIDTH = 640  # Resize width for better performance
FRAME_HEIGHT = 480  # Resize height for better performance

# Initialize YOLOv8 segmentation
segmentation = None

@app.get("/api/cameras")
async def get_cameras():
    """List all available cameras"""
    cameras = list_available_cameras()
    return {"cameras": cameras}

@app.get("/api/start-camera/{camera_index}")
async def start_camera(camera_index: int):
    """Initialize the camera with the specified index"""
    global segmentation
    try:
        segmentation = iPhoneYOLOSegmentation(camera_index=camera_index)
        return {"status": "success", "message": f"Camera {camera_index} initialized"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.websocket("/ws/camera-stream")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for streaming camera feed"""
    global segmentation
    
    # Accept the WebSocket connection
    await manager.connect(websocket)
    
    # Initialize camera if not already done
    if segmentation is None:
        try:
            segmentation = iPhoneYOLOSegmentation(camera_index=CAMERA_INDEX)
        except Exception as e:
            await websocket.send_json({"error": f"Failed to initialize camera: {str(e)}"})
            manager.disconnect(websocket)
            return
    
    # Open camera
    cap = cv2.VideoCapture(segmentation.camera_index)
    
    if not cap.isOpened():
        await websocket.send_json({"error": f"Could not open camera with index {segmentation.camera_index}"})
        manager.disconnect(websocket)
        return
    
    # Calculate delay to maintain target FPS
    frame_delay = 1.0 / STREAM_FPS
    
    try:
        while True:
            start_time = time.time()
            
            # Capture frame
            ret, frame = cap.read()
            
            if not ret:
                await websocket.send_json({"error": "Failed to capture frame"})
                break
            
            # Resize frame for better performance
            frame = cv2.resize(frame, (FRAME_WIDTH, FRAME_HEIGHT))
            
            # Process frame with YOLOv8 segmentation
            processed_frame = segmentation.process_frame(frame)
            
            # Encode frame to JPEG
            _, buffer = cv2.imencode('.jpg', processed_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            
            # Convert to base64 for sending over WebSocket
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Send frame to client
            await websocket.send_json({
                "frame": frame_base64,
                "timestamp": time.time()
            })
            
            # Calculate time to sleep to maintain target FPS
            elapsed = time.time() - start_time
            sleep_time = max(0, frame_delay - elapsed)
            await asyncio.sleep(sleep_time)
            
    except WebSocketDisconnect:
        # Client disconnected
        manager.disconnect(websocket)
    except Exception as e:
        # Handle other exceptions
        try:
            await websocket.send_json({"error": str(e)})
        except:
            pass
    finally:
        # Release camera
        cap.release()

if __name__ == "__main__":
    # Run the FastAPI app with uvicorn
    uvicorn.run("camera_stream:app", host="0.0.0.0", port=8000, reload=True) 