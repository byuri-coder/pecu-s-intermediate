import type { CarbonCredit, TaxCredit, RuralLand, Operation, Petition, Invoice } from '@/lib/types';

export const placeholderCredits: CarbonCredit[] = [
    {
      id: 'cc-001',
      sellerName: 'Florestas do Futuro S.A.',
      creditType: 'Forestry',
      quantity: 10000,
      location: 'Amazonas, Brasil',
      pricePerCredit: 35.50,
      vintage: '2022',
      standard: 'Verra',
      projectOverview: 'Projeto de Redução de Emissões por Desmatamento e Degradação Florestal (REDD+) em uma área de 150.000 hectares na Amazônia, protegendo a biodiversidade e apoiando as comunidades locais.',
      status: 'Ativo',
    }
];

export const placeholderTaxCredits: TaxCredit[] = [
    {
      id: 'tax-001',
      sellerName: 'Indústria Têxtil Fios de Ouro',
      taxType: 'ICMS',
      amount: 250000,
      price: 220000,
      location: 'São Paulo, SP',
      status: 'Disponível',
    }
];

export const placeholderRuralLands: RuralLand[] = [
  {
    id: 'land-001',
    title: 'Fazenda Vista Verde',
    description: 'Propriedade de 350 hectares com dupla aptidão (lavoura e pecuária). Possui sede, casa de funcionários, curral completo e é cortada por um rio. Terras de alta fertilidade.',
    owner: 'Agropecuária Campos Dourados',
    sizeHa: 350,
    businessType: 'Venda',
    location: 'Goiás, GO',
    images: ['1001', '1002', '1003'],
    documentation: 'Completa (CAR, Geo, Matrícula)',
    registration: 'CRI 11.222',
    price: 7000000,
    status: 'Disponível',
  },
  {
    id: 'land-002',
    title: 'Sítio das Águas',
    description: 'Área de 80 hectares ideal para arrendamento de pecuária leiteira. Pastagem formada em Tifton, divisões de pasto, e estrutura de ordenha simples. Boa de água com várias nascentes.',
    owner: 'João da Silva',
    sizeHa: 80,
    businessType: 'Arrendamento',
    location: 'Minas Gerais, MG',
    images: ['1004', '1005'],
    documentation: 'CAR e Matrícula regularizados',
    registration: 'CRI 33.444',
    price: 800, // Preço por Hectare/Ano
    status: 'Disponível',
  },
  {
    id: 'land-003',
    title: 'Gleba Diamante',
    description: 'Área de 1.200 hectares com alto potencial para mineração de ouro, conforme estudos geológicos preliminares. Documentação de pesquisa mineral em andamento. Aberto a propostas de parceria ou venda total.',
    owner: 'Mineração Pedra Bruta Ltda.',
    sizeHa: 1200,
    businessType: 'Mineração',
    location: 'Mato Grosso, MT',
    images: ['1006', '1007'],
    documentation: 'Requerimento de Pesquisa ANM',
    registration: 'CRI 55.666',
    price: 15000000,
    status: 'Disponível',
  },
  {
    id: 'land-004',
    title: 'Fazenda Chapadão',
    description: 'Grande propriedade com 2.500 hectares, atualmente com pasto degradado, mas com enorme potencial para agricultura (soja/milho) devido à topografia plana e regime de chuvas favorável. Logística excelente, próxima a rodovia asfaltada.',
    owner: 'Herdeiros de José Pereira',
    sizeHa: 2500,
    businessType: 'Venda',
    location: 'Bahia, BA',
    images: ['1008', '1009', '1010'],
    documentation: 'Inventário em fase final. CAR pronto.',
    registration: 'CRI 77.888',
    price: 25000000,
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
    images: ['1011', '1012'],
    documentation: 'Completa e regularizada',
    registration: 'CRI 99.000',
    price: 2500000, // Valor de referência para permuta
    status: 'Disponível',
  }
];

export const placeholderOperations: Operation[] = [];

export const placeholderPetitions: Petition[] = [];

export const initialInvoices: Invoice[] = [];
