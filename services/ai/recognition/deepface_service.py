import logging

logger = logging.getLogger(__name__)

class DeepFaceConfig:
    """
    Configuration for DeepFace operations.
    Since the backend receives a pre-cropped face, we do NOT need a detector backend.
    """
    MODEL_NAME = "ArcFace"
    DETECTOR_BACKEND = "skip"  # Skip detection, assume face is already cropped
    ENFORCE_DETECTION = False  # Do not throw exceptions if detection step fails

    @classmethod
    def get_config(cls) -> dict:
        """Returns the configuration payload for DeepFace operations."""
        return {
            "model_name": cls.MODEL_NAME,
            "detector_backend": cls.DETECTOR_BACKEND,
            "enforce_detection": cls.ENFORCE_DETECTION
        }

def initialize_deepface():
    """
    Pre-loads the ArcFace model into memory to ensure fast subsequent processing.
    """
    try:
        from deepface import DeepFace
        logger.info(f"Initializing DeepFace model: {DeepFaceConfig.MODEL_NAME}")
        DeepFace.build_model(DeepFaceConfig.MODEL_NAME)
        logger.info("DeepFace initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize DeepFace: {e}")
