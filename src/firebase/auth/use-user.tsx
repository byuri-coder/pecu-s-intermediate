// src/firebase/auth/use-user.tsx
'use client';
import { onAuthStateChanged, type User } from 'firebase/auth';
import * as React from 'react';
import { useAuth } from '../provider';
import { Usuario } from '@/models/Usuario';

export type UserWithMongo = User & { mongo?: InstanceType<typeof Usuario> }

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = React.useState<UserWithMongo | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const res = await fetch(`/api/usuarios/get/${firebaseUser.uid}`);
            const data = await res.json();
            if (data.ok) {
              setUser({ ...firebaseUser, mongo: data.usuario });
            } else {
              setUser(firebaseUser); // fallback to firebase user only
            }
          } catch (e) {
            console.error("Failed to fetch mongo user data", e);
            setUser(firebaseUser); // fallback
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
