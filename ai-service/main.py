import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import io
from PIL import Image
import numpy as np

app = FastAPI(title="Farm Fusion AI Service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models
models_path = os.path.join(os.path.dirname(__file__), "models")
cls_model = YOLO(os.path.join(models_path, "farmfusion_v1.pt"))

@app.get("/")
async def root():
    return {"message": "Farm Fusion AI Service is running"}

@app.post("/predict/disease")
async def predict_disease(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Run inference
        results = cls_model(image)
        
        # Get top prediction
        result = results[0]
        probs = result.probs
        top1_idx = probs.top1
        top1_conf = float(probs.top1conf)
        top1_label = result.names[top1_idx]
        
        return {
            "success": True,
            "label": top1_label,
            "confidence": top1_conf,
            "predictions": [
                {"label": result.names[idx], "confidence": float(conf)}
                for idx, conf in zip(probs.top5, probs.top5conf)
            ]
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
