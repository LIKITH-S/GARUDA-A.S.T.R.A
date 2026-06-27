import logging
from typing import List, Dict, Tuple, Optional
from services.ai.recognition.similarity_service import calculate_cosine_similarity

logger = logging.getLogger(__name__)

# Default threshold for AdaFace models (similarity score, higher is better)
# Set to 0.40 to reliably separate true matches from false matches in validation datasets.
DEFAULT_THRESHOLD = 0.40

def rank_matches(target_embedding: List[float], database: List[Dict], top_k: int = 5) -> List[Dict]:
    """
    Ranks the database records against the target embedding.
    
    Args:
        target_embedding: The 512-dim embedding of the detected face.
        database: List of records [{"id": "uuid", "embedding": [...]}]
        top_k: Number of top matches to return.
        
    Returns:
        A list of dicts sorted by similarity descending: [{"id": "uuid", "similarity": 0.85}]
    """
    results = []
    
    for record in database:
        db_embedding = record.get("embedding")
        person_id = record.get("id")
        
        if not db_embedding or not person_id:
            continue
            
        similarity = calculate_cosine_similarity(target_embedding, db_embedding)
        logger.info(f"AdaFace Matching Diagnostics: Target vs Person {person_id} - Cosine Similarity: {similarity:.4f}")
        results.append({
            "id": person_id,
            "similarity": similarity
        })
        
    # Sort descending (highest similarity first)
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:top_k]

def get_best_match(target_embedding: List[float], database: List[Dict], threshold: float = DEFAULT_THRESHOLD) -> Tuple[bool, Optional[str], Optional[float]]:
    """
    Finds the absolute best match that exceeds the threshold.
    """
    ranked = rank_matches(target_embedding, database, top_k=1)
    
    if ranked and len(ranked) > 0:
        best = ranked[0]
        if best["similarity"] >= threshold:
            return True, best["id"], best["similarity"]
            
    return False, None, None
