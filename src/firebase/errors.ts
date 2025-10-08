// src/firebase/errors.ts

// Defines the context for a Firestore security rule violation.
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

// A custom error class for Firestore permission issues.
export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;
  public details: string;

  constructor(context: SecurityRuleContext) {
    const message = `FirestoreError: Missing or insufficient permissions. The following request was denied by Firestore Security Rules:`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    this.details = JSON.stringify(
      {
        auth: {
          /* In a real app, you'd populate this from the user's auth state */
          uid: 'example-uid',
          token: { name: 'John Doe' },
        },
        method: context.operation,
        path: `/databases/(default)/documents/${context.path}`,
        request: {
          resource: {
            data: context.requestResourceData,
          },
        },
      },
      null,
      2
    );
  }

  // Overriding toString to provide a formatted error message for display.
  public toString(): string {
    return `${this.message}\n${this.details}`;
  }
}
