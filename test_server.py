import asyncio
import httpx

async def test_api():
    async with httpx.AsyncClient() as client:
        # Test Health
        try:
            r = await client.get("http://127.0.0.1:8000/health/live")
            print("Health endpoint response:", r.status_code, r.json())
        except Exception as e:
            print("Failed to reach health endpoint. Is uvicorn running?", e)
            return

        # Test Login
        print("\nTesting Login endpoint...")
        login_data = {
            "username": "admin@astra.gov",
            "password": "Admin@123"
        }
        r = await client.post("http://127.0.0.1:8000/api/v1/auth/login", data=login_data)
        
        if r.status_code == 200:
            print("Login SUCCESS!")
            data = r.json()
            print("Role:", data.get("role"))
            print("Token Type:", data.get("token_type"))
            print("Access Token:", data.get("access_token")[:30] + "...")
        else:
            print("Login FAILED!")
            print("Response:", r.status_code, r.text)

if __name__ == "__main__":
    asyncio.run(test_api())
