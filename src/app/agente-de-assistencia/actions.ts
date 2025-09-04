'use server';

import { financialAgent } from '@/ai/flows/financial-agent-flow';

export async function askFinancialAgent(query: string) {
  try {
    const result = await financialAgent(query);
    return { answer: result };
  } catch (error) {
    console.error('Error calling financial agent flow:', error);
    return {
      error: 'An error occurred while communicating with the AI agent.',
    };
  }
}
