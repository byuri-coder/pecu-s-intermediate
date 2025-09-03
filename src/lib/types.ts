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
