
import type { Asset, AssetType } from './types';
import { numberToWords } from './number-to-words';

// This function returns a detailed contract template string based on the asset type.
// The placeholders `{{...}}` will be replaced with actual data.

export function getContractTemplate(
    assetType: AssetType, 
    asset: Asset,
    contract: any, // Basic contract state with fields
    parties: { seller: any, buyer: any } // Detailed party info
): string {

    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || isNaN(value)) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    
    const negotiatedValue = contract.fields?.seller?.paymentMethod === 'vista' 
        ? ('price' in asset ? asset.price : 0) || 0
        : (parseFloat(contract.fields?.seller?.installments) || 1) * (('price' in asset ? asset.price : 0) || 0) ;

    const creditBalance = 'amount' in asset ? asset.amount : negotiatedValue;
    
    const replacements: { [key: string]: string | number } = {
        '{{asset.title}}': 'title' in asset ? asset.title : 'Ativo sem Título',
        '{{asset.type}}': assetType,
        '{{asset.location}}': 'location' in asset ? asset.location : 'N/A',
        '{{asset.id}}': asset.id,
        
        '{{seller.name}}': parties.seller.name || 'Vendedor [Nome]',
        '{{seller.doc}}': parties.seller.doc || 'Vendedor [CNPJ/CPF]',
        '{{seller.address}}': parties.seller.address || 'Vendedor [Endereço]',
        '{{seller.ie}}': parties.seller.ie || 'Vendedor [IE]',
        '{{seller.rep.name}}': parties.seller.repName || 'Representante do Vendedor',
        '{{seller.rep.cpf}}': parties.seller.repDoc || 'Representante [CPF]',
        '{{seller.rep.role}}': parties.seller.repRole || 'Representante [Cargo]',

        '{{buyer.name}}': parties.buyer.name || 'Comprador [Nome]',
        '{{buyer.doc}}': parties.buyer.doc || 'Comprador [CNPJ/CPF]',
        '{{buyer.address}}': parties.buyer.address || 'Comprador [Endereço]',
        '{{buyer.ie}}': parties.buyer.ie || 'Comprador [IE]',

        '{{credit.balance}}': formatCurrency(creditBalance),
        '{{credit.balance.extenso}}': numberToWords(creditBalance),
        
        '{{negotiation.value}}': formatCurrency(negotiatedValue),
        '{{negotiation.value.extenso}}': numberToWords(negotiatedValue),
        '{{negotiation.percentage}}': creditBalance > 0 ? ((negotiatedValue / creditBalance) * 100).toFixed(2) : '0.00',

        '{{payment.method}}': contract.fields?.seller?.paymentMethod === 'vista' ? 'À Vista' : 'Parcelado',
        '{{payment.installments}}': contract.fields?.seller?.installments || '1',
        
        '{{contract.date}}': new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
        '{{contract.city}}': ('location' in asset ? asset.location.split(',')[0] : 'São Paulo'),
    };
    
    const template = `
À SECRETARIA DA FAZENDA E PLANEJAMENTO DO ESTADO DE SÃO PAULO
Coordenadoria de Administração Tributária – CAT

Ref.: REQUERIMENTO DE TRANSFERÊNCIA DE CRÉDITO ACUMULADO DE ICMS — PEDIDO DE HOMOLOGAÇÃO

CEDENTE (VENDEDOR):
Razão Social: {{seller.name}}
CNPJ: {{seller.doc}}
Inscrição Estadual: {{seller.ie}}
Endereço: {{seller.address}}
Representante Legal: {{seller.rep.name}} — CPF: {{seller.rep.cpf}} — Cargo: {{seller.rep.role}}

CESSIONÁRIO (COMPRADOR):
Razão Social: {{buyer.name}}
CNPJ: {{buyer.doc}}
Inscrição Estadual: {{buyer.ie}}
Endereço: {{buyer.address}}


I — DOS FATOS

O(A) Cedente declara ser titular de créditos acumulados de ICMS no valor nominal de {{credit.balance}} ({{credit.balance.extenso}}), gerados em decorrência de suas operações fiscais, devidamente escriturados e validados perante esta Secretaria.

Em decorrência de negociação comercial com o(a) Cessionário(a), as partes acordaram a cessão onerosa dos referidos créditos, pelo valor negociado de {{negotiation.value}} ({{negotiation.value.extenso}}), correspondente a {{negotiation.percentage}}% do saldo total, mediante pagamento na modalidade "{{payment.method}}"${contract.fields?.seller?.paymentMethod === 'parcelado' ? ' em {{payment.installments}} parcelas' : ''}.

O presente requerimento visa obter a homologação desta cessão para que o crédito seja transferido da conta fiscal do Cedente para a do Cessionário, nos termos da legislação vigente.

II — DO DIREITO

O presente pedido funda-se na Lei Complementar nº 87/1996 (Lei Kandir) e, no âmbito do Estado de São Paulo, na Lei Estadual nº 6.374/1989 e no Regulamento do ICMS (Decreto nº 45.490/2000), que disciplinam a sistemática de apuração e utilização do crédito acumulado. A Portaria CAT nº 26/2010 e suas correlatas estabelecem os procedimentos para a transferência de crédito acumulado a terceiros através do sistema e-CredAc.

Requer-se, assim, a análise e o deferimento dos atos administrativos necessários para a efetivação da transferência do crédito.

III — DO PEDIDO

Diante do exposto, o Cedente requer a Vossa Senhoria:

a) O recebimento e processamento deste requerimento;
b) A análise e homologação da transferência do crédito de ICMS no valor de {{negotiation.value}} para o Cessionário acima qualificado;
c) A expedição do ato administrativo que oficialize a transferência, para todos os fins de direito.

Nestes termos, pede deferimento.

{{contract.city}}, {{contract.date}}.


_________________________________________
{{seller.rep.name}}
{{seller.name}}
(Cedente)


_________________________________________
{{buyer.name}}
(Cessionário)
`;

    let populatedTemplate = template;
    for (const [key, value] of Object.entries(replacements)) {
        populatedTemplate = populatedTemplate.replace(new RegExp(key, 'g'), String(value));
    }
    
    return populatedTemplate;
}
