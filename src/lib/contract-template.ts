

import type { Asset, AssetType } from './types';
import { numberToWords } from './number-to-words';

// This function returns a detailed contract template string based on the asset type.
// The placeholders `{{...}}` will be replaced with actual data.

export function getContractTemplate(assetType: AssetType): string {
  // Common sections for all contracts
  const header = `
CONTRATO DE CESSÃO DE DIREITOS CREDITÓRIOS E OUTRAS AVENÇAS

Pelo presente instrumento particular, de um lado:

CEDENTE: [Razão Social do Vendedor], pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o nº [CNPJ do Vendedor], com sede na [Endereço do Vendedor], doravante denominada simplesmente "CEDENTE", representada neste ato por seu(s) representante(s) legal(is) ao final assinado(s);

CESSIONÁRIO: [Razão Social do Comprador], pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o nº [CNPJ do Comprador], com sede na [Endereço do Comprador], doravante denominada simplesmente "CESSIONÁRIO", representada neste ato por seu(s) representante(s) legal(is) ao final assinado(s);

Resolvem as partes, de comum acordo, celebrar o presente Contrato de Cessão de Direitos Creditórios e Outras Avenças ("Contrato"), que se regerá pelas seguintes cláusulas e condições:
`;

  const footer = `
CLÁUSULA DÉCIMA – FORO
10.1. Fica eleito o foro da Comarca de [Cidade da Jurisdição], para dirimir quaisquer dúvidas ou litígios oriundos do presente Contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

E, por estarem assim justas e contratadas, as partes assinam o presente Contrato em 2 (duas) vias de igual teor e forma, na presença das testemunhas abaixo.

[Local], {{contract.date}}.


_________________________________________
CEDENTE: {{seller.name}}
CNPJ: {{seller.doc}}


_________________________________________
CESSIONÁRIO: {{buyer.name}}
CNPJ: {{buyer.doc}}
`;

  // Specific clauses for each asset type
  const clauses: { [key in AssetType]: string } = {
    'carbon-credit': `
CLÁUSULA PRIMEIRA – DO OBJETO
1.1. O presente Contrato tem por objeto a cessão e transferência, pela CEDENTE ao CESSIONÁRIO, da totalidade dos direitos creditórios relativos a {{amount}} ({{amount.extenso}}) créditos de carbono, do tipo {{asset.type}}, vintage {{asset.vintage}}, registrados sob o padrão [Padrão do Crédito, ex: Verra] com o ID [ID do Projeto], localizados em {{asset.location}} ("Créditos").

CLÁUSULA SEGUNDA – DO PREÇO E DA FORMA DE PAGAMENTO
2.1. Pela cessão dos Créditos objeto deste Contrato, o CESSIONÁRIO pagará à CEDENTE o valor total de R$ {{negotiation.value}} ({{negotiation.value.extenso}}).
2.2. O pagamento será efetuado da seguinte forma: [Detalhar forma de pagamento, ex: à vista, via transferência bancária (TED/PIX) para a conta de titularidade da CEDENTE, no prazo de até 5 (cinco) dias úteis após a assinatura deste instrumento].

CLÁSULA TERCEIRA – DA TRANSFERÊNCIA E DA TRADIÇÃO DOS CRÉDITOS
3.1. A CEDENTE compromete-se a realizar todos os atos necessários para a transferência da titularidade dos Créditos para a conta do CESSIONÁRIO na plataforma de registro [Nome da Plataforma, ex: Verra Registry], no prazo de até 2 (dois) dias úteis após a confirmação do pagamento integral previsto na Cláusula Segunda.
`,
    'tax-credit': `
CLÁUSULA PRIMEIRA – DO OBJETO
1.1. O presente Contrato tem por objeto a cessão e transferência, pela CEDENTE ao CESSIONÁRIO, dos direitos creditórios decorrentes de saldo credor de {{asset.type}}, no valor de R$ {{credit.balance}} ({{credit.balance.extenso}}), devidamente apurado e escriturado nos livros fiscais da CEDENTE, referente ao período de [Período de Apuração], originado de [Origem do crédito, ex: operações de exportação], doravante denominado "Crédito Fiscal".

CLÁUSULA SEGUNDA – DO PREÇO E DO DESÁGIO
2.1. Pela cessão do Crédito Fiscal, o CESSIONÁRIO pagará à CEDENTE o valor de R$ {{negotiation.value}} ({{negotiation.value.extenso}}), correspondente à aplicação de um deságio de {{negotiation.percentage}}% sobre o valor de face do crédito.
2.2. O pagamento será realizado em {{payment.method}}, [descrever condições].

CLÁUSULA TERCEIRA – DA HOMOLOGAÇÃO E TRANSFERÊNCIA
3.1. A eficácia da presente cessão fica condicionada à prévia habilitação do crédito pela autoridade fiscal competente e à homologação do pedido de transferência, nos termos da legislação aplicável (ex: Portaria CAT no Estado de São Paulo).
3.2. A CEDENTE se obriga a protocolar o pedido de transferência do Crédito Fiscal em favor do CESSIONÁRIO no prazo de 10 (dez) dias úteis a contar da assinatura deste instrumento, fornecendo todos os documentos necessários.
`,
    'rural-land': `
CLÁUSULA PRIMEIRA – DO OBJETO
1.1. O presente Contrato tem por objeto a promessa de {{asset.businessType}} do imóvel rural denominado "{{asset.title}}", com área de {{asset.sizeHa}} hectares, localizado em {{asset.location}}, devidamente registrado na matrícula nº {{asset.registration}} do Cartório de Registro de Imóveis de [Comarca do Imóvel] ("Imóvel").

CLÁzula SEGUNDA – DO PREÇO E CONDIÇÕES DE PAGAMENTO
2.1. Pela aquisição do Imóvel, o CESSIONÁRIO pagará ao CEDENTE o valor total de R$ {{negotiation.value}} ({{negotiation.value.extenso}}).
2.2. O pagamento será realizado da seguinte forma:
    a) Sinal e princípio de pagamento: R$ [Valor do Sinal], a ser pago na data da assinatura deste contrato.
    b) Saldo remanescente: R$ [Valor do Saldo], a ser pago em {{payment.installments}} parcela(s), com vencimento em [Datas], através de [Forma de Pagamento].

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
    b) Realizar todos os procedimentos necessários para a efetiva transferência dos créditos ao CESSIONÁRIOS.
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

    