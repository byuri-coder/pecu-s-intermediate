
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
  const signatureData = {
    uid: userId,
    email: userEmail,
    contratoId: assetId,
    hash: contractHash,
    'data/hora': new Date().toISOString(), // Simulating serverTimestamp
    status: 'assinado',
  };
  console.log(signatureData);
  
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
  } catch (error) {
    console.error("Erro ao registrar assinatura no Firestore:", error);
    return { success: false, message: "Falha ao registrar a assinatura." };
  }
  */

  // Mocking a successful response after a short delay
  await new Promise(resolve => setTimeout(resolve, 500));
  firestoreLog.push({ ...data, signedAt: new Date() });

  // Send email notification after logging the signature
  try {
    console.log("🚀 Sending email notification...");
    // The base URL for fetch needs to be absolute on the server side.
    const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';
    await fetch(`${baseUrl}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorEmail: "noreply.pecuscontratos@gmail.com",
        buyerEmail: userEmail,
        subject: "📜 Contrato assinado com sucesso!",
        htmlContent: `
          <h2>Olá,</h2>
          <p>Seu contrato <strong>${assetId}</strong> foi assinado com sucesso.</p>
          <p>Hash de verificação: <code>${contractHash}</code></p>
          <p>Data/hora: ${new Date().toLocaleString("pt-BR")}</p>
          <br/>
          <p>Atenciosamente,<br>Equipe PECU'S</p>
        `
      }),
    });
    console.log("✅ Email notification sent.");
  } catch (emailError) {
      console.error("❌ Failed to send email notification:", emailError);
      // We don't return an error here, as the primary action (signing) was successful.
      // In a real app, you might add this to a retry queue.
  }

  return { success: true, message: "Assinatura registrada com sucesso." };
}


