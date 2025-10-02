"""
YOLOv7 Acne Detection API Server
Provides inference endpoint for acne detection using YOLOv7 model
"""

import os
import io
import cv2
import torch
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
from pathlib import Path
from typing import List, Dict, Any
from contextlib import asynccontextmanager
import yaml

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown events"""
    # Startup: Load model
    load_model()
    yield
    # Shutdown: cleanup if needed
    pass

app = FastAPI(
    title="YOLOv7 Acne Detection API",
    description="API for detecting acne and skin problems using YOLOv7",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model
model = None
model_info = None
device = None

# Model paths
MODEL_DIR = Path(__file__).parent / "model"
MODEL_PATH = MODEL_DIR / "acne_detection_best.pt"
MODEL_INFO_PATH = MODEL_DIR / "model_info.yaml"


def load_model():
    """Load YOLOv7 model and model info using Ultralytics"""
    global model, model_info, device
    
    try:
        # Load model info
        with open(MODEL_INFO_PATH, 'r') as f:
            model_info = yaml.safe_load(f)
        
        # Set device
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {device}")
        
        # Try loading with Ultralytics YOLO first
        try:
            from ultralytics import YOLO
            model = YOLO(str(MODEL_PATH))
            print(f"✓ Model loaded with Ultralytics YOLO")
        except ImportError:
            print("⚠️  Ultralytics not found, trying alternative loading method...")
            # Alternative: Use torch hub for YOLOv7
            try:
                # Load YOLOv7 from torch hub
                model = torch.hub.load('WongKinYiu/yolov7', 'custom', 
                                      path=str(MODEL_PATH), 
                                      force_reload=False,
                                      trust_repo=True)
                model.eval()
                model = model.to(device)
                print(f"✓ Model loaded with torch.hub")
            except Exception as hub_error:
                print(f"⚠️  torch.hub loading failed: {hub_error}")
                print("⚠️  Model loading failed. Please install: pip install ultralytics")
                print("⚠️  Or clone YOLOv7 repo: git clone https://github.com/WongKinYiu/yolov7")
                raise Exception("Could not load YOLOv7 model. Please install ultralytics or setup YOLOv7 repo.")
        
        print(f"✓ Model info: {model_info.get('model_name', 'YOLOv7')}")
        print(f"✓ Classes: {model_info.get('classes', [])}")
        print(f"✓ Input size: {model_info.get('input_size', '640x640')}")
        
    except Exception as e:
        print(f"Error loading model: {e}")
        raise e


def preprocess_image(image: Image.Image, img_size: int = 640) -> torch.Tensor:
    """Preprocess image for YOLOv7 inference"""
    # Convert PIL to OpenCV format
    img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    
    # Resize maintaining aspect ratio
    h, w = img.shape[:2]
    scale = img_size / max(h, w)
    new_w, new_h = int(w * scale), int(h * scale)
    img_resized = cv2.resize(img, (new_w, new_h))
    
    # Pad to square
    top = (img_size - new_h) // 2
    bottom = img_size - new_h - top
    left = (img_size - new_w) // 2
    right = img_size - new_w - left
    img_padded = cv2.copyMakeBorder(img_resized, top, bottom, left, right, cv2.BORDER_CONSTANT, value=(114, 114, 114))
    
    # Convert to RGB and normalize
    img_rgb = cv2.cvtColor(img_padded, cv2.COLOR_BGR2RGB)
    img_normalized = img_rgb.astype(np.float32) / 255.0
    
    # Convert to tensor [1, 3, H, W]
    img_tensor = torch.from_numpy(img_normalized).permute(2, 0, 1).unsqueeze(0)
    
    return img_tensor, scale, (left, top)


def postprocess_detections(outputs, img_size: int, original_size: tuple, scale: float, offset: tuple, conf_threshold: float = 0.25) -> List[Dict]:
    """Process YOLOv7 outputs into detections"""
    detections = []
    
    try:
        # Handle different YOLOv7 output formats
        if isinstance(outputs, tuple):
            outputs = outputs[0]
        
        if isinstance(outputs, torch.Tensor):
            outputs = outputs.cpu().numpy()
        
        # Assuming output format: [batch, num_detections, 6] where 6 = [x, y, w, h, conf, class]
        for detection in outputs[0]:
            if len(detection) >= 6:
                x, y, w, h, conf, cls = detection[:6]
                
                if conf >= conf_threshold:
                    # Adjust coordinates back to original image space
                    x = (x - offset[0]) / scale
                    y = (y - offset[1]) / scale
                    w = w / scale
                    h = h / scale
                    
                    detections.append({
                        'bbox': {
                            'x': float(x),
                            'y': float(y),
                            'width': float(w),
                            'height': float(h)
                        },
                        'confidence': float(conf),
                        'class': int(cls),
                        'class_name': model_info.get('classes', ['acne'])[int(cls)] if int(cls) < len(model_info.get('classes', [])) else 'unknown'
                    })
    
    except Exception as e:
        print(f"Postprocessing error: {e}")
    
    return detections


@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "YOLOv7 Acne Detection API",
        "version": "1.0.0",
        "model_info": model_info,
        "endpoints": {
            "detect": "/detect",
            "health": "/health",
            "info": "/info"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "device": str(device)
    }


@app.get("/info")
async def model_information():
    """Get model information"""
    return {
        "model_info": model_info,
        "device": str(device)
    }


@app.post("/detect")
async def detect_acne(
    file: UploadFile = File(...),
    confidence_threshold: float = 0.25
):
    """
    Detect acne in uploaded image
    
    Args:
        file: Image file (JPG, PNG, etc.)
        confidence_threshold: Minimum confidence for detections (0.0-1.0)
    
    Returns:
        JSON with detections and metadata
    """
    try:
        # Validate file
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and convert image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        original_size = image.size
        
        # Convert PIL Image to numpy array for YOLO
        img_array = np.array(image)
        
        # Run inference with Ultralytics YOLO
        results = model(img_array, conf=confidence_threshold, verbose=False)
        
        # Extract detections from results
        detections = []
        if len(results) > 0:
            result = results[0]  # Get first result
            boxes = result.boxes
            
            for i in range(len(boxes)):
                box = boxes[i]
                # Get box coordinates (xyxy format)
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = float(box.conf[0].cpu().numpy())
                class_id = int(box.cls[0].cpu().numpy())
                
                # Calculate width and height
                width = x2 - x1
                height = y2 - y1
                
                # Get class name
                class_names = model_info.get('classes', ['acne'])
                class_name = class_names[class_id] if class_id < len(class_names) else 'unknown'
                
                detections.append({
                    'bbox': {
                        'x': float(x1),
                        'y': float(y1),
                        'width': float(width),
                        'height': float(height)
                    },
                    'confidence': confidence,
                    'class': class_id,
                    'class_name': class_name
                })
        
        # Prepare response
        response = {
            "success": True,
            "image_size": {
                "width": original_size[0],
                "height": original_size[1]
            },
            "detections_count": len(detections),
            "detections": detections,
            "model_info": {
                "name": model_info.get('model_name', 'YOLOv7'),
                "version": model_info.get('version', 'v1.0'),
                "classes": model_info.get('classes', [])
            },
            "confidence_threshold": confidence_threshold
        }
        
        return JSONResponse(content=response)
    
    except Exception as e:
        print(f"Detection error: {e}")
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
