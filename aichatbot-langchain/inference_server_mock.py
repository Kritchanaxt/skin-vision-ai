"""
Mock YOLOv7 Acne Detection API Server for Testing
"""
import io
import random
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
from pathlib import Path
from typing import List, Dict
from contextlib import asynccontextmanager
import yaml

model_info = None
MODEL_INFO_PATH = Path(__file__).parent / "model" / "model_info.yaml"

def load_model_info():
    global model_info
    try:
        with open(MODEL_INFO_PATH, 'r') as f:
            model_info = yaml.safe_load(f)
    except:
        model_info = {
            'model_name': 'YOLOv7 Acne Detection (Mock)',
            'classes': ['acne'],
            'input_size': '640x640',
            'version': 'v1.0-mock'
        }

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model_info()
    print("✓ Mock server ready!")
    yield

app = FastAPI(
    title="YOLOv7 Acne Detection API (Mock)",
    description="Mock API for testing UI",
    version="1.0.0-mock",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "YOLOv7 Acne Detection API (Mock Mode)",
        "version": "1.0.0-mock",
        "model_info": model_info,
        "mode": "mock"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "mode": "mock", "model_loaded": True}

@app.get("/info")
async def model_information():
    return {"model_info": model_info, "mode": "mock"}

@app.post("/detect")
async def detect_acne(file: UploadFile = File(...), confidence_threshold: float = 0.25):
    try:
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        w, h = image.size
        
        # Mock detections
        num_detections = random.randint(2, 5)
        detections = []
        
        for i in range(num_detections):
            x = random.randint(50, w - 150)
            y = random.randint(50, h - 150)
            box_w = random.randint(20, 60)
            box_h = random.randint(20, 60)
            conf = random.uniform(confidence_threshold, 0.95)
            
            detections.append({
                'bbox': {'x': float(x), 'y': float(y), 'width': float(box_w), 'height': float(box_h)},
                'confidence': float(conf),
                'class': 0,
                'class_name': 'acne'
            })
        
        return JSONResponse(content={
            "success": True,
            "image_size": {"width": w, "height": h},
            "detections_count": len(detections),
            "detections": detections,
            "model_info": {
                "name": model_info.get('model_name', 'YOLOv7'),
                "version": model_info.get('version', 'v1.0'),
                "classes": model_info.get('classes', ['acne'])
            },
            "confidence_threshold": confidence_threshold,
            "note": "Mock data for testing"
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("🚀 Starting Mock YOLOv7 API Server")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
