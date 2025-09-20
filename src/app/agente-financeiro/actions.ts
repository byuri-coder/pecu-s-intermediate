'use server';

import { financialAgent } from "@/ai/flows/financial-agent-flow";

export async function getFinancialAnalysis(prompt: string) {
    try {
        const analysis = await financialAgent(prompt);
        return { success: true, analysis };
    } catch (error) {
        console.error("Error getting financial analysis:", error);
        return { success: false, error: "Falha ao obter análise financeira." };
    }
}
