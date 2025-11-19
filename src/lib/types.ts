

export type CarbonCredit = {
  id: string;
  sellerName: string;
  creditType: 'Forestry' | 'Renewable Energy' | 'Waste Management' | 'Agriculture';
  quantity: number;
  location: string;
  pricePerCredit: number;
  vintage: string; // Year
  standard: string;
  projectOverview: string;
  status: string;
  ownerId: string;
  createdAt: string | Date; 
  images?: { url: string; type: 'image' | 'video', alt?: string }[];
  thumbnailId?: string;
};

export type TaxCredit = {
  id: string;
  sellerName: string;
  taxType: 'ICMS' | 'ISS' | 'PIS/COFINS' | 'IPI' | 'Outros';
  amount: number;
  price: number;
  location: string;
  status: 'Disponível' | 'Negociando' | 'Vendido';
  ownerId: string;
  createdAt: string | Date; 
  images?: { url: string; type: 'image' | 'video', alt?: string }[];
  thumbnailId?: string;
};

export type RuralLand = {
  id: string;
  title: string;
  description: string;
  owner: string;
  sizeHa: number;
  businessType: 'Venda' | 'Permuta' | 'Mineração' | 'Arrendamento';
  location: string;
  documentation: string; // Link or description of available docs
  registration: string; // Land registration identifier
  price?: number; // Optional, might not apply to all business types
  status: 'Disponível' | 'Negociando' | 'Vendido';
  ownerId: string;
  createdAt: string | Date; 
  images?: { url: string; type: 'image' | 'video', alt?: string }[];
  thumbnailId?: string;
};

// Types for Grains Marketplace
export type GrainInsumo = {
  id: string;
  vendedorId: string;
  tipo: 'grain-insumo';
  grain: string;
  cultivar: string;
  tecnologia?: string;
  ciclo?: string;
  tratamento?: { fungicida: boolean; inseticida: boolean; outros?: string };
  testes?: { vigor?: number; germinacao: number };
  zonaRecomendada?: string;
  precoPorSaca: number;
  quantidadeDisponivel: number;
  imagens?: { url: string; type: 'image' | 'video', alt?: string }[];
  status: 'Disponível' | 'Negociando' | 'Vendido';
  ownerId: string;
  createdAt: string | Date;
}

export type GrainPosColheita = {
  id: string;
  vendedorId: string;
  tipo: 'grain-pos-colheita';
  grain: string;
  safra: string;
  qualidade?: { umidade?: number; impurezas?: number; avariados?: number; laudoUrl?: string };
  modalidadeEntrega: { tipo: 'EX-SILO' | 'CIF' | 'FOB'; localRetirada?: string };
  precoPorSaca: number;
  quantidadeDisponivel: number;
  imagens?: { url: string; type: 'image' | 'video', alt?: string }[];
  status: 'Disponível' | 'Negociando' | 'Vendido';
  ownerId: string;
  createdAt: string | Date;
}

export type GrainFuturo = {
  id: string;
  vendedorId: string;
  tipo: 'grain-futuro';
  grain: string;
  safra: string;
  quantidade: number;
  dataEntrega: Date;
  precoFuturo: number;
  instrumento: { tipo: 'CPR' | 'TERMO'; documentoUrl?: string };
  garantias?: { seguroRural?: boolean; apoliceUrl?: string; alienacaoFiduciaria?: boolean; bemAlienadoDescricao?: string };
  pagamento?: { sinalPercentual?: number; mecanismo?: 'escrow' | 'direto' };
  imagens?: { url: string; type: 'image' | 'video', alt?: string }[];
  status: 'Disponível' | 'Negociando' | 'Vendido';
  ownerId: string;
  createdAt: string | Date;
}


export type Operation = {
  id: string;
  date: Date;
  type: 'Compra' | 'Venda';
  assetType: 'Crédito de Carbono' | 'Crédito Tributário' | 'Terra Rural';
  description: string;
  value: number;
};

export type Petition = {
    id: string;
    title: string;
    status: 'rascunho' | 'finalizado';
    updatedAt: string | Date;
    // Add other fields from your schema as needed for the frontend
    customHeader?: string;
    partyCnpj?: string;
    creditBalance?: number;
    representativeName?: string;
    representativeRole?: string;
    representativeState?: string;
    representativeCpf?: string;
    petitionBody?: string;
    attachments?: { type: string; url: string }[];
    periodoApuracao?: string;
    tipoOperacao?: string;
    petitionDate?: Date;
    negotiatedValue?: number;
};

export type Invoice = {
  id: string;
  transactionId: string;
  transactionHash?: string;
  description: string;
  dueDate: string;
  value: number;
  status: 'Paga' | 'Pendente' | 'Em Análise' | 'Negado';
};

export interface Duplicata {
    orderNumber: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    value: number;
}

export interface CompletedDeal {
    assetId: string;
    assetName: string;
    duplicates: Duplicata[];
    seller: { name: string; doc: string, address: string };
    buyer: { name: string; doc: string, address: string };
    blockchain: {
      transactionHash: string;
      merkleRoot: string;
      blockTimestamp: string;
    };
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'pdf' | 'location';
  timestamp: string;
  user: {
    name: string;
    photoURL?: string | null;
  };
  status?: 'sent' | 'delivered' | 'read';
  receiverId?: string;
}


export interface Conversation {
  id: string; // Corresponds to the ChatRoom _id from MongoDB
  assetId: string;
  assetName: string;
  name: string; // Name of the other participant
  lastMessage: string;
  time: string;
  unread: number;
  type: AssetType;
  participants?: string[];
}


export type AssetType = 'carbon-credit' | 'tax-credit' | 'rural-land' | 'grain-insumo' | 'grain-pos-colheita' | 'grain-futuro' | 'other';
export type Asset = CarbonCredit | TaxCredit | RuralLand | GrainInsumo | GrainPosColheita | GrainFuturo;

// Adicionando um tipo para Transação vinda do Firestore
export type FirestoreTransaction = {
    id: string;
    buyerId: string;
    sellerId: string;
    listingId: string;
    value: number;
    type: 'venda' | 'arrendamento' | 'permuta';
    status: 'completed' | 'pending' | 'cancelled';
    createdAt: any; // Firestore Timestamp
    [key: string]: any; // Allow other properties
}

export interface UserProfile {
    _id: string;
    uidFirebase: string;
    nome: string;
    email: string;
    banco?: string;
    agencia?: string;
    conta?: string;
    chavePix?: string;
    inscricaoEstadual?: string;
    estadoFiscal?: string;
    cpfCnpj?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    autorizacoesEspeciais?: string[];
    tipo: "comprador" | "vendedor" | "administrador";
    createdAt: string;
    updatedAt: string;
    fotoPerfilUrl?: string;
}
