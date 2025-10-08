// src/firebase/firestore/use-collection.tsx
'use client';
import {
  onSnapshot,
  query,
  collection,
  type CollectionReference,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import * as React from 'react';
import { useFirestore } from '../provider';
import { useMemoFirebase } from './use-memo-firebase';

export function useCollection<T>(
  path: string | null | undefined,
  options?: {
    listen?: boolean;
  }
) {
  const { listen = true } = options || {};
  const firestore = useFirestore();

  const collectionRef = useMemoFirebase(() => {
    if (!firestore || !path) return null;
    return collection(firestore, path) as CollectionReference<T>;
  }, [firestore, path]);

  const [data, setData] = React.useState<T[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!collectionRef) {
      setData(null);
      setLoading(false);
      return;
    }

    if (!listen) {
      // Logic for non-listening query can be added here if needed
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const result = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(result);
        setLoading(false);
      },
      (err) => {
        console.error(`Error listening to collection ${collectionRef.path}`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionRef, listen]);

  return { data, loading, error };
}
