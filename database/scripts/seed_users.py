import asyncio
import uuid
import bcrypt
import os
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from dotenv import load_dotenv

# Load .env explicitly if it exists in the root
load_dotenv(".env")

from services.backend.core.config import settings

DATABASE_URL = settings.async_database_uri

# Import all models to ensure they are registered with Base.metadata
from database.models import (
    Base, User, Role, Officer, DispatchUnit, Incident, IncidentUpdate, 
    Assignment, DetectionEvent, Alert, MissingPerson, Location, 
    CameraFeed, Notification, ActivityLog, EvidenceFile, SystemStatus, AIHealthStatus
)

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

async def clear_database(session: AsyncSession):
    print("Clearing old data from database...")
    # Delete from all tables in reverse dependency order
    for table in reversed(Base.metadata.sorted_tables):
        await session.execute(table.delete())
    await session.commit()
    print("Old data cleared.")

async def seed():
    async with AsyncSessionLocal() as session:
        await clear_database(session)
        
        print("Seeding new data...")
        # Create Roles
        roles_data = [
            {"name": "admin", "permissions": "all"},
            {"name": "dispatcher", "permissions": "read,write,dispatch"},
            {"name": "officer", "permissions": "read,update_status"},
            {"name": "patrol", "permissions": "read,update_status"}
        ]
        
        role_map = {}
        for r_data in roles_data:
            role = Role(id=uuid.uuid4(), name=r_data["name"], permissions=r_data["permissions"])
            session.add(role)
            role_map[r_data["name"]] = role
        await session.flush()
        
        # Create Dispatch Units
        unit1 = DispatchUnit(id=uuid.uuid4(), name="Chetak-1", status="Available", last_known_lat=12.9716, last_known_lng=77.5946)
        unit2 = DispatchUnit(id=uuid.uuid4(), name="Garuda-2", status="Available", last_known_lat=12.9352, last_known_lng=77.6245)
        unit3 = DispatchUnit(id=uuid.uuid4(), name="Chetak-3", status="Available", last_known_lat=12.9716, last_known_lng=77.5946)
        session.add_all([unit1, unit2, unit3])
        await session.flush()

        # Users Data
        users_data = [
            {
                "email": "admin@astra.gov",
                "password": "Password123!",
                "full_name": "System Admin",
                "role_name": "admin"
            },
            {
                "email": "dispatcher@astra.gov",
                "password": "Password123!",
                "full_name": "Central Dispatcher",
                "role_name": "dispatcher"
            },
            {
                "email": "officer1@astra.gov",
                "password": "Password123!",
                "full_name": "Inspector Vikram Rathore",
                "role_name": "officer",
                "badge": "BADGE-101",
                "unit_type": "Patrol",
                "unit": unit1
            },
            {
                "email": "officer2@astra.gov",
                "password": "Password123!",
                "full_name": "Inspector Priya Singh",
                "role_name": "officer",
                "badge": "BADGE-202",
                "unit_type": "K9 Unit",
                "unit": unit2
            },
            {
                "email": "patrol@astra.gov",
                "password": "Password123!",
                "full_name": "Patrol Officer Arjun",
                "role_name": "patrol",
                "badge": "BADGE-303",
                "unit_type": "Patrol",
                "unit": unit3
            }
        ]
        
        markdown_content = "# Garuda A.S.T.R.A Test Credentials\n\nHere are the seeded test users for each role:\n\n"
        
        officers = []
        dispatcher_id = None
        for u_data in users_data:
            user = User(
                id=uuid.uuid4(),
                email=u_data["email"],
                hashed_password=get_password_hash(u_data["password"]),
                full_name=u_data["full_name"],
                role_id=role_map[u_data["role_name"]].id
            )
            session.add(user)
            await session.flush()
            
            if u_data["role_name"] == "dispatcher":
                dispatcher_id = user.id
            
            # If officer, create officer record
            if u_data["role_name"] == "officer":
                officer = Officer(
                    id=uuid.uuid4(),
                    user_id=user.id,
                    badge_number=u_data["badge"],
                    unit_type=u_data["unit_type"],
                    dispatch_unit_id=u_data["unit"].id,
                    status="Off Duty",
                    contact_info="9876543210"
                )
                session.add(officer)
                officers.append(officer)
                await session.flush()
                
            markdown_content += f"### {u_data['full_name']} ({u_data['role_name'].capitalize()})\n"
            markdown_content += f"- **Email**: `{u_data['email']}`\n"
            markdown_content += f"- **Password**: `{u_data['password']}`\n\n"
        
        # Seed Locations
        loc1 = Location(id=uuid.uuid4(), name="MG Road Junction", latitude=12.9716, longitude=77.5946, address="MG Road, Bengaluru")
        loc2 = Location(id=uuid.uuid4(), name="Cubbon Park Entrance", latitude=12.9352, longitude=77.6245, address="Cubbon Park, Bengaluru")
        session.add_all([loc1, loc2])
        await session.flush()
        
        # Seed Cameras
        cam1 = CameraFeed(id=uuid.uuid4(), name="MG Road Cam 1", location_id=loc1.id, status="Online", stream_url="rtsp://demo/1")
        cam2 = CameraFeed(id=uuid.uuid4(), name="Cubbon Park Cam 1", location_id=loc2.id, status="Online", stream_url="rtsp://demo/2")
        session.add_all([cam1, cam2])

        # Seed Missing Persons
        mp1 = MissingPerson(
            id=uuid.uuid4(), case_number="CAS-2026-001", full_name="Ananya Sharma", age=28, gender="Female",
            description="Wearing a red jacket.", last_seen_location="Cubbon Park",
            last_seen_at=datetime.now(timezone.utc) - timedelta(days=1), priority="High", status="Reported"
        )
        mp2 = MissingPerson(
            id=uuid.uuid4(), case_number="CAS-2026-002", full_name="Amit Patel", age=45, gender="Male",
            description="Tall, wearing glasses.", last_seen_location="MG Road",
            last_seen_at=datetime.now(timezone.utc) - timedelta(hours=5), priority="Normal", status="Reported"
        )
        session.add_all([mp1, mp2])

        # Seed Incidents
        inc1 = Incident(
            id=uuid.uuid4(), title="Robbery at MG Road", description="Armed robbery reported at convenience store.",
            severity="High", status="Active", 
            location_id=loc1.id
        )
        session.add(inc1)

        await session.commit()
        
        with open("TEST_CREDENTIALS.md", "w") as f:
            f.write(markdown_content)
            
        print("Successfully seeded all mock data and created TEST_CREDENTIALS.md")

if __name__ == "__main__":
    asyncio.run(seed())
