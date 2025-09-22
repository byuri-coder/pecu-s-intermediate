import admin from 'firebase-admin';

// Esta configuração de inicialização presume que as variáveis de ambiente
// GOOGLE_APPLICATION_CREDENTIALS ou FIREBASE_CONFIG estão configuradas no ambiente de servidor.
// Em um ambiente de desenvolvimento local, você pode precisar apontar para a chave de serviço.

const serviceAccountKey = process.env.FIREBASE_KEY
  ? JSON.parse(process.env.FIREBASE_KEY)
  : undefined; // Em produção, use variáveis de ambiente.

if (!admin.apps.length) {
  admin.initializeApp({
    credential: serviceAccountKey
      ? admin.credential.cert(serviceAccountKey)
      : admin.credential.applicationDefault(), // Usa as credenciais padrão do ambiente
  });
}

export const firebaseAdmin = admin;
