// setAdminClaim.js
const admin = require("firebase-admin");

// caminho pro seu serviceAccount JSON (ajuste conforme local)
// Lembre-se: Este arquivo é sensível e não deve ser enviado para o controle de versão.
// Obtenha-o no seu console do Firebase em Configurações do Projeto > Contas de serviço.
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = process.argv[2]; // passar UID como argumento

if (!uid) {
  console.error("Uso: node setAdminClaim.js <UID_DO_USUARIO>");
  process.exit(1);
}

async function run() {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log("Claim 'admin: true' atribuída com sucesso ao UID:", uid);
    
    // Opcional: forçar revogação de tokens anteriores para que a claim seja atualizada imediatamente no cliente.
    await admin.auth().revokeRefreshTokens(uid);
    console.log("Tokens de atualização revogados para forçar o refresh do token de acesso no cliente.");
    
    process.exit(0);
  } catch (err) {
    console.error("Erro ao definir a custom claim:", err);
    process.exit(1);
  }
}

run();
