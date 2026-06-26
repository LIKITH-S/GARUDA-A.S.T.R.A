import os
import json
import logging
import uuid
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

# Save identities.json in the same directory as the identity manager
IDENTITIES_FILE = os.path.join(os.path.dirname(__file__), "identities.json")

def load_identities() -> Dict[str, Dict[str, Any]]:
    """
    Loads all registered identities from the identities.json file.
    
    Returns:
        A dictionary mapping person_id (str) to identity info:
        {"person_id": {"name": "Name", "embedding": [float]}}
    """
    if not os.path.exists(IDENTITIES_FILE):
        return {}
    try:
        with open(IDENTITIES_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading identities from {IDENTITIES_FILE}: {e}")
        return {}

def save_identities(identities: Dict[str, Dict[str, Any]]) -> bool:
    """
    Saves the identities dict to the identities.json file.
    """
    try:
        with open(IDENTITIES_FILE, "w") as f:
            json.dump(identities, f, indent=4)
        return True
    except Exception as e:
        logger.error(f"Error saving identities to {IDENTITIES_FILE}: {e}")
        return False

def register_identity(name: str, embedding: List[float]) -> str:
    """
    Registers a new identity with the given name and embedding.
    Generates a new unique person_id.
    
    Returns:
        The generated person_id (str) if successful, or empty string.
    """
    identities = load_identities()
    person_id = str(uuid.uuid4())
    identities[person_id] = {
        "name": name,
        "embedding": embedding
    }
    if save_identities(identities):
        return person_id
    return ""

def get_all_identities() -> Dict[str, Dict[str, Any]]:
    """
    Returns all registered identities.
    """
    return load_identities()
