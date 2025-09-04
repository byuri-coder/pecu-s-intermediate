'use server';

/**
 * @fileOverview This file defines a Genkit flow for the financial and tax assistant agent.
 *
 * - financialAgent - A function that takes a user query and returns a text-based answer.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export async function financialAgent(query: string): Promise<string> {
  return financialAgentFlow(query);
}

const prompt = ai.definePrompt({
  name: 'financialAgentPrompt',
  input: { schema: z.string() },
  output: { schema: z.string() },
  prompt: `You are an expert financial and tax assistant for a Brazilian SaaS platform called "PECU'S INTERMEDIATE". Your goal is to provide clear, accurate, and helpful answers to user queries.

IMPORTANT: You are an assistant. Do not perform the actual calculation here. Your role is to interpret the user's request and explain the concepts. For now, you will simulate a response. In the future, you will be connected to specialized tools for precise calculations.

User query: {{{input}}}

Based on the query, provide a helpful, explanatory response. If it's a calculation, explain how it would be done and give a simulated result.

Example Response for "Qual o montante de juros compostos para um principal de R$1000 a 1% ao mês por 12 meses?":
"Para calcular os juros compostos, usamos a fórmula M = P * (1 + i)^n, onde M é o montante, P o principal, i a taxa e n o tempo.

No seu caso:
- P = R$1.000,00
- i = 1% (ou 0,01)
- n = 12 meses

O cálculo seria: M = 1000 * (1 + 0.01)^12.

[SIMULAÇÃO] O montante final seria aproximadamente R$ 1.126,83. A diferença de R$ 126,83 corresponde aos juros ganhos no período."

Respond to the user's query now.`,
});

const financialAgentFlow = ai.defineFlow(
  {
    name: 'financialAgentFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (query) => {
    const { output } = await prompt(query);
    return output!;
  }
);
