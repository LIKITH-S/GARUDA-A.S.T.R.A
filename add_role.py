import asyncio
import sys
import uuid
sys.path.append('e:/Projects/GarudaASTRA/GarudaA.S.T.R.A')
from database.db.session import AsyncSessionLocal
from database.models.auth import Role
from sqlalchemy.future import select

async def run():
    async with AsyncSessionLocal() as session:
        # Check if exists
        result = await session.execute(select(Role).where(Role.name == "officer"))
        existing = result.scalar_one_or_none()
        if existing:
            print("Role 'officer' already exists.")
            return

        role = Role(id=str(uuid.uuid4()), name="officer", permissions="read,update_status")
        session.add(role)
        await session.commit()
        print("Role 'officer' added successfully!")

asyncio.run(run())
