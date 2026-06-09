from pathlib import Path
import os
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent / '.env.local'

load_dotenv(dotenv_path=env_path)

cache_id = os.getenv("CACHE_ID")
api_key = os.getenv("REDIS_SEMANTIC_CACHE_KEY")

