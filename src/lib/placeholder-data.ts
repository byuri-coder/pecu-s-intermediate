import type { CarbonCredit, TaxCredit, RuralLand, Operation, Petition, Invoice } from '@/lib/types';

export const placeholderCredits: CarbonCredit[] = [
  {
    id: 'proj-amazon-reforestation',
    sellerName: 'Florestas Renovadas Ltda.',
    creditType: 'Forestry',
    quantity: 5000,
    location: 'Amazonas, Brasil',
    pricePerCredit: 15.50,
    vintage: '2023',
    standard: 'Verra VCS',
    projectOverview: 'This project focuses on reforesting 10,000 hectares of the Amazon rainforest, previously affected by deforestation. It aims to restore biodiversity and create a sustainable ecosystem for local communities.',
    status: 'Ativo',
  },
  {
    id: 'proj-bahia-wind-farm',
    sellerName: 'Energia Eólica do Nordeste S.A.',
    creditType: 'Renewable Energy',
    quantity: 12000,
    location: 'Bahia, Brasil',
    pricePerCredit: 22.00,
    vintage: '2022',
    standard: 'Gold Standard',
    projectOverview: 'A large-scale wind farm generating over 200 GWh of clean energy annually, displacing fossil fuel-based power generation and reducing greenhouse gas emissions significantly.',
    status: 'Ativo',
  },
  {
    id: 'proj-sao-paulo-landfill',
    sellerName: 'Eco Gestão Ambiental',
    creditType: 'Waste Management',
    quantity: 3500,
    location: 'São Paulo, Brasil',
    pricePerCredit: 12.75,
    vintage: '2023',
    standard: 'CDM',
    projectOverview: 'Methane gas capture and electricity generation project at a major urban landfill. The project prevents the release of potent greenhouse gases and converts waste into a valuable energy resource.',
    status: 'Ativo',
  },
  {
    id: 'proj-mato-grosso-agriculture',
    sellerName: 'AgroSustentável',
    creditType: 'Agriculture',
    quantity: 8000,
    location: 'Mato Grosso, Brasil',
    pricePerCredit: 18.25,
    vintage: '2022',
    standard: 'Climate Action Reserve (CAR)',
    projectOverview: 'Implementation of sustainable agricultural practices, including no-till farming and cover cropping, to enhance soil carbon sequestration across thousands of hectares of farmland.',
    status: 'Pausado',
  },
  {
    id: 'proj-parana-solar',
    sellerName: 'Sol do Sul Energia',
    creditType: 'Renewable Energy',
    quantity: 15000,
    location: 'Paraná, Brasil',
    pricePerCredit: 25.00,
    vintage: '2024',
    standard: 'Gold Standard',
    projectOverview: 'A new-generation solar power plant with advanced tracking technology to maximize energy output. This project supplies clean power to the regional grid and promotes energy independence.',
    status: 'Ativo',
  },
    {
    id: 'proj-cerrado-conservation',
    sellerName: 'Guardiões do Cerrado',
    creditType: 'Forestry',
    quantity: 7500,
    location: 'Goiás, Brasil',
    pricePerCredit: 19.80,
    vintage: '2023',
    standard: 'Verra VCS',
    projectOverview: 'A conservation project aimed at protecting the unique biodiversity of the Cerrado biome from agricultural expansion. The project supports local communities with sustainable income alternatives.',
    status: 'Vendido',
  },
];

export const placeholderTaxCredits: TaxCredit[] = [
  {
    id: 'tax-icms-01',
    sellerName: 'Varejista Paulista S.A.',
    taxType: 'ICMS',
    amount: 150000,
    price: 145500,
    location: 'São Paulo, SP',
    status: 'Disponível',
  },
  {
    id: 'tax-pis-cofins-02',
    sellerName: 'Indústria Metalúrgica do Sul',
    taxType: 'PIS/COFINS',
    amount: 75000,
    price: 72000,
    location: 'Porto Alegre, RS',
    status: 'Disponível',
  },
  {
    id: 'tax-ipi-03',
    sellerName: 'Importadora Geral Ltda.',
    taxType: 'IPI',
    amount: 25000,
    price: 24000,
    location: 'Santos, SP',
    status: 'Negociando',
  },
  {
    id: 'tax-iss-04',
    sellerName: 'Serviços de TI Inovadores',
    taxType: 'ISS',
    amount: 50000,
    price: 48500,
    location: 'Rio de Janeiro, RJ',
    status: 'Vendido',
  },
   {
    id: 'tax-icms-05',
    sellerName: 'Atacado Nacional',
    taxType: 'ICMS',
    amount: 320000,
    price: 300000,
    location: 'Belo Horizonte, MG',
    status: 'Disponível',
  },
];

export const placeholderRuralLands: RuralLand[] = [
  {
    id: 'land-001',
    title: 'Fazenda Vale Verde',
    description: 'Propriedade produtiva com dupla aptidão (soja e gado), rica em água, com sede e infraestrutura completa. Documentação 100% regularizada.',
    owner: 'Agropecuária Sul S.A.',
    sizeHa: 1200,
    businessType: 'Venda',
    location: 'Mato Grosso do Sul, Brasil',
    images: ['/placeholder-images/farm-1.jpg', '/placeholder-images/farm-2.jpg', '/placeholder-images/farm-3.jpg'],
    documentation: 'Toda a documentação (CAR, GEO, ITR) está disponível para consulta mediante proposta.',
    registration: 'CRI 12.345-6',
    price: 36000000,
    status: 'Disponível',
  },
  {
    id: 'land-002',
    title: 'Sítio Recanto das Águas',
    description: 'Área ideal para arrendamento de pastagem, com excelente topografia e acesso facilitado. Pastos formados e cercas em bom estado.',
    owner: 'João da Silva',
    sizeHa: 350,
    businessType: 'Arrendamento',
    location: 'Minas Gerais, Brasil',
    images: ['/placeholder-images/pasture-1.jpg', '/placeholder-images/pasture-2.jpg'],
    documentation: 'Contrato de arrendamento padrão disponível. Documentos da propriedade em dia.',
    registration: 'CRI 9.876-5',
    price: 500, // Price per Ha per year
    status: 'Disponível',
  },
  {
    id: 'land-003',
    title: 'Gleba Diamante Bruto',
    description: 'Área com alto potencial para exploração mineral (quartzo e feldspato), com estudos geológicos preliminares indicando viabilidade. Oferecemos parceria ou venda total.',
    owner: 'Mineração Pedra Alta Ltda.',
    sizeHa: 800,
    businessType: 'Mineração',
    location: 'Bahia, Brasil',
    images: ['/placeholder-images/mining-1.jpg', '/placeholder-images/mining-2.jpg'],
    documentation: 'Relatórios geológicos e licenças prévias disponíveis.',
    registration: 'CRI 45.678-1',
    status: 'Disponível',
    price: 5000000
  },
  {
    id: 'land-004',
    title: 'Permuta Urbana em Fazenda',
    description: 'Excelente fazenda para pecuária. Aceito permuta por imóveis comerciais em capitais (preferência por São Paulo ou Curitiba).',
    owner: 'Carlos Pereira Investimentos',
    sizeHa: 2500,
    businessType: 'Permuta',
    location: 'Goiás, Brasil',
    images: ['/placeholder-images/exchange-1.jpg', '/placeholder-images/exchange-2.jpg', '/placeholder-images/exchange-3.jpg'],
    documentation: 'Matrícula atualizada e livre de ônus.',
    registration: 'CRI 23.451-9',
    status: 'Negociando',
    price: 75000000
  }
];

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

export const placeholderOperations: Operation[] = [
  {
    id: 'op-001',
    date: new Date(currentYear, currentMonth, 3),
    type: 'Venda',
    assetType: 'Crédito de Carbono',
    description: 'Venda de 1.000 créditos (proj-amazon-reforestation)',
    value: 15500,
  },
  {
    id: 'op-002',
    date: new Date(currentYear, currentMonth, 10),
    type: 'Compra',
    assetType: 'Crédito Tributário',
    description: 'Aquisição de saldo credor de ICMS (tax-icms-01)',
    value: 145500,
  },
    {
    id: 'op-003',
    date: new Date(currentYear, currentMonth, 10),
    type: 'Venda',
    assetType: 'Terra Rural',
    description: 'Venda da Fazenda Rio Claro',
    value: 5000000,
  },
  {
    id: 'op-004',
    date: new Date(currentYear, currentMonth, 18),
    type: 'Venda',
    assetType: 'Crédito de Carbono',
    description: 'Venda de 5.000 créditos (proj-bahia-wind-farm)',
    value: 110000,
  },
  {
    id: 'op-005',
    date: new Date(currentYear, currentMonth - 1, 25),
    type: 'Compra',
    assetType: 'Crédito de Carbono',
    description: 'Compra de 2.000 créditos (proj-cerrado-conservation)',
    value: 39600,
  },
];


export const placeholderPetitions: Petition[] = [
  {
    id: 'pet-001',
    title: 'Petição de Transferência ICMS - Lote A',
    status: 'finalizado',
    updatedAt: '2024-05-20T10:00:00Z',
    petitionDate: new Date('2024-05-20T10:00:00Z'),
    representativeState: 'SP'
  },
  {
    id: 'pet-002',
    title: 'Rascunho Petição PIS/COFINS',
    status: 'rascunho',
    updatedAt: '2024-05-18T14:30:00Z',
    petitionDate: new Date('2024-05-18T14:30:00Z'),
    representativeState: 'RJ'
  },
   {
    id: 'pet-003',
    title: 'Modelo Padrão IPI',
    status: 'rascunho',
    updatedAt: '2024-05-15T09:00:00Z',
    petitionDate: new Date('2024-05-15T09:00:00Z'),
    representativeState: 'MG'
  },
];

export const placeholderInvoices: Invoice[] = [
  {
    id: 'FAT-001',
    transactionId: 'op-001',
    description: 'Taxa de serviço - Venda de 1.000 créditos (proj-amazon-reforestation)',
    dueDate: '2024-06-15',
    value: 155.00,
    status: 'Paga',
  },
  {
    id: 'FAT-002',
    transactionId: 'op-002',
    description: 'Taxa de serviço - Aquisição de saldo credor de ICMS (tax-icms-01)',
    dueDate: '2024-06-22',
    value: 1455.00,
    status: 'Pendente',
  },
   {
    id: 'FAT-003',
    transactionId: 'op-003',
    description: 'Taxa de serviço - Venda da Fazenda Rio Claro',
    dueDate: '2024-06-25',
    value: 50000.00,
    status: 'Em Análise',
  },
];
