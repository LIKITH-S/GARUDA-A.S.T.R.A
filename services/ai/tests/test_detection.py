import unittest
import unittest.mock

import os
import tempfile
import cv2

from services.ai.detection.video_service import VideoService

class TestVideoService(unittest.TestCase):
    def setUp(self):
        # Create a temporary empty video file for testing FileNotFoundError
        self.temp_dir = tempfile.TemporaryDirectory()
        self.non_existent_file = os.path.join(self.temp_dir.name, "does_not_exist.mp4")
        
        # Create a dummy valid video file for testing
        self.valid_video_path = os.path.join(self.temp_dir.name, "test_video.avi")
        # Write a short video using cv2.VideoWriter
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        out = cv2.VideoWriter(self.valid_video_path, fourcc, 20.0, (640, 480))
        # Write 10 blank frames
        import numpy as np
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        for _ in range(10):
            out.write(frame)
        out.release()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_get_video_properties_not_found(self):
        with self.assertRaises(FileNotFoundError):
            VideoService.get_video_properties(self.non_existent_file)

    def test_get_video_properties_valid(self):
        props = VideoService.get_video_properties(self.valid_video_path)
        self.assertIsNotNone(props)
        self.assertEqual(props["width"], 640)
        self.assertEqual(props["height"], 480)
        self.assertEqual(props["frame_count"], 10)
        self.assertEqual(props["fps"], 20.0)
        self.assertEqual(props["duration"], 10 / 20.0)

from services.ai.detection.frame_extractor import FrameExtractor

class TestFrameExtractor(unittest.TestCase):
    def setUp(self):
        # Create a dummy valid video file for testing
        self.temp_dir = tempfile.TemporaryDirectory()
        self.valid_video_path = os.path.join(self.temp_dir.name, "test_frames.avi")
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        out = cv2.VideoWriter(self.valid_video_path, fourcc, 20.0, (640, 480))
        # Write 20 frames, changing color slightly to differentiate
        import numpy as np
        for i in range(20):
            frame = np.full((480, 640, 3), i * 10, dtype=np.uint8)
            out.write(frame)
        out.release()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_extract_frames_skip_5(self):
        frames = list(FrameExtractor.extract_frames(self.valid_video_path, skip_interval=5))
        # Should yield frames 0, 5, 10, 15
        self.assertEqual(len(frames), 4)
        indices = [idx for _, idx in frames]
        self.assertEqual(indices, [0, 5, 10, 15])
        
    def test_extract_frames_skip_1(self):
        frames = list(FrameExtractor.extract_frames(self.valid_video_path, skip_interval=1))
        # Should yield all 20 frames
        self.assertEqual(len(frames), 20)
        indices = [idx for _, idx in frames]
        self.assertEqual(indices, list(range(20)))

from services.ai.detection.face_detection import FaceDetector

class TestFaceDetection(unittest.TestCase):
    def test_detect_faces_empty_frame(self):
        import numpy as np
        # An empty or completely black frame should return no faces
        frame = np.zeros((100, 100, 3), dtype=np.uint8)
        faces = FaceDetector.detect_faces(frame)
        self.assertEqual(faces, [])
        
    @unittest.mock.patch('services.ai.detection.face_detection.FaceDetector._model')
    def test_detect_faces_with_mock(self, mock_yolo):
        import numpy as np
        from unittest.mock import MagicMock
        frame = np.zeros((100, 100, 3), dtype=np.uint8)
        
        # Mock YOLO inference to return a valid result object
        mock_box = MagicMock()
        mock_box.xyxy = [MagicMock(tolist=lambda: [10.0, 10.0, 50.0, 50.0])]
        mock_box.conf = [MagicMock(item=lambda: 0.99)]
        
        mock_result = MagicMock()
        mock_result.boxes = [mock_box]
        
        mock_yolo.return_value = [mock_result]
        
        faces = FaceDetector.detect_faces(frame)
        self.assertEqual(len(faces), 1)
        self.assertEqual(faces[0]["facial_area"], [10, 10, 50, 50])
        self.assertEqual(faces[0]["score"], 0.99)

from services.ai.detection.face_cropper import FaceCropper

class TestFaceCropper(unittest.TestCase):
    def test_crop_face_valid(self):
        import numpy as np
        frame = np.ones((100, 100, 3), dtype=np.uint8) * 255
        facial_area = [10, 20, 50, 60]
        
        cropped = FaceCropper.crop_face(frame, facial_area, padding_factor=0.0)
        self.assertIsNotNone(cropped)
        self.assertEqual(cropped.shape, (40, 40, 3))
        
    def test_crop_face_clamping(self):
        import numpy as np
        frame = np.ones((100, 100, 3), dtype=np.uint8) * 255
        # Coordinates outside bounds
        facial_area = [-10, -20, 150, 160]
        
        cropped = FaceCropper.crop_face(frame, facial_area)
        self.assertIsNotNone(cropped)
        # Should be clamped to 0..100
        self.assertEqual(cropped.shape, (100, 100, 3))

    def test_crop_face_invalid_area(self):
        import numpy as np
        frame = np.ones((100, 100, 3), dtype=np.uint8) * 255
        # x1 > x2
        facial_area = [50, 10, 10, 50]
        
        cropped = FaceCropper.crop_face(frame, facial_area)
        self.assertIsNone(cropped)

from services.ai.detection.preprocessing import Preprocessor

class TestPreprocessing(unittest.TestCase):
    def test_preprocess_face_valid(self):
        import numpy as np
        import cv2
        # Dummy crop frame 50x50
        crop_frame = np.ones((50, 50, 3), dtype=np.uint8) * 200
        
        encoded_bytes = Preprocessor.preprocess_face(crop_frame, target_size=(112, 112))
        self.assertIsInstance(encoded_bytes, bytes)
        self.assertTrue(len(encoded_bytes) > 0)
        
        # Verify it can be decoded and has correct size
        nparr = np.frombuffer(encoded_bytes, np.uint8)
        decoded = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        self.assertIsNotNone(decoded)
        self.assertEqual(decoded.shape, (112, 112, 3))
        
    def test_preprocess_face_invalid(self):
        import numpy as np
        empty_frame = np.array([])
        encoded_bytes = Preprocessor.preprocess_face(empty_frame)
        self.assertEqual(encoded_bytes, b'')
        
    def test_preprocess_face_none(self):
        encoded_bytes = Preprocessor.preprocess_face(None)
        self.assertEqual(encoded_bytes, b'')

if __name__ == '__main__':
    unittest.main()
