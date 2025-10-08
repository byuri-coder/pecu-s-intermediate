// src/firebase/error-emitter.ts
import mitt from 'mitt';
import { FirestorePermissionError } from './errors';

type Events = {
  'permission-error': FirestorePermissionError;
};

export const errorEmitter = mitt<Events>();
