'use server';

// /app/api/contract-status/route.ts
import { NextResponse } from "next/server";

// Usando um Map para simular um armazenamento em memória no servidor.
// Em um ambiente de produção real, isso poderia ser substituído por Redis, um banco de dados temporário,
// ou uma coleção específica no Firestore para estados voláteis.
const contractsStatus = new Map<string, { buyer: 'pending' | 'validated' | 'expired', seller: 'pending' | 'validated' | 'expired' }>();

/**
 * GET: Retorna o status atual de validação de um contrato.
 * O frontend usa essa rota para fazer polling e verificar se o status mudou.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const assetId = searchParams.get("assetId");

  if (!assetId) {
    return NextResponse.json({ error: "assetId é obrigatório" }, { status: 400 });
  }

  if (!contractsStatus.has(assetId)) {
    contractsStatus.set(assetId, { buyer: 'pending', seller: 'pending' });
  }

  const status = contractsStatus.get(assetId);
  return NextResponse.json({ status });
}

/**
 * POST: Inicia ou atualiza o status de um contrato.
 * Chamado pelo frontend ao enviar o e-mail de verificação para registrar que um link foi enviado.
 */
export async function POST(req: Request) {
  const { assetId, role } = await req.json();

  if (!assetId || !role) {
    return NextResponse.json({ error: "assetId e role são obrigatórios" }, { status: 400 });
  }

  if (!contractsStatus.has(assetId)) {
    contractsStatus.set(assetId, { buyer: 'pending', seller: 'pending' });
  }
  
  // Aqui apenas registramos que o processo começou, não que foi validado.
  // A validação real acontece na rota /api/verify-acceptance

  return NextResponse.json({ success: true, message: `Processo de validação para ${role} iniciado.` });
}


/**
 * Função interna (não uma rota) para ser chamada pela API de verificação.
 * Atualiza o status do contrato no Map em memória.
 * @param assetId - O ID do ativo/contrato.
 * @param role - 'buyer' ou 'seller'.
 */
export async function validateContractInMemory(assetId: string, role: 'buyer' | 'seller') {
  if (!contractsStatus.has(assetId)) {
    contractsStatus.set(assetId, { buyer: 'pending', seller: 'pending' });
  }

  const status = contractsStatus.get(assetId);
  if (status) {
    status[role] = 'validated';
    contractsStatus.set(assetId, status);
  }
}
