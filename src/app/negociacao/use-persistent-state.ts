
'use client';

import { useState, useEffect, useCallback } from 'react';

export function usePersistentState<T>(key: string, initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialState;
        }
        try {
            const storedValue = window.localStorage.getItem(key);
            if (storedValue) {
                return JSON.parse(storedValue);
            }
            // If no stored value, set the initial state in localStorage
            window.localStorage.setItem(key, JSON.stringify(initialState));
            return initialState;
        } catch (error) {
            console.error(`Error reading or setting localStorage key “${key}”:`, error);
            return initialState;
        }
    });

    useEffect(() => {
        try {
            const serializedState = JSON.stringify(state);
            window.localStorage.setItem(key, serializedState);
        } catch (error) {
            console.error(`Error writing to localStorage key “${key}”:`, error);
        }
    }, [key, state]);

    return [state, setState];
}
