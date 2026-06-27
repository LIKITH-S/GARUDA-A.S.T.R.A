import sys
import json
import traceback



# Import and setup paths
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from services.ai.pipeline import run_analysis_pipeline

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("ERROR:Missing arguments", flush=True)
        sys.exit(1)
        
    video_path = sys.argv[1]
    video_id = sys.argv[2]
    crops_dir = sys.argv[3]
    log_file_path = sys.argv[4]
    
    import logging
    logging.basicConfig(
        level=logging.INFO, 
        format="%(message)s", 
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_file_path, mode='a')
        ]
    )
    
    def cb(prog):
        print(f"PROGRESS:{prog}", flush=True)
        
    try:
        results = run_analysis_pipeline(
            video_path=video_path, 
            video_id=video_id, 
            crops_dir=crops_dir, 
            progress_callback=cb
        )
        print(f"RESULT:{json.dumps(results)}", flush=True)
    except Exception as e:
        print(f"ERROR:{str(e)}\n{traceback.format_exc()}", flush=True)
        sys.exit(1)
