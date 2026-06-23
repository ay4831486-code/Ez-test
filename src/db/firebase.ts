import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import fs from "fs";
import path from "path";

// Function to read config, safe for both server-side and tool environments
function getFirebaseConfig() {
  try {
    const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn("Could not read firebase-applet-config.json:", err);
  }

  // Fallback to environment variables
  return {
    projectId: process.env.FIREBASE_PROJECT_ID || "citric-buckeye-4lsxp",
    appId: process.env.FIREBASE_APP_ID || "1:671143637219:web:aac4861f872d64c09d95d6",
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAF3GqKxbC9tpunoq_wuu2z5Ro5s51Jb2k",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "citric-buckeye-4lsxp.firebaseapp.com",
    firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID || "ai-studio-044b1206-94dc-43f9-b122-4082f49907c0",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "citric-buckeye-4lsxp.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "671143637219"
  };
}

const config = getFirebaseConfig();

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Get Firestore instance using correct custom databaseId if specified
export const firestore = config.firestoreDatabaseId 
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);
