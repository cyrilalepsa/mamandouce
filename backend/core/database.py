"""
Database configuration for MamanDouce
Shared database connection for all modules
"""
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent.parent
# override=False : N2-Vault (RAM) prime sur le .env disque
load_dotenv(ROOT_DIR / '.env', override=False)

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_database')

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]
