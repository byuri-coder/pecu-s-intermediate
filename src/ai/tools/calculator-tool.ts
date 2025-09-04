'use server';
/**
 * @fileOverview A Genkit tool for performing mathematical and financial calculations using the WolframAlpha API.
 *
 * - calculatorTool - A tool that takes a natural language query for a calculation and returns the result.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import WolframAlphaAPI from 'wolfram-alpha-api';

let waApi: any;
if (process.env.WOLFRAM_ALPHA_APP_ID) {
    waApi = WolframAlphaAPI(process.env.WOLFRAM_ALPHA_APP_ID);
} else {
    console.warn("WOLFRAM_ALPHA_APP_ID is not set. The calculator tool will not work.");
}

export const calculatorTool = ai.defineTool(
    {
        name: 'calculatorTool',
        description: 'Performs mathematical and financial calculations. Use this for questions involving compound interest, amortization, present value (VPL), internal rate of return (TIR), cash flow, and other complex calculations. The query should be in English for the best results.',
        inputSchema: z.string().describe('The calculation query in natural language (e.g., "compound interest for a principal of R$1000 at 1% per month for 12 months")'),
        outputSchema: z.string().describe('The result of the calculation.'),
    },
    async (query) => {
        if (!waApi) {
            return "WolframAlpha API is not configured.";
        }
        try {
            const result = await waApi.getShort(query);
            return result;
        } catch (e) {
            console.error("Error calling WolframAlpha API:", e);
            return "An error occurred while performing the calculation.";
        }
    }
);
