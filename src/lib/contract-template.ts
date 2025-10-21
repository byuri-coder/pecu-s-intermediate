
import type { AssetType } from './types';

// This function returns a contract template string based on the asset type.
// The placeholders `{{...}}` will be replaced with actual data.

export function getContractTemplate(assetType: AssetType): string {
    const commonClauses = `
Este Contrato de Compra e Venda é celebrado entre as partes abaixo qualificadas:

VENDEDOR(A): {{seller.name}}
COMPRADOR(A): {{buyer.name}}

CLÁUSULA PRIMEIRA - DO OBJETO
O objeto deste contrato é a transferência da titularidade do seguinte ativo:
- Tipo de Ativo: {{asset.type}}
- Quantidade/Valor: {{amount}}

CLÁUSULA SEGUNDA - DO PAGAMENTO
O pagamento será realizado da seguinte forma:
- Método: {{paymentMethod}}
- Número de Parcelas: {{installments}}
`;

    switch (assetType) {
        case 'carbon-credit':
            return `
CONTRATO DE COMPRA E VENDA DE CRÉDITOS DE CARBONO
${commonClauses}
CLÁUSULA TERCEIRA - ESPECÍFICA (CRÉDITO DE CARBONO)
Os créditos de carbono são do padrão VERRA, safra 2023, oriundos de projeto de reflorestamento.
`;
        case 'tax-credit':
            return `
CONTRATO DE CESSÃO DE CRÉDITO TRIBUTÁRIO
${commonClauses}
CLÁUSULA TERCEIRA - ESPECÍFICA (CRÉDITO TRIBUTÁRIO)
O crédito tributário é referente a ICMS, originado no estado de São Paulo. O cedente (vendedor) garante a liquidez e a certeza do crédito.
`;
        case 'rural-land':
            return `
CONTRATO DE COMPRA E VENDA DE IMÓVEL RURAL
${commonClauses}
CLÁUSULA TERCEIRA - ESPECÍFICA (IMÓVEL RURAL)
O imóvel rural objeto deste contrato possui a matrícula nº 12.345 junto ao Cartório de Registro de Imóveis da comarca.
`;
        default:
            return `
CONTRATO GENÉRICO
${commonClauses}
`;
    }
}
