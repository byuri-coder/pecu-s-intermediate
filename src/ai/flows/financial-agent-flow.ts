'use server';

/**
 * @fileOverview This file defines a Genkit flow for the financial and tax assistant agent.
 *
 * - financialAgent - A function that takes a user query and returns a text-based answer.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { calculatorTool } from '../tools/calculator-tool';

export async function financialAgent(query: string): Promise<string> {
  return financialAgentFlow(query);
}

const prompt = ai.definePrompt({
  name: 'financialAgentPrompt',
  input: { schema: z.string() },
  output: { schema: z.string() },
  tools: [calculatorTool],
  prompt: `You are an expert financial and tax assistant for a Brazilian SaaS platform called "PECU'S INTERMEDIATE". Your goal is to provide clear, accurate, and helpful answers to user queries.

IMPORTANT: You are an assistant. For any mathematical or financial calculation (like compound interest, VPL, TIR, etc.), you MUST use the provided 'calculatorTool'. Do not perform calculations yourself. First, use the tool to get the precise result, and then explain the result and the methodology to the user.

User query: {{{input}}}

Based on the query, first, determine if a calculation is needed. If so, use the calculatorTool. Then, provide a helpful, explanatory response based on the tool's output or the user's general question.

Example flow for "Qual o montante de juros compostos para um principal de R$1000 a 1% ao mês por 12 meses?":
1. LLM identifies this is a compound interest calculation.
2. LLM calls 'calculatorTool' with the input: "compound interest for a principal of R$1000 at 1% per month for 12 months".
3. The tool returns a precise result (e.g., "R$ 1126.83").
4. LLM uses this result to formulate the final answer to the user, including the explanation.

Example Response:
"Para calcular os juros compostos, utilizamos a fórmula M = P * (1 + i)^n. Com base no cálculo realizado, o montante final para um principal de R$1000 a 1% ao mês por 12 meses é de R$ 1.126,83. A diferença de R$ 126,83 corresponde aos juros ganhos no período."

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
