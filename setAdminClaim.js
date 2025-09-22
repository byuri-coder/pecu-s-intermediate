// setAdminClaim.js
const admin = require('firebase-admin');

// Este script espera que a chave da conta de serviço esteja em um arquivo serviceAccountKey.json
// na mesma pasta. Lembre-se que este arquivo é sensível e não deve ir para o controle de versão.
try {
  const serviceAccount = require('./serviceAccountKey.json');
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

} catch (e) {
  console.error("Erro ao carregar 'serviceAccountKey.json'. Certifique-se de que o arquivo existe no mesmo diretório.");
  process.exit(1);
}


const uid = process.argv[2]; // passar UID como argumento na linha de comando

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
