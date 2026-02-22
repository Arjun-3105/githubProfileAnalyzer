import asyncpg
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.environ.get("DATABASE_URL")

async def migrate():
    if not DB_URL:
        print("Error: DATABASE_URL environment variable is not set!")
        return
        
    print(f"Connecting to database...")
    try:
        conn = await asyncpg.connect(DB_URL)
    except Exception as e:
        print(f"Failed to connect to database: {e}")
        return

    try:
        # Add auth_provider column, default to 'local' for existing users
        await conn.execute("ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local'")
        print("Added auth_provider column")
    except asyncpg.exceptions.DuplicateColumnError as e:
        print(f"Could not add auth_provider (already exists): {e}")
    except Exception as e:
        print(f"Error adding auth_provider: {e}")

    try:
        # Add provider_id column, nullable
        await conn.execute("ALTER TABLE users ADD COLUMN provider_id TEXT")
        print("Added provider_id column")
    except asyncpg.exceptions.DuplicateColumnError as e:
        print(f"Could not add provider_id (already exists): {e}")
    except Exception as e:
        print(f"Error adding provider_id: {e}")
        
    await conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    asyncio.run(migrate())

