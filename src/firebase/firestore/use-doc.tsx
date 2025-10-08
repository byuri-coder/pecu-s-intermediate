// src/firebase/firestore/use-doc.tsx
'use client';
import {
  onSnapshot,
  doc,
  type DocumentReference,
  type DocumentData,
} from 'firebase/firestore';
import * as React from 'react';
import { useFirestore } from '../provider';
import { useMemoFirebase } from './use-memo-firebase';

export function useDoc<T>(
  path: string | null | undefined,
  options?: {
    listen?: boolean;
  }
) {
  const { listen = true } = options || {};
  const firestore = useFirestore();

  const docRef = useMemoFirebase(() => {
    if (!firestore || !path) return null;
    return doc(firestore, path) as DocumentReference<T>;
  }, [firestore, path]);

  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!docRef) {
      setData(null);
      setLoading(false);
      return;
    }

    if (!listen) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() });
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(`Error listening to document ${docRef.path}`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef, listen]);

  return { data, loading, error };
}
