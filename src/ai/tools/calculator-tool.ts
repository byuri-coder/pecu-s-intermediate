'use server';
/**
 * @fileOverview A Genkit tool for performing mathematical and financial calculations using a powerful AI model.
 *
 * - calculatorTool - A tool that takes a natural language query for a calculation and returns the result.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const calculatorTool = ai.defineTool(
    {
        name: 'calculatorTool',
        description: 'Performs mathematical and financial calculations. Use this for questions involving compound interest, amortization, present value (VPL), internal rate of return (TIR), cash flow, and other complex calculations. The query should be in English for the best results.',
        inputSchema: z.string().describe('The calculation query in natural language (e.g., "compound interest for a principal of R$1000 at 1% per month for 12 months")'),
        outputSchema: z.string().describe('The result of the calculation.'),
    },
    async (query) => {
        try {
            const { output } = await ai.generate({
                prompt: `Calculate the following and return only the numerical or final text result, without any extra explanation: ${query}`,
                model: 'googleai/gemini-2.5-flash',
            });
            return output!;
        } catch (e) {
            console.error("Error calling AI for calculation:", e);
            return "An error occurred while performing the calculation.";
        }
    }
);
