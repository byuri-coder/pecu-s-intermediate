
import type { Asset, AssetType } from './types';
import { numberToWords } from './number-to-words';

// This function returns a detailed contract template string based on the asset type.
// The placeholders `[...]` will be replaced with actual data.

interface Parties {
    seller: { name: string; doc: string; address: string; ie: string; repName: string; repDoc: string; repRole: string };
    buyer: { name: string; doc: string; address: string; ie: string; };
}

interface ContractState {
  fields: {
    seller: {
      paymentMethod: 'vista' | 'parcelado';
      installments: string;
      interestPercent: string;
      [key: string]: any;
    };
    buyer: {
      razaoSocial: string;
      cnpj: string;
      ie: string;
      endereco: string;
      [key: string]: any;
    };
  };
  frozenAt?: string; // Add frozenAt for the date
  [key: string]: any;
}


export function getContractTemplate(assetType: AssetType, asset: Asset, contract: ContractState, parties: Parties): string {
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // Common sections for all contracts
    const header = `
CONTRATO DE CESSÃO DE DIREITOS CREDITÓRIOS E OUTRAS AVENÇAS

Pelo presente instrumento particular, de um lado:

CEDENTE: ${parties.seller.name}, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o nº ${parties.seller.doc}, com sede na ${parties.seller.address}, doravante denominada simplesmente "CEDENTE", representada neste ato por seu(s) representante(s) legal(is) ao final assinado(s);

CESSIONÁRIO: ${contract.fields.buyer.razaoSocial || '[Razão Social do Comprador]'}, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o nº ${contract.fields.buyer.cnpj || '[CNPJ do Comprador]'}, com sede em ${contract.fields.buyer.endereco || '[Endereço do Comprador]'}, doravante denominada simplesmente "CESSIONÁRIO", representada neste ato por seu(s) representante(s) legal(is) ao final assinado(s);

Resolvem as partes, de comum acordo, celebrar o presente Contrato de Cessão de Direitos Creditórios e Outras Avenças ("Contrato"), que se regerá pelas seguintes cláusulas e condições:
`;

    const footer = `
CLÁUSULA DÉCIMA – FORO
10.1. Fica eleito o foro da Comarca de ${parties.seller.address.split(',').pop()?.trim()}, para dirimir quaisquer dúvidas ou litígios oriundos do presente Contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

E, por estarem assim justas e contratadas, as partes assinam o presente Contrato em 2 (duas) vias de igual teor e forma, na presença das testemunhas abaixo.

[Local], ${new Date(contract.frozenAt || Date.now()).toLocaleDateString('pt-BR')}.


_________________________________________
CEDENTE: ${parties.seller.name}
CNPJ: ${parties.seller.doc}


_________________________________________
CESSIONÁRIO: ${contract.fields.buyer.razaoSocial || '[Razão Social do Comprador]'}
CNPJ: ${contract.fields.buyer.cnpj || '[CNPJ do Comprador]'}
`;

    const getPaymentClause = () => {
        const totalValue = ('price' in asset && asset.price) 
            ? asset.price 
            : ('pricePerCredit' in asset && 'quantity' in asset && asset.pricePerCredit && asset.quantity) 
                ? asset.pricePerCredit * asset.quantity
                : 0;

        if (contract.fields.seller.paymentMethod === 'vista') {
            return `O pagamento será efetuado à vista, no valor de ${formatCurrency(totalValue)} (${numberToWords(totalValue)}), via transferência bancária (TED/PIX) para a conta de titularidade da CEDENTE, no prazo de até 5 (cinco) dias úteis após a assinatura deste instrumento e a devida verificação dos documentos.`;
        } else {
            const installments = parseInt(contract.fields.seller.installments, 10) || 1;
            const interest = parseFloat(contract.fields.seller.interestPercent) || 0;
            
            if (interest > 0) {
                 return `O pagamento será realizado em ${installments} parcela(s) mensais, iguais e sucessivas, no valor de [Valor da Parcela], com a primeira parcela vencendo em [Data de Vencimento da 1ª Parcela] e as demais nos mesmos dias dos meses subsequentes, acrescidas de juros de ${interest}% ao mês, calculados pela Tabela Price.`;
            }
            return `O pagamento será realizado em ${installments} parcela(s) mensais, iguais e sucessivas de ${formatCurrency(totalValue / installments)}, com a primeira parcela vencendo em [Data de Vencimento da 1ª Parcela] e as demais nos mesmos dias dos meses subsequentes.`;
        }
    };


    // Specific clauses for each asset type
    const clauses: { [key in AssetType]: string } = {
        'carbon-credit': `
CLÁUSULA PRIMEIRA – DO OBJETO
1.1. O presente Contrato tem por objeto a cessão e transferência, pela CEDENTE ao CESSIONÁRIO, da totalidade dos direitos creditórios relativos a ${'quantity' in asset ? asset.quantity.toLocaleString() : 'N/A'} (${numberToWords('quantity' in asset ? asset.quantity : 0)}) créditos de carbono, do tipo ${'creditType' in asset ? asset.creditType : 'N/A'}, vintage ${'vintage' in asset ? asset.vintage : 'N/A'}, registrados sob o padrão ${'standard' in asset ? asset.standard : '[Padrão do Crédito, ex: Verra]'} com o ID [ID do Projeto], localizados em ${'location' in asset ? asset.location : 'N/A'} ("Créditos").

CLÁUSULA SEGUNDA – DO PREÇO E DA FORMA DE PAGAMENTO
2.1. Pela cessão dos Créditos objeto deste Contrato, o CESSIONÁRIO pagará à CEDENTE o valor total de ${formatCurrency('pricePerCredit' in asset && 'quantity' in asset ? asset.pricePerCredit * asset.quantity : 0)} (${numberToWords('pricePerCredit' in asset && 'quantity' in asset ? asset.pricePerCredit * asset.quantity : 0)}).
2.2. ${getPaymentClause()}

CLÁUSULA TERCEIRA – DA TRANSFERÊNCIA E DA TRADIÇÃO DOS CRÉDITOS
3.1. A CEDENTE compromete-se a realizar todos os atos necessários para a transferência da titularidade dos Créditos para a conta do CESSIONÁRIO na plataforma de registro [Nome da Plataforma, ex: Verra Registry], no prazo de até 2 (dois) dias úteis após a confirmação do pagamento integral previsto na Cláusula Segunda.
`,
        'tax-credit': `
CLÁUSULA PRIMEIRA – DO OBJETO
1.1. O presente Contrato tem por objeto a cessão e transferência, pela CEDENTE ao CESSIONÁRIO, dos direitos creditórios decorrentes de saldo credor de ${'taxType' in asset ? asset.taxType : 'N/A'}, no valor de ${formatCurrency('amount' in asset ? asset.amount : 0)} (${numberToWords('amount' in asset ? asset.amount : 0)}), devidamente apurado e escriturado nos livros fiscais da CEDENTE, referente ao período de [Período de Apuração], originado de [Origem do crédito, ex: operações de exportação], doravante denominado "Crédito Fiscal".

CLÁUSULA SEGUNDA – DO PREÇO E DO DESÁGIO
2.1. Pela cessão do Crédito Fiscal, o CESSIONÁRIO pagará à CEDENTE o valor de ${formatCurrency('price' in asset ? asset.price || 0 : 0)} (${numberToWords('price' in asset ? asset.price || 0 : 0)}), correspondente à aplicação de um deságio de ${'amount' in asset && 'price' in asset && asset.price && asset.amount ? (((asset.amount - asset.price) / asset.amount) * 100).toFixed(2) : '0.00'}% sobre o valor de face do crédito.
2.2. ${getPaymentClause()}

CLÁUSULA TERCEIRA – DA HOMOLOGAÇÃO E TRANSFERÊNCIA
3.1. A eficácia da presente cessão fica condicionada à prévia habilitação do crédito pela autoridade fiscal competente e à homologação do pedido de transferência, nos termos da legislação aplicável (ex: Portaria CAT no Estado de São Paulo).
3.2. A CEDENTE se obriga a protocolar o pedido de transferência do Crédito Fiscal em favor do CESSIONÁRIO no prazo de 10 (dez) dias úteis a contar da assinatura deste instrumento, fornecendo todos os documentos necessários.
`,
        'rural-land': `
CLÁUSULA PRIMEIRA – DO OBJETO
1.1. O presente Contrato tem por objeto a promessa de ${'businessType' in asset ? asset.businessType : 'N/A'} do imóvel rural denominado "${'title' in asset ? asset.title : 'N/A'}", com área de ${'sizeHa' in asset ? asset.sizeHa.toLocaleString() : 'N/A'} hectares, localizado em ${'location' in asset ? asset.location : 'N/A'}, devidamente registrado na matrícula nº ${'registration' in asset ? asset.registration : '[Matrícula do Imóvel]'} do Cartório de Registro de Imóveis de [Comarca do Imóvel] ("Imóvel").

CLÁUSULA SEGUNDA – DO PREÇO E CONDIÇÕES DE PAGAMENTO
2.1. Pela aquisição do Imóvel, o CESSIONÁRIO pagará ao CEDENTE o valor total de ${formatCurrency('price' in asset ? asset.price || 0 : 0)} (${numberToWords('price' in asset ? asset.price || 0 : 0)}).
2.2. ${getPaymentClause()}

CLÁUSULA TERCEIRA – DA POSSE E DA ESCRITURA
3.1. A posse do Imóvel será transferida ao CESSIONÁRIO após a quitação integral do preço, momento em que a CEDENTE se obriga a outorgar a competente Escritura Pública de Compra e Venda.
`
    };

    const commonClauses = `
CLÁUSULA QUARTA – DECLARAÇÕES DA CEDENTE
4.1. A CEDENTE declara, sob as penas da lei, que:
    a) É a legítima titular e detentora dos direitos e créditos objeto deste Contrato, estando eles livres e desembaraçados de quaisquer ônus, gravames, dívidas ou contestações judiciais ou administrativas.
    b) Possui capacidade jurídica para celebrar o presente Contrato e cumprir com todas as obrigações aqui assumidas.
    c) As informações prestadas sobre a origem e a validade dos créditos são verdadeiras, precisas e completas.

CLÁUSULA QUINTA – OBRIGAÇÕES DAS PARTES
5.1. Compete à CEDENTE:
    a) Fornecer toda a documentação necessária para a comprovação da titularidade e validade dos créditos.
    b) Realizar todos os procedimentos necessários para a efetiva transferência dos créditos ao CESSIONÁRIO.
5.2. Compete ao CESSIONÁRIO:
    a) Realizar o pagamento do preço nos termos e condições aqui estabelecidos.
    b) Fornecer as informações necessárias para o registro da transferência dos créditos em seu nome.

CLÁUSULA SEXTA – CONFIDENCIALIDADE
6.1. As partes se obrigam a manter em absoluto sigilo todas as informações comerciais, financeiras e técnicas a que tiverem acesso em razão deste Contrato, não podendo revelá-las a terceiros sem o prévio consentimento por escrito da outra parte, salvo quando exigido por lei ou autoridade competente.

CLÁUSULA SÉTIMA – RESCISÃO
7.1. O presente Contrato poderá ser rescindido de pleno direito, independentemente de notificação judicial ou extrajudicial, em caso de inadimplemento de qualquer de suas cláusulas ou condições, sujeitando a parte infratora ao pagamento de multa de 10% (dez por cento) sobre o valor total da negociação, sem prejuízo da apuração de perdas e danos.

CLÁUSULA OITAVA – DISPOSIÇÕES GERAIS
8.1. O presente Contrato constitui o acordo integral entre as partes, substituindo quaisquer entendimentos, acordos ou representações anteriores, verbais ou escritas.
8.2. A eventual tolerância de qualquer das partes quanto ao descumprimento de quaisquer cláusulas deste Contrato não constituirá novação, renúncia ou precedente.

CLÁUSULA NONA – SUCESSÃO
9.1. Este Contrato obriga as partes e seus sucessores a qualquer título.
`;
  
    return header + (clauses[assetType] || '') + commonClauses + footer;
}
