

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
};

type MediaItem = {
    url: string;
    type: 'image' | 'video';
    alt?: string;
}

export type RuralLand = {
  id: string;
  title: string;
  description: string;
  owner: string;
  sizeHa: number;
  businessType: 'Venda' | 'Permuta' | 'Mineração' | 'Arrendamento';
  location: string;
  images: MediaItem[];
  documentation: string; // Link or description of available docs
  registration: string; // Land registration identifier
  price?: number; // Optional, might not apply to all business types
  status: 'Disponível' | 'Negociando' | 'Vendido';
  ownerId: string;
  createdAt: string | Date; 
};

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
    blockchain?: {
      transactionHash: string;
      blockTimestamp: string;
    };
}

export interface Message {
  id: string;
  sender: 'me' | 'other';
  content: string;
  type: 'text' | 'image' | 'pdf' | 'location';
  timestamp: string;
  avatar?: string;
}

export interface Conversation {
  id: string;
  assetId: string;
  assetName: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  type: AssetType;
}


export type AssetType = 'carbon-credit' | 'tax-credit' | 'rural-land';
export type Asset = CarbonCredit | TaxCredit | RuralLand;
