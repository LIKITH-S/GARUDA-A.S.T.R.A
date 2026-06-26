import sys
import os
import argparse
import cv2

# Set python path dynamically to support executing from anywhere
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from services.ai.detection.face_detection import FaceDetector
from services.ai.detection.face_cropper import FaceCropper
from services.ai.detection.preprocessing import Preprocessor
from services.ai.recognition.embedding_service import generate_embedding
from services.ai.recognition.identity_manager import register_identity

def main():
    parser = argparse.ArgumentParser(description="Register a new face identity for Garuda A.S.T.R.A.")
    parser.add_argument("--image", required=True, help="Path to the image file containing the face.")
    parser.add_argument("--name", required=True, help="Full name of the person being registered.")
    args = parser.parse_args()

    if not os.path.exists(args.image):
        print(f"Error: Image file not found at {args.image}")
        sys.exit(1)

    print(f"Loading image from: {args.image}")
    img = cv2.imread(args.image)
    if img is None:
        print("Error: Could not read or decode the image file.")
        sys.exit(1)

    print("Running YOLOv8 face detection...")
    faces = FaceDetector.detect_faces(img)
    if not faces:
        print("Error: No faces detected in the image.")
        sys.exit(1)

    print(f"Detected {len(faces)} face(s).")
    
    # Pick the largest face detected based on bounding box area
    best_face = None
    max_area = 0
    for face in faces:
        x1, y1, x2, y2 = face["facial_area"]
        area = (x2 - x1) * (y2 - y1)
        if area > max_area:
            max_area = area
            best_face = face

    if best_face is None:
        print("Error: Could not identify a valid face bounding box.")
        sys.exit(1)

    print("Cropping and preprocessing face...")
    crop = FaceCropper.crop_face(img, best_face["facial_area"])
    if crop is None or crop.size == 0:
        print("Error: Cropping failed.")
        sys.exit(1)

    # Preprocess the crop into raw JPEG bytes without resizing
    jpeg_bytes = Preprocessor.preprocess_face(crop)
    if not jpeg_bytes:
        print("Error: Preprocessing failed.")
        sys.exit(1)

    print("Generating 512-dimensional facial embedding (ArcFace)...")
    embedding = generate_embedding(jpeg_bytes)
    if not embedding:
        print("Error: Failed to generate face embedding.")
        sys.exit(1)

    print(f"Embedding successfully extracted. Registering '{args.name}'...")
    person_id = register_identity(args.name, embedding)
    if person_id:
        print(f"\nSuccess! Registered '{args.name}' with Unique ID: {person_id}")
    else:
        print("Error: Failed to save identity to storage.")

if __name__ == "__main__":
    main()
