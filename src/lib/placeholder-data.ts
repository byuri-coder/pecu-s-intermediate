
import type { CarbonCredit, TaxCredit, RuralLand, Operation, Petition, Invoice } from '@/lib/types';

export const placeholderCredits: CarbonCredit[] = [
    {
      id: 'cc-001',
      sellerName: 'Florestas Nativas Ltda.',
      creditType: 'Forestry',
      quantity: 15000,
      location: 'Amazonas, Brasil',
      pricePerCredit: 12.50,
      vintage: '2023',
      standard: 'VCS (Verified Carbon Standard)',
      projectOverview: 'Projeto de reflorestamento em área degradada, visando a recuperação da biodiversidade e a captura de carbono. A iniciativa também promove o desenvolvimento social de comunidades locais.',
      status: 'Ativo',
    },
    {
      id: 'cc-002',
      sellerName: 'Energia Limpa S.A.',
      creditType: 'Renewable Energy',
      quantity: 50000,
      location: 'Bahia, Brasil',
      pricePerCredit: 25.00,
      vintage: '2022',
      standard: 'Gold Standard',
      projectOverview: 'Parque eólico de grande escala gerando energia limpa para a rede nacional, reduzindo a dependência de fontes fósseis e contribuindo para a mitigação das mudanças climáticas.',
      status: 'Ativo',
    },
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
    },
    {
      id: 'cc-004',
      sellerName: 'Fazenda Sustentável',
      creditType: 'Agriculture',
      quantity: 5000,
      location: 'Mato Grosso, Brasil',
      pricePerCredit: 35.00,
      vintage: '2024',
      standard: 'CCB (Climate, Community & Biodiversity)',
      projectOverview: 'Projeto de agricultura regenerativa que melhora a saúde do solo, aumenta a biodiversidade e sequestra carbono através de práticas de plantio direto e rotação de culturas.',
      status: 'Vendido',
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
    },
     {
      id: 'tax-002',
      sellerName: 'Comércio de Alimentos S.A.',
      taxType: 'ICMS',
      amount: 150000,
      price: 60000,
      location: 'São Paulo, SP',
      status: 'Disponível',
    },
     {
      id: 'tax-003',
      sellerName: 'Distribuidora Veloz Ltda.',
      taxType: 'ICMS',
      amount: 850000,
      price: 300000,
      location: 'São Paulo, SP',
      status: 'Negociando',
    }
];

export const placeholderRuralLands: RuralLand[] = [
    {
        id: 'land-001',
        title: 'Fazenda Rio Claro',
        description: 'Ampla propriedade com 1.200 hectares, ideal para pecuária e agricultura. Possui rio perene, sede completa e documentação em dia. Localizada a 50km da cidade mais próxima.',
        owner: 'Agropecuária Sol Nascente',
        sizeHa: 1200,
        businessType: 'Venda',
        location: 'Mato Grosso do Sul, MS',
        images: ['https://picsum.photos/id/1015/800/600'],
        documentation: 'Completa e regularizada (CAR, GEO)',
        registration: 'CRI 12.345',
        price: 12000000,
        status: 'Disponível',
    },
    {
        id: 'land-002',
        title: 'Sítio das Araucárias',
        description: 'Propriedade de 300 hectares com mata nativa preservada e área para pastagem. Ideal para arrendamento para gado de corte ou projetos de ecoturismo.',
        owner: 'Herdeiros Silva',
        sizeHa: 300,
        businessType: 'Arrendamento',
        location: 'Paraná, PR',
        images: ['https://picsum.photos/id/1016/800/600'],
        documentation: 'CAR e GEO em andamento',
        registration: 'CRI 54.321',
        price: 500, // R$500/ha/ano
        status: 'Disponível',
    },
    {
        id: 'land-003',
        title: 'Área para Mineração de Ouro',
        description: 'Área com 500 hectares e alto potencial para extração de ouro, conforme estudos geológicos preliminares. Requer licenciamento ambiental. Aberto a parcerias ou venda da concessão.',
        owner: 'Geominas Exploração Mineral',
        sizeHa: 500,
        businessType: 'Mineração',
        location: 'Pará, PA',
        images: ['https://picsum.photos/id/102/800/600'],
        documentation: 'Direitos minerais registrados na ANM',
        registration: 'Processo ANM 888.999/2022',
        price: 25000000,
        status: 'Disponível',
    },
    {
        id: 'land-004',
        title: 'Fazenda Esperança',
        description: 'Propriedade de 2.500 hectares, anteriormente usada para plantio de soja. Negociação em andamento com grande grupo do agronegócio.',
        owner: 'AgroInvest S.A.',
        sizeHa: 2500,
        businessType: 'Venda',
        location: 'Bahia, BA',
        images: ['https://picsum.photos/id/1025/800/600'],
        documentation: 'Completa',
        registration: 'CRI 77.888',
        price: 30000000,
        status: 'Negociando',
    },
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
