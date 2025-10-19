'use client';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { type Emitter } from 'mitt';
import {
  FirestorePermissionError,
  type SecurityRuleContext,
} from '@/firebase/errors';
import { AlertTriangle } from 'lucide-react';

type ErrorEmitter = Emitter<{
  'permission-error': FirestorePermissionError;
}>;

export function FirebaseErrorListener({
  errorEmitter,
}: {
  errorEmitter: ErrorEmitter;
}) {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error('Firestore Permission Error:', error.toString());

      toast({
        variant: 'destructive',
        title: "Firestore Security Rules",
        description: (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 font-semibold">
                 <AlertTriangle className="h-5 w-5" />
                 <span>Acesso Negado</span>
            </div>
            <pre className="mt-2 w-full rounded-md bg-slate-950 p-4 overflow-x-auto">
                <code className="text-white text-xs">{error.toString()}</code>
            </pre>
          </div>
        ),
        duration: 30000,
      });

      // Re-throwing the error to make it visible in the Next.js dev overlay
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [errorEmitter, toast]);

  return null;
}
