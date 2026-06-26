import unittest
import os
import tempfile
import json
from unittest.mock import patch

from services.ai.recognition.similarity_service import calculate_cosine_similarity
from services.ai.recognition.ranking_service import rank_matches, get_best_match
from services.ai.recognition.identity_manager import load_identities, save_identities, register_identity

class TestSimilarityService(unittest.TestCase):
    def test_cosine_similarity_identical(self):
        # Identical vectors should have a cosine similarity of 1.0
        v1 = [1.0, 0.0, 0.0]
        v2 = [1.0, 0.0, 0.0]
        self.assertAlmostEqual(calculate_cosine_similarity(v1, v2), 1.0, places=5)
        
    def test_cosine_similarity_opposite(self):
        # Opposite vectors should have a cosine similarity of -1.0
        v1 = [1.0, 0.0, 0.0]
        v2 = [-1.0, 0.0, 0.0]
        self.assertAlmostEqual(calculate_cosine_similarity(v1, v2), -1.0, places=5)
        
    def test_cosine_similarity_orthogonal(self):
        # Orthogonal vectors should have a cosine similarity of 0.0
        v1 = [1.0, 0.0, 0.0]
        v2 = [0.0, 1.0, 0.0]
        self.assertAlmostEqual(calculate_cosine_similarity(v1, v2), 0.0, places=5)

class TestRankingService(unittest.TestCase):
    def setUp(self):
        self.target = [1.0, 0.0, 0.0]
        self.database = [
            {"id": "subject_a", "embedding": [0.9, 0.1, 0.0]},
            {"id": "subject_b", "embedding": [0.1, 0.9, 0.0]},
            {"id": "subject_c", "embedding": [-0.8, 0.0, 0.0]}
        ]

    def test_rank_matches(self):
        ranked = rank_matches(self.target, self.database, top_k=2)
        self.assertEqual(len(ranked), 2)
        self.assertEqual(ranked[0]["id"], "subject_a")
        self.assertTrue(ranked[0]["similarity"] > ranked[1]["similarity"])
        
    def test_get_best_match_above_threshold(self):
        match_found, pid, score = get_best_match(self.target, self.database, threshold=0.80)
        self.assertTrue(match_found)
        self.assertEqual(pid, "subject_a")
        self.assertTrue(score > 0.80)

    def test_get_best_match_below_threshold(self):
        # Setting threshold high so even the best match is rejected
        match_found, pid, score = get_best_match(self.target, self.database, threshold=0.999)
        self.assertFalse(match_found)
        self.assertIsNone(pid)
        self.assertIsNone(score)

class TestIdentityManager(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.temp_file = os.path.join(self.temp_dir.name, "test_identities.json")
        
    def tearDown(self):
        self.temp_dir.cleanup()
        
    def test_save_and_load_identities(self):
        test_data = {
            "uuid-12345": {
                "name": "Test Subject",
                "embedding": [0.1] * 512
            }
        }
        
        with patch('services.ai.recognition.identity_manager.IDENTITIES_FILE', self.temp_file):
            # Initially empty
            self.assertEqual(load_identities(), {})
            
            # Save data
            self.assertTrue(save_identities(test_data))
            
            # Load back
            loaded = load_identities()
            self.assertIn("uuid-12345", loaded)
            self.assertEqual(loaded["uuid-12345"]["name"], "Test Subject")
            self.assertEqual(len(loaded["uuid-12345"]["embedding"]), 512)

    def test_register_identity(self):
        with patch('services.ai.recognition.identity_manager.IDENTITIES_FILE', self.temp_file):
            pid = register_identity("Registered Subject", [0.5] * 512)
            self.assertTrue(pid != "")
            
            loaded = load_identities()
            self.assertIn(pid, loaded)
            self.assertEqual(loaded[pid]["name"], "Registered Subject")

if __name__ == '__main__':
    unittest.main()
