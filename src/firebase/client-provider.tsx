// src/firebase/client-provider.tsx
'use client';
import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';

// This component ensures that Firebase is initialized only once on the client
// and provides the initialized instances to the rest of the application.
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { firebaseApp, firestore, auth } = initializeFirebase();
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      firestore={firestore}
      auth={auth}
    >
      {children}
    </FirebaseProvider>
  );
}
