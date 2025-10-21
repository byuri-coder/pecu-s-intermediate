
import type { CarbonCredit, TaxCredit, RuralLand, Operation, Petition, Invoice } from '@/lib/types';

export const placeholderCredits: CarbonCredit[] = [
    {
        id: 'credit-001',
        sellerName: 'Fazenda Rio Verde',
        creditType: 'Forestry',
        quantity: 15000,
        location: 'Mato Grosso, Brasil',
        pricePerCredit: 25.50,
        vintage: '2023',
        standard: 'Verra',
        projectOverview: 'Projeto de reflorestamento em área de pastagem degradada, focado em espécies nativas para recuperação da biodiversidade e captura de carbono.',
        status: 'Disponível',
        ownerId: 'seller_abc',
        createdAt: new Date().toISOString(),
    }
];

export const placeholderTaxCredits: TaxCredit[] = [
    {
        id: 'tax-001',
        sellerName: 'Indústria Têxtil Fictícia S.A.',
        taxType: 'ICMS',
        amount: 250000.00,
        price: 225000.00,
        location: 'São Paulo, SP',
        status: 'Disponível',
        ownerId: 'seller_def',
        createdAt: new Date().toISOString(),
    }
];

export const placeholderRuralLands: RuralLand[] = [
    {
        id: 'land-001',
        title: 'Fazenda para Pecuária em Goiás',
        description: 'Propriedade com 1.200 hectares, totalmente formada em pastagem, com diversas divisões de pasto, aguadas em todos os piquetes, curral completo e sede funcional. Ideal para cria, recria e engorda.',
        owner: 'Agropecuária Cerrado',
        sizeHa: 1200,
        businessType: 'Venda',
        location: 'Goiás, Brasil',
        images: [{ url: 'https://picsum.photos/seed/land-001/800/600', type: 'image', alt: 'Fazenda em Goiás' }],
        documentation: 'CAR, GEO, ITR em dia.',
        registration: 'CRI 12.345',
        price: 36000000.00,
        status: 'Disponível',
        ownerId: 'seller_ghi',
        createdAt: new Date().toISOString(),
    }
];

export const placeholderOperations: Operation[] = [];

export const placeholderPetitions: Petition[] = [];

export const initialInvoices: Invoice[] = [];
