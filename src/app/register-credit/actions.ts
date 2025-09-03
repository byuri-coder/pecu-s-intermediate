'use server';

import { suggestCreditPrice, type SuggestCreditPriceInput } from '@/ai/flows/suggest-credit-price';
import { z } from 'zod';

const FormSchema = z.object({
  creditType: z.string(),
  location: z.string(),
  vintage: z.string(),
  quantity: z.coerce.number(),
});

export async function getPriceSuggestion(data: SuggestCreditPriceInput) {
  const validatedFields = FormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      error: 'Invalid input for AI suggestion.',
    };
  }

  try {
    const result = await suggestCreditPrice(validatedFields.data);
    return { suggestion: result };
  } catch (error) {
    console.error(error);
    return {
      error: 'Failed to get price suggestion from AI.',
    };
  }
}

// Placeholder for the actual form submission logic
export async function registerCreditAction(data: FormData) {
  console.log('Form submitted!');
  console.log(Object.fromEntries(data.entries()));
  // Here you would typically:
  // 1. Validate the full form data
  // 2. Upload documentation to a storage service
  // 3. Save the credit details to a database (e.g., Firestore)
  // 4. Return a success or error message
  
  await new Promise(resolve => setTimeout(resolve, 1000));

  return { success: true, message: "Crédito cadastrado com sucesso!" };
}
