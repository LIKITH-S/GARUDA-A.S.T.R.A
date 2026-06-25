import logging
from typing import List
from scipy.spatial.distance import cosine

logger = logging.getLogger(__name__)

def calculate_cosine_similarity(vector1: List[float], vector2: List[float]) -> float:
    """
    Calculates the cosine similarity between two 512-dimensional embeddings.
    Cosine distance returned by scipy is 0 for identical vectors, 2 for exactly opposite.
    Similarity = 1 - distance.
    
    Args:
        vector1: First embedding.
        vector2: Second embedding.
        
    Returns:
        Float value between -1.0 and 1.0 (where 1.0 is exact match).
    """
    try:
        distance = cosine(vector1, vector2)
        return 1.0 - distance
    except Exception as e:
        logger.error(f"Error calculating cosine similarity: {e}")
        return 0.0
