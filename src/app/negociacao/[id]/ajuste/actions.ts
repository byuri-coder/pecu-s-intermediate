
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
  const { userId, userEmail, contractHash, assetId } = data;

  console.log("Logging contract signature to Firestore");

  try {
    const db = getFirestore(app);
    const contractRef = doc(db, 'contracts', assetId);
    
    // Create or merge the contract document
    await setDoc(contractRef, {
      assetId: assetId,
      contractHash: contractHash,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'pending_signatures', // Initial status
      acceptances: {
        buyer: { accepted: false, email: null, acceptedAt: null },
        seller: { accepted: false, email: null, acceptedAt: null },
      }
    }, { merge: true });

    console.log("Contract document initialized/updated in Firestore.");

  } catch (error) {
    console.error("Erro ao registrar assinatura no Firestore:", error);
    return { success: false, message: "Falha ao registrar a assinatura." };
  }

  // Send email notification after logging the signature
  try {
    console.log("🚀 Sending email notification...");
    const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';
    await fetch(`${baseUrl}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorEmail: "noreply.pecuscontratos@gmail.com",
        buyerEmail: userEmail,
        subject: "📜 Contrato Finalizado para Autenticação",
        htmlContent: `
          <h2>Olá,</h2>
          <p>O contrato para o ativo <strong>${assetId}</strong> foi gerado e está pronto para autenticação por e-mail.</p>
          <p>Hash de verificação de integridade: <code>${contractHash}</code></p>
          <p>Data/hora: ${new Date().toLocaleString("pt-BR")}</p>
          <br/>
          <p>Atenciosamente,<br>Equipe PECU'S</p>
        `
      }),
    });
    console.log("✅ Email notification sent.");
  } catch (emailError) {
      console.error("❌ Failed to send email notification:", emailError);
      // We don't return an error here, as the primary action was successful.
  }

  return { success: true, message: "Assinatura registrada e contrato iniciado com sucesso." };
}
