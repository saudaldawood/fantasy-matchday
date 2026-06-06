import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyClkIaQfO5q1aQwKPiyvzoRLQnm5RC-wRk",
  authDomain: "matchday-e447b.firebaseapp.com",
  projectId: "matchday-e447b",
  storageBucket: "matchday-e447b.firebasestorage.app",
  messagingSenderId: "914670665828",
  appId: "1:914670665828:web:9821e5ead6eb39c852df71"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
