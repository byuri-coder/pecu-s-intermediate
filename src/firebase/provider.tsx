'use client';
// src/firebase/provider.tsx
import {
  FirebaseApp,
  getApp,
  initializeApp,
  type FirebaseOptions,
} from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  Auth,
  inMemoryPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  getFirestore,
  Firestore,
} from 'firebase/firestore';
import * as React from 'react';
import { firebaseConfig } from './config';
import { FirebaseErrorListener } from '../components/FirebaseErrorListener';
import { errorEmitter } from './error-emitter';

// Define the context shape
interface FirebaseContextValue {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Create the context
export const FirebaseContext = React.createContext<
  FirebaseContextValue | undefined
>(undefined);

// Define the provider component
export function FirebaseProvider({
  children,
  ...props
}: { children: React.ReactNode } & FirebaseContextValue) {
  return (
    <FirebaseContext.Provider value={props}>
      <FirebaseErrorListener errorEmitter={errorEmitter} />
      {children}
    </FirebaseContext.Provider>
  );
}

// Custom hook to use the Firebase context
export function useFirebase() {
  const context = React.useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

// Hooks for specific Firebase services
export function useFirebaseApp() {
  return useFirebase().firebaseApp;
}

export function useFirestore() {
  return useFirebase().firestore;
}

export function useAuth() {
  return useFirebase().auth;
}
