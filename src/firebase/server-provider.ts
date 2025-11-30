// src/firebase/server-provider.ts
import * as admin from 'firebase-admin';
import { firebaseConfig } from './config'; // Assuming config is sharable

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: firebaseConfig.databaseURL,
    });
    console.log("Firebase Admin SDK initialized with service account.");
  } else {
    // Fallback for environments without service account key (e.g., local dev without auth)
    // This allows parts of the app that don't need admin rights to still function.
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
     console.warn("Firebase Admin SDK initialized without a service account. Admin features will be limited.");
  }
}

export const getAdminApp = () => admin.app();
