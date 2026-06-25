import logging

logger = logging.getLogger(__name__)

def evaluate_confidence(similarity_score: float) -> str:
    """
    Evaluates the raw similarity score and maps it to a human-readable confidence tier.
    
    Args:
        similarity_score: Float between 0 and 1.
        
    Returns:
        String representing confidence ("High", "Medium", "Low").
    """
    if similarity_score >= 0.85:
        return "High"
    elif similarity_score >= 0.70:
        return "Medium"
    else:
        return "Low"

def tune_threshold(dataset_results: list) -> float:
    """
    Offline utility to find the optimal threshold to minimize false positives and false negatives.
    Expected dataset_results format: [{"similarity": 0.8, "is_match": True}, ...]
    """
    # This is a placeholder for actual threshold tuning logic
    # In a real environment, this would calculate F1 score across thresholds.
    logger.info("Running offline threshold tuning...")
    return 0.60
