'use server';

export type PaymentInfo = {
  bank: string;
  agency: string;
  account: string;
  cpf: string;
  accountType: string;
  pixKey: string;
  holder: string;
};

/**
 * Fetches sensitive payment information securely from server-side environment variables.
 * This function is a Server Action and will only execute on the server.
 */
export async function getPaymentInfo(): Promise<PaymentInfo> {
  // These variables are read from your hosting environment (e.g., Render's secret files)
  // They are NOT exposed to the client.
  const paymentInfo: PaymentInfo = {
    bank: process.env.PLATFORM_BANK || 'Não configurado',
    agency: process.env.PLATFORM_AGENCY || 'Não configurado',
    account: process.env.PLATFORM_ACCOUNT || 'Não configurado',
    cpf: process.env.PLATFORM_CPF || 'Não configurado',
    accountType: process.env.PLATFORM_ACCOUNT_TYPE || 'Não configurado',
    pixKey: process.env.PLATFORM_PIX_KEY || 'Não configurado',
    holder: process.env.PLATFORM_HOLDER || 'Não configurado',
  };

  return paymentInfo;
}
