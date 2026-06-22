# EZ Test - Examination Platform

This project is a complete, full-stack application setup running a Node.js Express backend and a React (Vite) frontend, designed to be exported and run entirely independently across both web and Android (via Capacitor).

**This app is self-contained and free from AI Studio dependencies.** 

## Prerequisites

- **Node.js**: v20 or higher
- **Android Studio**: If building the Android APK locally

## Environment Setup

1. Rename `.env.example` to `.env`.
2. Fill in the keys:
   - `GEMINI_API_KEY`: Add your Gemini API Key if testing AI Chat features.
   - `DATABASE_URL`: Add your PostgreSQL connection URL (e.g., from Neon, Supabase, or your local Postgres).
   - `VITE_API_BASE`: If you plan to test the Android app on a physical phone, set this to your computer's local IPv4 address (e.g. `http://192.168.x.x:3000`). For web-only, you can leave it blank (defaults to localhost).

## Running the Web App (Full-stack Development Mode)

To start the full-stack server with Vite middleware integrated (so your frontend and backend run together seamlessly on port 3000):

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Visit `http://localhost:3000` to see the app.

## Production Web Build

To bundle the application via ESBuild and Vite to serve seamlessly in any container or Node environment:

```bash
npm run build
npm run start
```
Go to `http://localhost:3000`.

## Building the Android Application (Capacitor)

The codebase incorporates Capacitor to compile native Android applications. Since your Android app runs on your phone, it **must** know the real IP address of your API to fetch data (it cannot use `localhost` because `localhost` refers to the phone itself!).

**1. Define your Server API URL mapping**
In your `.env` file, ensure `VITE_API_BASE` is set to your computer's local IP address and port 3000, like this:
```env
VITE_API_BASE=http://192.168.1.55:3000
```
> *(To find your IP: type `ipconfig` on Windows or `ifconfig` on Mac/Linux)*

**2. Synchronize & Prepare Android Source**
```bash
# Build the frontend pointing to the new VITE_API_BASE
npm run build

# Synchronize web assets to the Android capacitor folders
npx cap sync android
```

**3. Run on your Phone / Emulator**
Ensure your computer and phone are connected to the same Wi-Fi network. Keep your server running (`npm run dev` or `npm run start`).
```bash
# Open Android Studio
npx cap open android
```
*(From Android Studio, click the Play button to run it directly to your connected device).*

## Common Troubleshooting
* **"Connection timed out. Check if Express server is loaded":** This means the capacitor app on your phone could not reach the server. Make sure `VITE_API_BASE` is correctly set to your computer's local IP Address (`http://192.168.x.x:3000`) before running `npm run build` and `npx cap sync android`.
* **Cors Issues**: We have configured the backend using `cors()` to ensure standard local network testing does not generate cross-origin errors from your Android device.
