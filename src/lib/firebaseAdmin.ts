import admin from 'firebase-admin';

// Esta configuração de inicialização presume que a variável de ambiente
// FIREBASE_KEY (como uma string JSON) está configurada no ambiente do servidor.
// Em um ambiente de desenvolvimento local, você pode precisar apontar para a chave de serviço.

const serviceAccountKeyString = process.env.FIREBASE_KEY;

if (serviceAccountKeyString && !admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(serviceAccountKeyString);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  } catch (e) {
    console.error("Failed to parse FIREBASE_KEY or initialize Firebase Admin", e);
  }
}

export const firebaseAdmin = admin;
