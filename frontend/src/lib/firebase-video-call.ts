// src/lib/firebase-video-call.ts

import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredKeys = [
  "apiKey",
  "authDomain",
  "databaseURL",
  "projectId",
  "appId",
] as const;

const missingKeys = requiredKeys.filter(
  (key) => !firebaseConfig[key]
);

if (missingKeys.length > 0) {
  throw new Error(
    `Konfigurasi Firebase belum lengkap: ${missingKeys.join(", ")}`
  );
}

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const realtimeDb = getDatabase(app);