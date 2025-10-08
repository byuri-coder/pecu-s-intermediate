// src/firebase/firestore/use-memo-firebase.ts
import { useMemo } from 'react';
import { ref, query, type Query, type DatabaseReference } from 'firebase/database';
import {
  doc,
  collection,
  type DocumentReference,
  type CollectionReference,
} from 'firebase/firestore';
import { isEqual } from 'lodash';

// Custom hook to memoize Firebase references
export function useMemoFirebase<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
