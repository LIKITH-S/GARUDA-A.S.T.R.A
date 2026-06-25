# Garuda A.S.T.R.A - Project Guide

Welcome to the Garuda A.S.T.R.A (Advanced Security & Tactical Response Architecture) setup and execution guide. This document contains all the necessary commands to run, build, and share the various components of the system.

## 🚀 1. Starting the Services

You will need multiple terminal windows to run all parts of the system simultaneously.

### Backend (Python FastAPI)
The backend handles the core API, WebSocket connections, and database operations.
1. Open a terminal in the root directory (`GarudaA.S.T.R.A/`).
2. Activate your Python environment (if you use one).
3. Run the backend server:
   ```bash
   uvicorn services.backend.main:app --reload --host 0.0.0.0 --port 8000
   ```
   *The backend will be available at `http://localhost:8000`.*

### Web Dashboard (Next.js)
The tactical web dashboard for command centers.
1. Open a new terminal.
2. Navigate to the web dashboard directory:
   ```bash
   cd apps/web-dashboard
   ```
3. Install dependencies (if not already done):
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The dashboard will be available at `http://localhost:3000`.*

### AI Services
Depending on your setup, the AI modules (embeddings, similarity services) are integrated into the backend. Ensure your `.env` file in the root directory contains the necessary API keys (e.g., OpenAI API keys) for the AI services to function when the backend is running.

---

## 📱 2. Mobile App (React Native / Expo)

The mobile app is built with Expo and React Native, tailored for Android.

### Running the App in Dev Mode (Local Testing)
1. Open a new terminal.
2. Navigate to the mobile app directory:
   ```bash
   cd apps/mobile-app
   ```
3. Ensure your local IP address is correctly set in `apps/mobile-app/.env` for `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_WS_URL`.
4. Run the app on a connected Android device or emulator:
   ```bash
   npx expo run:android
   ```
   *Alternatively, if you want to use the Expo Go app over Wi-Fi:*
   ```bash
   npx expo start
   ```

---

## 📦 3. Building and Sharing the APK

To share the app with friends or install it permanently on devices, you need to build a standalone APK.

### Step A: Build the APK locally using EAS (Expo Application Services)
1. Navigate to the mobile app directory:
   ```bash
   cd apps/mobile-app
   ```
2. Install the EAS CLI if you haven't already:
   ```bash
   npm install -g eas-cli
   ```
3. Log in to your Expo account:
   ```bash
   eas login
   ```
4. Build the APK for Android:
   ```bash
   eas build -p android --profile preview
   ```
   *(Note: Ensure you have an `eas.json` file configured with a "preview" profile that specifies `"buildType": "apk"`)*

### Step B: Build the APK completely offline (Optional)
If you don't want to use Expo's cloud servers, you can build it locally on your machine:
1. Run the local Android build command:
   ```bash
   npx expo run:android --variant release
   ```
2. The generated APK will be located in:
   `apps/mobile-app/android/app/build/outputs/apk/release/app-release.apk`

### Step C: Sharing the APK with Friends
Once you have the `.apk` file (either downloaded from the EAS dashboard or generated locally):
1. **Direct Share:** Send the `.apk` file via WhatsApp, Telegram, Google Drive, or email.
2. **Installation:** 
   - Your friends need to download the file to their Android device.
   - When they tap the file to install it, their phone may ask for permission to "Install unknown apps". They must allow this permission for the file manager or browser they used to download it.
   - Once allowed, the app will install just like a normal app from the Play Store!

> **⚠️ Important Note on Backend Connectivity:** If your friends install the APK and you are running the backend locally on your laptop, their phones *must* be connected to the exact same Wi-Fi network as your laptop to communicate with the server. If they are far away, you will need to host your backend on a cloud provider (like Render, Heroku, or AWS) and update the `.env` URLs in the mobile app before building the APK!
