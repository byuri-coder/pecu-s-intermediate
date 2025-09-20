'use server';

/**
 * @fileOverview This file defines the financial agent flow.
 *
 * - financialAgentFlow - A Genkit flow that acts as a financial assistant.
 * - FinancialAgentInput - The input type for the financialAgentFlow.
 * - FinancialAgentOutput - The output type for the financialAgentFlow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { calculatorTool } from '../tools/calculator-tool';

export const FinancialAgentInputSchema = z.string();
export const FinancialAgentOutputSchema = z.string();

export type FinancialAgentInput = z.infer<typeof FinancialAgentInputSchema>;
export type FinancialAgentOutput = z.infer<typeof FinancialAgentOutputSchema>;

export async function financialAgent(input: FinancialAgentInput): Promise<FinancialAgentOutput> {
    return financialAgentFlow(input);
}


const financialAgentFlow = ai.defineFlow(
    {
        name: 'financialAgentFlow',
        inputSchema: FinancialAgentInputSchema,
        outputSchema: FinancialAgentOutputSchema,
    },
    async (prompt) => {
        const llmResponse = await ai.generate({
            prompt: prompt,
            model: 'googleai/gemini-2.5-flash',
            tools: [calculatorTool],
            config: {
                temperature: 0.3,
            },
        });

        return llmResponse.text();
    }
);
