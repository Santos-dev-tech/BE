import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAabN5AygCwFwXEPVc67fbneJWgVZ-38UA",
  authDomain: "beautyexpres-2f9c5.firebaseapp.com",
  projectId: "beautyexpres-2f9c5",
  storageBucket: "beautyexpres-2f9c5.firebasestorage.app",
  messagingSenderId: "5589209811",
  appId: "1:5589209811:web:849ef30cd180b1c41a7a26",
  measurementId: "G-GKSNVS1F6M",
};

// Initialize Firebase only if it hasn't been initialized already
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

// Only initialize analytics on the client side
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
