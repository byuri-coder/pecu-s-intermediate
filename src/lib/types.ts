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
  status: 'Ativo' | 'Pausado' | 'Vendido';
};

export type TaxCredit = {
  id: string;
  sellerName: string;
  taxType: 'ICMS' | 'ISS' | 'PIS/COFINS' | 'IPI';
  amount: number;
  price: number;
  location: string;
  status: 'Disponível' | 'Negociando' | 'Vendido';
};

export type RuralLand = {
  id: string;
  title: string;
  description: string;
  owner: string;
  sizeHa: number;
  businessType: 'Venda' | 'Permuta' | 'Mineração' | 'Arrendamento';
  location: string;
  images: string[];
  documentation: string; // Link or description of available docs
  registration: string; // Land registration identifier
  price?: number; // Optional, might not apply to all business types
  status: 'Disponível' | 'Negociando' | 'Vendido';
};
