// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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
