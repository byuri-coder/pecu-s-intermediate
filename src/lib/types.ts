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
