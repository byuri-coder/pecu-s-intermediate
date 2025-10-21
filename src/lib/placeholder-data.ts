

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
      ownerId: 'user-placeholder-seller-1',
      createdAt: new Date('2023-11-10T10:00:00Z'),
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
      ownerId: 'user-placeholder-seller-2',
      createdAt: new Date('2023-10-25T14:30:00Z'),
    }
];

export const placeholderRuralLands: RuralLand[] = [
    {
        id: 'land-001',
        title: 'Fazenda Rio das Pedras',
        description: 'Propriedade de 300 hectares, ideal para gado de corte. Possui pastagem formada, casa sede, curral e acesso a rio. Documentação 100% regularizada. Localizada a 50km da cidade mais próxima.',
        owner: 'João da Silva',
        sizeHa: 300,
        businessType: 'Venda',
        location: 'Mato Grosso, MT',
        images: [{ url: 'https://picsum.photos/seed/land-001/800/600', type: 'image', alt: 'Vista da Fazenda' }],
        documentation: 'Completa e regularizada, com CAR e GEO.',
        registration: 'CRI 12.345',
        price: 7500000,
        status: 'Disponível',
        ownerId: 'user-placeholder-seller-3',
        createdAt: new Date('2024-01-15T09:00:00Z'),
    },
    {
        id: 'land-005',
        title: 'Retiro da Serra',
        description: 'Propriedade de 150 hectares em região serrana, com foco em permuta por imóveis urbanos (apartamentos ou salas comerciais) em capitais. Área com potencial para turismo rural ou plantio de oliveiras/uvas.',
        owner: 'Carlos Nobre',
        sizeHa: 150,
        businessType: 'Permuta',
        location: 'Santa Catarina, SC',
        images: [{ url: 'https://picsum.photos/id/10/800/600', type: 'image', alt: 'Paisagem da Serra' }],
        documentation: 'Completa e regularizada',
        registration: 'CRI 99.000',
        price: 4800000, // Valor de referência para permuta
        status: 'Disponível',
        ownerId: 'user-placeholder-seller-3',
        createdAt: new Date('2023-09-05T09:00:00Z'),
    }
];

export const placeholderOperations: Operation[] = [];

export const placeholderPetitions: Petition[] = [];

export const initialInvoices: Invoice[] = [];
