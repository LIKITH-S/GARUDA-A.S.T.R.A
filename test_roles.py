import asyncio
import sys
sys.path.append('e:/Projects/GarudaASTRA/GarudaA.S.T.R.A')
from services.backend.core.database import SessionLocal
from database.models.auth import Role
from sqlalchemy.future import select

async def run():
    async with SessionLocal() as session:
        roles = (await session.execute(select(Role))).scalars().all()
        print("ROLES IN DB:", [r.name for r in roles])

asyncio.run(run())
