'use server';

/**
 * @fileOverview This file defines the calculator tool for the financial agent.
 *
 * - calculatorTool - A Genkit tool that uses the Gemini model to perform calculations.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';


export const calculatorTool = ai.defineTool(
    {
      name: 'calculator',
      description: 'A calculator for performing mathematical calculations. Use this for any math-related questions.',
      inputSchema: z.object({
        expression: z.string().describe('The mathematical expression to evaluate.'),
      }),
      outputSchema: z.string().describe('The result of the calculation.'),
    },
    async (input) => {
        const prompt = `Calculate the following expression: ${input.expression}. Return only the numerical answer.`;
        const llmResponse = await ai.generate({
            prompt: prompt,
            model: 'googleai/gemini-2.5-flash',
            config: {
                temperature: 0,
            }
        });

        return llmResponse.text();
    }
);
