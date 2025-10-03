import type { CarbonCredit, TaxCredit, RuralLand, Operation, Petition, Invoice } from '@/lib/types';

export const placeholderCredits: CarbonCredit[] = [
  {
    id: 'carb-001',
    sellerName: 'Agrofloresta Viva Ltda.',
    creditType: 'Forestry',
    quantity: 10000,
    location: 'Amazonas, Brasil',
    pricePerCredit: 25.50,
    vintage: '2023',
    standard: 'Verra',
    projectOverview: 'Projeto de reflorestamento em áreas degradadas, focado na recuperação da biodiversidade e captura de carbono na bacia amazônica.',
    status: 'Ativo',
  },
  {
    id: 'carb-002',
    sellerName: 'Energia Limpa S.A.',
    creditType: 'Renewable Energy',
    quantity: 50000,
    location: 'Bahia, Brasil',
    pricePerCredit: 32.00,
    vintage: '2022',
    standard: 'Gold Standard',
    projectOverview: 'Desenvolvimento de um parque eólico de grande escala para fornecer energia limpa à rede nacional, reduzindo a dependência de combustíveis fósseis.',
    status: 'Ativo',
  },
];

export const placeholderTaxCredits: TaxCredit[] = [
    {
    id: 'tax-001',
    sellerName: 'Indústria Têxtil Fiação de Ouro S.A.',
    taxType: 'ICMS',
    amount: 150000.00,
    price: 135000.00,
    location: 'São Paulo, SP',
    status: 'Disponível',
  },
];

export const placeholderRuralLands: RuralLand[] = [
  {
    id: 'land-001',
    title: 'Fazenda Vale Sereno',
    description: 'Propriedade com dupla aptidão (gado e soja), com boa infraestrutura, incluindo curral, casa sede e alojamento para funcionários. Rica em recursos hídricos, com rios e nascentes preservadas. Documentação 100% em dia (CAR, GEO, ITR).',
    owner: 'José Carlos Pereira',
    sizeHa: 1200,
    businessType: 'Venda',
    location: 'Cuiabá, Mato Grosso',
    images: ['/placeholders/land1-1.jpg', '/placeholders/land1-2.jpg'],
    documentation: 'Completa, com CAR, GEO e ITR.',
    registration: 'CRI Cuiabá 12.345',
    price: 36000000,
    status: 'Disponível',
  },
  {
    id: 'land-002',
    title: 'Sítio Águas Claras',
    description: 'Área ideal para arrendamento de pecuária, com pastagem formada e cercas em bom estado. Fácil acesso por estrada de terra bem conservada. Disponível para contratos de médio a longo prazo.',
    owner: 'Maria Antônia Silveira',
    sizeHa: 350,
    businessType: 'Arrendamento',
    location: 'Goiânia, Goiás',
    images: ['/placeholders/land2-1.jpg'],
    documentation: 'Básica, disponível para consulta.',
    registration: 'CRI Goiânia 9.876',
    price: 450,
    status: 'Disponível',
  },
  {
    id: 'land-003',
    title: 'Gleba Diamante Bruto',
    description: 'Propriedade com alto potencial para mineração de ouro e diamantes, com estudos geológicos preliminares indicando veios promissores. Busca-se parceiro para investimento e exploração conjunta ou venda da área de concessão.',
    owner: 'Mineradora Rocha Forte Ltda.',
    sizeHa: 500,
    businessType: 'Mineração',
    location: 'Itaituba, Pará',
    images: ['/placeholders/land3-1.jpg'],
    documentation: 'Alvará de pesquisa DNPM disponível.',
    registration: 'Concessão DNPM 54321/2022',
    price: 25000000,
    status: 'Negociando',
  },
  {
    id: 'land-004',
    title: 'Fazenda Divisa',
    description: 'Excelente propriedade para agricultura, com topografia plana e solo de alta fertilidade. Busca-se permuta por imóveis urbanos comerciais em capitais (São Paulo, Rio de Janeiro). Aberto a propostas e negociação de torna.',
    owner: 'Empreendimentos Rurais S.A.',
    sizeHa: 2500,
    businessType: 'Permuta',
    location: 'Balsas, Maranhão',
    images: ['/placeholders/land4-1.jpg', '/placeholders/land4-2.jpg'],
    documentation: 'Completa e regularizada.',
    registration: 'CRI Balsas 55.443',
    price: 100000000,
    status: 'Disponível',
  }
];

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

export const placeholderOperations: Operation[] = [
  { id: 'op-001', date: new Date(currentYear, currentMonth, 2), type: 'Venda', assetType: 'Crédito de Carbono', description: 'Venda de 1,000 créditos de carbono Verra 2023', value: 25500.00 },
  { id: 'op-002', date: new Date(currentYear, currentMonth, 5), type: 'Compra', assetType: 'Crédito Tributário', description: 'Aquisição de saldo credor de ICMS', value: 135000.00 },
  { id: 'op-003', date: new Date(currentYear, currentMonth, 15), type: 'Venda', assetType: 'Terra Rural', description: 'Arrendamento da Fazenda Águas Claras', value: 157500.00 },
  { id: 'op-004', date: new Date(currentYear, currentMonth, 15), type: 'Compra', assetType: 'Crédito de Carbono', description: 'Compra de 500 créditos Gold Standard 2022', value: 16000.00 },
];


export const placeholderPetitions: Petition[] = [
  {
    id: 'pet-001',
    title: 'Transferência de Crédito ICMS - Jan/2024',
    status: 'finalizado',
    updatedAt: new Date(2024, 0, 15).toISOString(),
    representativeState: 'SP',
    tipoOperacao: 'Exportação de Calçados',
    periodoApuracao: 'Janeiro/2024',
    creditBalance: 200000,
    negotiatedValue: 180000,
    partyCnpj: '11.222.333/0001-44',
    representativeName: 'João da Silva',
    representativeRole: 'Diretor Financeiro',
    representativeCpf: '111.222.333-44',
  },
  {
    id: 'pet-002',
    title: 'Aproveitamento de Saldo Credor - Fev/2024',
    status: 'rascunho',
    updatedAt: new Date(2024, 1, 20).toISOString(),
    representativeState: 'MG',
    tipoOperacao: 'Venda de Insumos Agropecuários',
    periodoApuracao: 'Fevereiro/2024',
    creditBalance: 50000,
    negotiatedValue: 48000,
    partyCnpj: '44.555.666/0001-77',
    representativeName: 'Maria Oliveira',
    representativeRole: 'Gerente Contábil',
    representativeCpf: '444.555.666-77',
  }
];

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
const nextMonth = new Date();
nextMonth.setMonth(nextMonth.getMonth() + 1);


export const initialInvoices: Invoice[] = [
    { id: 'FAT-001', transactionId: 'TXN-73482', description: 'Taxa de serviço - Venda de Crédito de Carbono', dueDate: '15/07/2024', value: 150.00, status: 'Pendente' },
    { id: 'FAT-002', transactionId: 'TXN-73483', description: 'Taxa de serviço - Compra de Crédito Tributário', dueDate: '10/07/2024', value: 1350.00, status: 'Paga' },
    { id: 'FAT-003', transactionId: 'TXN-73484', description: 'Taxa de serviço - Arrendamento de Terra', dueDate: '20/06/2024', value: 787.50, status: 'Em Análise' },
];
