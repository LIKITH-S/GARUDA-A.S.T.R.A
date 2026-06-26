from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response
import numpy as np
import cv2

from services.ai.recognition.embedding_service import generate_embedding
from services.ai.detection.face_detection import FaceDetector
from services.ai.detection.face_cropper import FaceCropper
from services.ai.detection.preprocessing import Preprocessor

router = APIRouter()

@router.post("/embedding")
async def get_embedding(image: UploadFile = File(...)):
    """
    Upload an image and receive its 512-dimensional embedding array.
    This bypasses detection and assumes the image is already a tightly cropped face.
    """
    image_bytes = await image.read()
    embedding = generate_embedding(image_bytes)
    
    if not embedding:
        raise HTTPException(status_code=400, detail="Could not generate an embedding for the provided image.")
        
    return {"status": "success", "embedding_dimension": len(embedding), "embedding": embedding}

@router.post("/detect-crop", response_class=Response)
async def detect_and_crop(image: UploadFile = File(...)):
    """
    Upload an image, run the detection pipeline, and return the first cropped face found.
    This validates that the detector is correctly locating and aligning faces.
    """
    image_bytes = await image.read()
    
    # Read bytes into cv2 frame
    nparr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image format")
        
    faces = FaceDetector.detect_faces(frame)
    if not faces:
        raise HTTPException(status_code=404, detail="No faces detected in the image.")
        
    # Take the first face
    first_face = faces[0]
    area = first_face["facial_area"]
    
    crop = FaceCropper.crop_face(frame, area)
    if crop is None or crop.size == 0:
        raise HTTPException(status_code=500, detail="Failed to crop the detected face.")
        
    preprocessed_bytes = Preprocessor.preprocess_face(crop)
    if not preprocessed_bytes:
        raise HTTPException(status_code=500, detail="Failed to preprocess the cropped face.")
        
    # Return the image directly so it renders in Swagger UI
    return Response(content=preprocessed_bytes, media_type="image/jpeg")
