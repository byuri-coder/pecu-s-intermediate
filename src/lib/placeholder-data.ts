import type { CarbonCredit, TaxCredit, RuralLand, Operation, Petition, Invoice } from '@/lib/types';

export const placeholderCredits: CarbonCredit[] = [
  // Dados de teste removidos
];

export const placeholderTaxCredits: TaxCredit[] = [
  // Dados de teste removidos
];

export const placeholderRuralLands: RuralLand[] = [
  // Dados de teste removidos
];

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

export const placeholderOperations: Operation[] = [
  // Dados de teste removidos
];


export const placeholderPetitions: Petition[] = [
  // Dados de teste removidos
];

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
const nextMonth = new Date();
nextMonth.setMonth(nextMonth.getMonth() + 1);


export const initialInvoices: Invoice[] = [
    // Dados de teste removidos
];
