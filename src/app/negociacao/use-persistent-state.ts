'use client';
import { useState, useEffect } from 'react';

export function usePersistentState<T>(key: string, initialValue: T): readonly [T, (value: T | ((val: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
        localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
        console.error("Failed to save state to localStorage", e);
    }
  }, [key, state]);

  return [state, setState] as const;
}
