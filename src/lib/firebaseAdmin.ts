import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAFH8O36DKxdui3CClrJqkgEf_2YgsTOT0",
  authDomain: "pecus-intermediate.firebaseapp.com",
  databaseURL: "https://pecus-intermediate-default-rtdb.firebaseio.com",
  projectId: "pecus-intermediate",
  storageBucket: "pecus-intermediate.appspot.com",
  messagingSenderId: "667966942508",
  appId: "1:667966942508:web:df881058a5e69464175089"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
