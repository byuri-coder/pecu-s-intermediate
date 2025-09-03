'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting a fair market price for carbon credits based on their attributes.
 *
 * - suggestCreditPrice - A function that takes carbon credit attributes as input and returns a suggested price.
 * - SuggestCreditPriceInput - The input type for the suggestCreditPrice function.
 * - SuggestCreditPriceOutput - The return type for the suggestCreditPrice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCreditPriceInputSchema = z.object({
  creditType: z.string().describe('The type of carbon credit.'),
  location: z.string().describe('The location of the carbon credit project.'),
  vintage: z.string().describe('The vintage or year of issuance of the carbon credit.'),
  quantity: z.number().describe('The quantity of carbon credits being offered.'),
});
export type SuggestCreditPriceInput = z.infer<typeof SuggestCreditPriceInputSchema>;

const SuggestCreditPriceOutputSchema = z.object({
  suggestedPrice: z.string().describe('The suggested fair market price for the carbon credits.'),
  reasoning: z.string().describe('The reasoning behind the suggested price.'),
});
export type SuggestCreditPriceOutput = z.infer<typeof SuggestCreditPriceOutputSchema>;

export async function suggestCreditPrice(input: SuggestCreditPriceInput): Promise<SuggestCreditPriceOutput> {
  return suggestCreditPriceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCreditPricePrompt',
  input: {schema: SuggestCreditPriceInputSchema},
  output: {schema: SuggestCreditPriceOutputSchema},
  prompt: `You are an expert in carbon credit valuation. Based on the attributes of the carbon credits provided, suggest a fair market price.

Credit Type: {{{creditType}}}
Location: {{{location}}}
Vintage: {{{vintage}}}
Quantity: {{{quantity}}}

Consider recent market trends, similar credit listings, and any relevant factors to determine the price. Provide a brief reasoning for your suggested price.

Format your response as follows:
Suggested Price: <price>
Reasoning: <reasoning>`,
});

const suggestCreditPriceFlow = ai.defineFlow(
  {
    name: 'suggestCreditPriceFlow',
    inputSchema: SuggestCreditPriceInputSchema,
    outputSchema: SuggestCreditPriceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
