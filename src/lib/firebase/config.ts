import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0mqzb-1cAZWD9QhIIawH2F0PkUYD7-Jc",
  authDomain: "matchday-a4456.firebaseapp.com",
  projectId: "matchday-a4456",
  storageBucket: "matchday-a4456.firebasestorage.app",
  messagingSenderId: "63812378962",
  appId: "1:63812378962:web:e8e650c991544240b9da8b"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
