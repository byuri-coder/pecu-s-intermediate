'use server';

// This is a placeholder for actual Firebase imports. In a real app, you would use:
// import { getFirestore, doc, collection, addDoc, serverTimestamp } from "firebase/firestore";
// import { app } from '@/lib/firebase';

// Mock implementation to simulate Firestore
const firestoreLog: any[] = [];

// This server action is responsible for logging the contract signature details.
export async function logContractSignature(data: {
  userId: string;
  userEmail: string;
  contractHash: string;
  assetId: string;
}) {
  const { userId, userEmail, contractHash, assetId } = data;

  console.log("Logging contract signature to 'Firestore'");
  console.log({
    uid: userId,
    email: userEmail,
    contratoId: assetId,
    hash: contractHash,
    'data/hora': new Date().toISOString(), // Simulating serverTimestamp
    status: 'assinado',
  });
  
  // In a real application, you would uncomment and use the following:
  /*
  try {
    const db = getFirestore(app);
    const signatureCollection = collection(db, 'contract_signatures');
    await addDoc(signatureCollection, {
      uid: userId,
      email: userEmail,
      contratoId: assetId,
      hash: contractHash,
      'data/hora': serverTimestamp(),
      status: 'assinado'
    });
    return { success: true, message: "Assinatura registrada com sucesso." };
  } catch (error) {
    console.error("Erro ao registrar assinatura no Firestore:", error);
    return { success: false, message: "Falha ao registrar a assinatura." };
  }
  */

  // Mocking a successful response after a short delay
  await new Promise(resolve => setTimeout(resolve, 500));
  firestoreLog.push({ ...data, signedAt: new Date() });

  return { success: true, message: "Assinatura registrada com sucesso." };
}
