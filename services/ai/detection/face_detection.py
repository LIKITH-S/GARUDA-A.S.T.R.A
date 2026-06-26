import logging
import numpy as np
import cv2
from typing import List, Dict, Any

# Standard logger for the detection subsystem
logger = logging.getLogger(__name__)

import os



class FaceDetector:
    """Service for detecting faces in image frames."""
    _model = None
    _current_engine = None

    @classmethod
    def _initialize_model(cls):
        try:
            from ultralytics import YOLO
            import torch
            torch.set_num_threads(1) # Prevent OpenMP Segfault in background threads
        except ImportError:
            logger.warning("Ultralytics or Torch is not installed. Face detection will fail.")
            return

        import httpx
        engine = "cpu"
        try:
            # Sync fetch settings from backend
            resp = httpx.get("http://localhost:8000/api/v1/settings/", timeout=2.0)
            if resp.status_code == 200:
                engine = resp.json().get("processing_engine", "cpu")
        except Exception:
            logger.warning("Could not reach backend API for settings. Defaulting to CPU.")

        model_path = os.path.join(os.path.dirname(__file__), "..", "models", "yolov8n-face.pt")
        onnx_path = model_path.replace(".pt", ".onnx")

        if not os.path.exists(model_path) and not os.path.exists(onnx_path):
            logger.warning(f"YOLOv8 face model not found at {model_path}.")
            return

        if engine == "gpu":
            logger.info("Initializing YOLOv8-face on GPU...")
            cls._model = YOLO(model_path)
            cls._current_engine = "gpu"
        else:
            logger.info("Initializing YOLOv8-face on CPU (Optimized)...")
            
            # Export to ONNX if it doesn't exist
            if not os.path.exists(onnx_path) and os.path.exists(model_path):
                logger.info("Exporting YOLOv8 to ONNX for CPU optimization...")
                temp_model = YOLO(model_path)
                temp_model.export(format='onnx', imgsz=640, half=False, dynamic=False)
            
            # Load ONNX model
            if os.path.exists(onnx_path):
                cls._model = YOLO(onnx_path, task='detect')
            else:
                logger.warning("ONNX export failed, falling back to standard CPU PyTorch.")
                cls._model = YOLO(model_path)
                
            cls._current_engine = "cpu"

    @staticmethod
    def detect_faces(frame: np.ndarray, threshold: float = 0.30) -> List[Dict[str, Any]]:
        """
        Detect faces in a frame using YOLOv8-face.
        
        Args:
            frame: Image frame array (BGR format).
            threshold: Confidence threshold for detection.
            
        Returns:
            A list of detected faces, where each face is a dictionary:
            {"facial_area": [x1, y1, x2, y2], "score": score, "landmarks": landmarks}
            Returns an empty list if no faces are found or an error occurs.
        """
        if FaceDetector._model is None:
            FaceDetector._initialize_model()
            
        if FaceDetector._model is None:
            logger.error("YOLOv8 model is not available.")
            return []
            
        try:
            # OPTIMIZATION: Downscale frame for detection to massively speed up YOLO
            orig_h, orig_w = frame.shape[:2]
            max_dim = 640.0
            scale = 1.0
            
            if max(orig_h, orig_w) > max_dim:
                scale = max(orig_h, orig_w) / max_dim
                new_w = int(orig_w / scale)
                new_h = int(orig_h / scale)
                detect_frame = cv2.resize(frame, (new_w, new_h))
            else:
                detect_frame = frame
                
            # YOLOv8 inference (dynamic device injection)
            device_arg = '0' if FaceDetector._current_engine == 'gpu' else 'cpu'
            use_half = FaceDetector._current_engine == 'gpu'
            results = FaceDetector._model(detect_frame, conf=threshold, verbose=False, device=device_arg, half=use_half)
            
            faces = []
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    conf = box.conf[0].item()
                    # Scale bounding box back to original 1080p/4k resolution
                    if scale != 1.0:
                        area = [int(x1 * scale), int(y1 * scale), int(x2 * scale), int(y2 * scale)]
                    else:
                        area = [int(x1), int(y1), int(x2), int(y2)]
                        
                    w = area[2] - area[0]
                    h = area[3] - area[1]
                    
                    # HEURISTIC 1: Reject extremely small noise boxes
                    if w < 20 or h < 20:
                        continue
                        
                    # HEURISTIC 2: Disabled temporarily to debug missing crops
                    # aspect_ratio = w / max(h, 1)
                    # if aspect_ratio < 0.6 or aspect_ratio > 1.15:
                    #     continue
                        
                    faces.append({
                        "facial_area": area,
                        "score": float(conf),
                        "landmarks": {}
                    })
            
            return faces
        except Exception as e:
            logger.error(f"Error during face detection: {e}")
            return []
