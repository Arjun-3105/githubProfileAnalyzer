import asyncpg
import os
import json
from contextlib import asynccontextmanager

# In production, this should come from .env
# For example: DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DB_URL = os.environ.get("DATABASE_URL")

@asynccontextmanager
async def get_db_connection():
    if not DB_URL:
        raise ValueError("DATABASE_URL environment variable is not set!")
    
    conn = await asyncpg.connect(DB_URL)
    try:
        yield conn
    finally:
        await conn.close()

async def init_db():
    if not DB_URL:
        print("WARNING: DATABASE_URL not set, skipping DB init.")
        return
        
    try:
        async with get_db_connection() as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE,
                    hashed_password TEXT,
                    display_name TEXT,
                    created_at TEXT,
                    auth_provider TEXT DEFAULT 'local',
                    provider_id TEXT
                )
            """)
    except Exception as e:
        print(f"WARNING: DB initialization failed, but app will continue: {e}")

async def get_user_by_email(email: str):
    async with get_db_connection() as db:
        return await db.fetchrow("SELECT * FROM users WHERE email = $1", email)

async def create_user(user_id: str, email: str, hashed_password: str, display_name: str, created_at: str, auth_provider: str = 'local', provider_id: str = None):
    async with get_db_connection() as db:
        await db.execute(
            "INSERT INTO users (id, email, hashed_password, display_name, created_at, auth_provider, provider_id) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            user_id, email, hashed_password, display_name, created_at, auth_provider, provider_id
        )

async def get_user_by_provider_id(provider: str, provider_id: str):
    async with get_db_connection() as db:
        return await db.fetchrow("SELECT * FROM users WHERE auth_provider = $1 AND provider_id = $2", provider, provider_id)

async def get_user_by_id(user_id: str):
    async with get_db_connection() as db:
        return await db.fetchrow("SELECT * FROM users WHERE id = $1", user_id)

