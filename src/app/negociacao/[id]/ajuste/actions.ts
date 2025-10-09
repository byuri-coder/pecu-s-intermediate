
'use server';

import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { app } from "@/lib/firebase";

// This server action is responsible for initializing the contract in Firestore
// and logging the contract hash for integrity verification.
export async function logContractSignature(data: {
  userId: string;
  userEmail: string;
  contractHash: string;
  assetId: string;
}) {
  const { userEmail, contractHash, assetId } = data;

  if (!userEmail) {
    throw new Error("User email is required to log contract signature.");
  }

  console.log("Logging contract signature to Firestore");

  try {
    const db = getFirestore(app);
    // Use the user's email as the document ID in the 'usuarios' collection
    // and the assetId for the contract document within the 'contratos' subcollection.
    const contractRef = doc(db, 'usuarios', userEmail, 'contratos', assetId);
    
    // Create or merge the contract document
    await setDoc(contractRef, {
      assetId: assetId,
      contractHash: contractHash,
      createdBy: userEmail,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'pending_signatures', // Initial status
      acceptances: {
        buyer: { accepted: false, email: null, acceptedAt: null },
        seller: { accepted: false, email: null, acceptedAt: null },
      }
    }, { merge: true });

    console.log(`Contract document initialized/updated in Firestore at: usuarios/${userEmail}/contratos/${assetId}`);

  } catch (error) {
    console.error("Erro ao registrar assinatura no Firestore:", error);
    return { success: false, message: "Falha ao registrar a assinatura." };
  }
  
  return { success: true, message: "Assinatura registrada e contrato iniciado com sucesso." };
}
