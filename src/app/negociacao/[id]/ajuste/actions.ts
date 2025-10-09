
'use server';

import { doc, setDoc, getDoc } from "firebase/firestore";
// This is a placeholder for the actual db import
// import { db } from '@/lib/firebase-server'; // Assuming a server-side firebase instance

// Mock in-memory store for contract validation status
const contractValidationStatus = new Map<string, { buyer: 'pending' | 'validated', seller: 'pending' | 'validated' }>();

export async function validateContractPart(assetId: string, role: 'buyer' | 'seller', email: string) {
    if (!contractValidationStatus.has(assetId)) {
        contractValidationStatus.set(assetId, { buyer: 'pending', seller: 'pending' });
    }

    const status = contractValidationStatus.get(assetId);
    if (status) {
        status[role] = 'validated';
        console.log(`✅ Contrato ${assetId} validado por ${role} (${email}). Status atual:`, status);
        return { success: true, message: `Aceite do ${role} registrado.` };
    }
    return { success: false, message: 'Contrato não encontrado.' };
}

export async function getContractValidationStatus(assetId: string) {
    const status = contractValidationStatus.get(assetId) || { buyer: 'pending', seller: 'pending' };
    return status;
}

export async function saveSignedDocuments(data: {
  assetId: string;
  buyerContract: FormData;
  sellerContract: FormData;
}) {
  console.log("Saving signed documents for asset:", data.assetId);

  // In a real implementation, you would handle file uploads here to a service like Firebase Storage.
  // Then, you would save the URLs of the uploaded files to Firestore.

  // const buyerFileUrl = await uploadFile(data.buyerContract.get('file'));
  // const sellerFileUrl = await uploadFile(data.sellerContract.get('file'));

  // await setDoc(doc(db, "signedContracts", data.assetId), {
  //   buyerContractUrl: buyerFileUrl,
  //   sellerContractUrl: sellerFileUrl,
  //   signedAt: new Date(),
  // });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, message: "Documentos assinados salvos com sucesso!" };
}
