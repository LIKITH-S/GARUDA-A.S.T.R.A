# GARUDA A.S.T.R.A - Project Setup & Running Guide

This guide provides fully detailed instructions on how to set up the Python environment, install necessary dependencies, and run the FastAPI backend server.

## Prerequisites
- **Python 3.12** installed on your system.
- Ensure `python` and `pip` are accessible from your terminal/command prompt.

---

## 1. Creating the Virtual Environment

It is best practice to use a virtual environment to manage project-specific dependencies. 

1. Open your terminal or Command Prompt.
2. Navigate to the root directory of the project (e.g., `E:\ASTRA`):
   ```cmd
   cd E:\ASTRA
   ```
3. Create the virtual environment named `venv` inside the `services` directory using Python 3.12:
   ```cmd
   python -m venv services\venv
   ```
   *(Note: If your system uses `py` or `python3` instead of `python`, replace it accordingly: `py -3.12 -m venv services\venv`)*

---

## 2. Activating the Virtual Environment

Before installing packages or running the server, you must activate the virtual environment.

- **On Windows (Command Prompt):**
  ```cmd
  services\venv\Scripts\activate.bat
  ```
- **On Windows (PowerShell):**
  ```powershell
  services\venv\Scripts\Activate.ps1
  ```
- **On macOS / Linux:**
  ```bash
  source services/venv/bin/activate
  ```

Once activated, your terminal prompt should be prefixed with `(venv)`.

---

## 3. Installing Dependencies

With the virtual environment activated, install the required packages.

1. Ensure you are in the project's root directory.
2. Run the following command to install the dependencies from the `requirements.txt` file located in the `services` folder:
   ```cmd
   pip install -r services\requirements.txt
   ```
   
This will install all necessary libraries, including FastAPI, Uvicorn, OpenCV, DeepFace, and SQLAlchemy. *(If you also want to run the AI processing module, you will need to create a separate virtual environment inside `services/ai` and run `pip install -r services\ai\requirements.txt` there, which installs DeepFace, OpenCV, SciPy, and TF-Keras.)*

---

## 🚀 Test Credentials & Seeding

We have created a script to seed test users across all system roles (Admin, Dispatcher, Officer). 
You can find the login details for these users in [TEST_CREDENTIALS.md](./TEST_CREDENTIALS.md).

To run the seed script again manually (from the root folder):
```powershell
$env:PYTHONPATH="."
.\services\venv\Scripts\python database\scripts\seed_users.py
```

---

## 4. Database Setup (Alembic)

The project uses SQLAlchemy and Alembic for database migrations. 

1. Ensure you have your database credentials configured appropriately (e.g., in a `.env` file).
2. To apply the latest database migrations, navigate to the `database` directory (where `alembic.ini` is located) and run the upgrade:
   ```cmd
   cd database
   alembic upgrade head
   cd ..
   ```

---

## 5. Running the Backend Application

The backend is built with FastAPI and runs using the Uvicorn ASGI server.

1. Ensure you are in the root directory (`E:\ASTRA`) and your virtual environment is still activated.
2. Start the server using Uvicorn:
   ```cmd
   uvicorn services.backend.main:app --reload
   ```
   
### Explanation of the run command:
- `uvicorn`: The lightning-fast ASGI server.
- `services.backend.main:app`: Tells Uvicorn to look inside the `services/backend/main.py` file for the `app` instance (the FastAPI application).
- `--reload`: Enables hot-reloading so the server automatically restarts when you make code changes (useful for development).

---

## 6. Accessing the Application

Once the server starts successfully, it will display a local URL (typically `http://127.0.0.1:8000`).

- **Health Check**: Verify the server is running by visiting:
  [http://127.0.0.1:8000/health/live](http://127.0.0.1:8000/health/live)
- **Interactive API Documentation (Swagger UI)**: FastAPI auto-generates interactive documentation. Access it at:
  [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
