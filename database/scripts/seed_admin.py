import sys
import os
import asyncio
from uuid import uuid4

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from services.backend.core.security import get_password_hash
from database.db.session import AsyncSessionLocal
from database.models.auth import User, Role
from sqlalchemy.future import select

async def seed_admin():
    async with AsyncSessionLocal() as session:
        # Check if admin role exists
        result = await session.execute(select(Role).where(Role.name == "admin"))
        admin_role = result.scalar_one_or_none()
        
        if not admin_role:
            print("Creating Admin role...")
            admin_role = Role(id=str(uuid4()), name="admin", permissions="all")
            session.add(admin_role)
            await session.commit()
            await session.refresh(admin_role)

        # Check if admin user exists
        result = await session.execute(select(User).where(User.email == "admin@astra.gov"))
        admin = result.scalar_one_or_none()
        
        if admin:
            print("Admin user already exists!")
            return

        print("Creating Super Admin...")
        new_admin = User(
            id=str(uuid4()),
            email="admin@astra.gov",
            hashed_password=get_password_hash("Admin@123"),
            full_name="System Administrator",
            role_id=admin_role.id
        )
        
        session.add(new_admin)
        await session.commit()
        print("Super Admin created successfully:")
        print("Email: admin@astra.gov")
        print("Password: Admin@123")

if __name__ == "__main__":
    asyncio.run(seed_admin())
