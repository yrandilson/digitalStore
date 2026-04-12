import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate that all required environment variables are set
const requiredEnvVars = Object.keys(firebaseConfig);
const missingVars = requiredEnvVars.filter(
  (key) => !firebaseConfig[key as keyof typeof firebaseConfig]
);

if (missingVars.length > 0) {
  console.error(
    `❌ Missing Firebase environment variables: ${missingVars.join(", ")}`
  );
  console.error("📝 Make sure your .env file contains all required Firebase credentials");
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export singleton instances for use across the app
export default app;
