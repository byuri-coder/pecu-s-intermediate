
import type { CarbonCredit, TaxCredit, RuralLand, Operation, Petition, Invoice } from '@/lib/types';

export const placeholderCredits: CarbonCredit[] = [
    {
      id: 'cc-003',
      sellerName: 'Gestão de Resíduos Urbanos',
      creditType: 'Waste Management',
      quantity: 8000,
      location: 'São Paulo, Brasil',
      pricePerCredit: 18.75,
      vintage: '2023',
      standard: 'VCS (Verified Carbon Standard)',
      projectOverview: 'Sistema inovador de captura de metano em aterro sanitário, transformando um potente gás de efeito estufa em energia e evitando sua liberação na atmosfera.',
      status: 'Ativo',
    }
];

export const placeholderTaxCredits: TaxCredit[] = [
    {
      id: 'tax-001',
      sellerName: 'Indústria Têxtil Fios de Ouro',
      taxType: 'ICMS',
      amount: 600000,
      price: 220000,
      location: 'São Paulo, SP',
      status: 'Disponível',
    }
];

export const placeholderRuralLands: RuralLand[] = [
    {
        id: 'land-005',
        title: 'Retiro da Serra',
        description: 'Propriedade de 150 hectares em região serrana, com foco em permuta por imóveis urbanos (apartamentos ou salas comerciais) em capitais. Área com potencial para turismo rural ou plantio de oliveiras/uvas.',
        owner: 'Carlos Nobre',
        sizeHa: 150,
        businessType: 'Permuta',
        location: 'Santa Catarina, SC',
        images: ['https://picsum.photos/id/10/800/600'],
        documentation: 'Completa e regularizada',
        registration: 'CRI 99.000',
        price: 4800000, // Valor de referência para permuta
        status: 'Disponível',
    }
];

export const placeholderOperations: Operation[] = [];

export const placeholderPetitions: Petition[] = [];

export const initialInvoices: Invoice[] = [];
