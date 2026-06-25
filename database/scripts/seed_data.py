import asyncio
import sys
import os

# Add the root directory to sys.path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database.db.session import AsyncSessionLocal
from database.models.auth import Role, User
from database.models.personnel import Officer, DispatchUnit
from database.models.infrastructure import Location, CameraFeed

async def seed_data():
    async with AsyncSessionLocal() as session:
        print("Seeding roles...")
        roles = [
            Role(name="Admin", permissions="*"),
            Role(name="Control Room Operator", permissions="read,write,dispatch"),
            Role(name="Patrol Officer", permissions="read,update_status")
        ]
        session.add_all(roles)
        await session.commit()
        
        # Retrieve roles
        admin_role = (await session.execute(select(Role).where(Role.name == "Admin"))).scalar_one()
        officer_role = (await session.execute(select(Role).where(Role.name == "Patrol Officer"))).scalar_one()

        print("Seeding users...")
        admin_user = User(
            email="admin@garuda.local",
            hashed_password="hashed_password_mock", # In real app, use passlib to hash "admin123"
            full_name="System Admin",
            role_id=admin_role.id
        )
        officer_user = User(
            email="officer1@garuda.local",
            hashed_password="hashed_password_mock",
            full_name="Rajesh Kumar",
            role_id=officer_role.id
        )
        session.add_all([admin_user, officer_user])
        await session.commit()

        print("Seeding dispatch units...")
        unit_alpha = DispatchUnit(name="Alpha-1", status="Available")
        session.add(unit_alpha)
        await session.commit()

        print("Seeding officers...")
        officer = Officer(
            user_id=officer_user.id,
            badge_number="GAR-001",
            unit_type="Patrol Vehicle",
            status="On Duty",
            dispatch_unit_id=unit_alpha.id
        )
        session.add(officer)
        await session.commit()

        print("Seeding locations and cameras...")
        loc1 = Location(name="Main Gate Junction", latitude=28.6139, longitude=77.2090)
        session.add(loc1)
        await session.commit()

        cam1 = CameraFeed(
            name="CAM-MG-01",
            stream_url="rtsp://mock-stream-url",
            status="Online",
            location_id=loc1.id
        )
        session.add(cam1)
        await session.commit()
        
        print("Seed data completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
