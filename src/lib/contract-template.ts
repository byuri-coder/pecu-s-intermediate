
import type { Asset, AssetType, UserProfile } from './types';
import { numberToWords } from './number-to-words';

// This function returns a detailed contract template string based on the asset type.
// The placeholders `[...]` will be replaced with actual data.

interface Parties {
    seller: UserProfile;
    buyer: UserProfile;
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

CEDENTE: ${parties.seller.nome}, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o nº ${parties.seller.cpfCnpj}, com sede na ${parties.seller.endereco}, doravante denominada simplesmente "CEDENTE", representada neste ato por seu(s) representante(s) legal(is) ao final assinado(s);

CESSIONÁRIO: ${contract.fields.buyer.razaoSocial || '[Razão Social do Comprador]'}, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o nº ${contract.fields.buyer.cnpj || '[CNPJ do Comprador]'}, com sede em ${contract.fields.buyer.endereco || '[Endereço do Comprador]'}, doravante denominada simplesmente "CESSIONÁRIO", representada neste ato por seu(s) representante(s) legal(is) ao final assinado(s);

Resolvem as partes, de comum acordo, celebrar o presente Contrato de Cessão de Direitos Creditórios e Outras Avenças ("Contrato"), que se regerá pelas seguintes cláusulas e condições:
`;

    const footer = `
CLÁUSULA DÉCIMA – FORO
10.1. Fica eleito o foro da Comarca de ${parties.seller.cidade || '[Cidade do Vendedor]'}, para dirimir quaisquer dúvidas ou litígios oriundos do presente Contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

E, por estarem assim justas e contratadas, as partes assinam o presente Contrato em 2 (duas) vias de igual teor e forma, na presença das testemunhas abaixo.

${parties.seller.cidade || '[Local]'}, ${new Date(contract.frozenAt || Date.now()).toLocaleDateString('pt-BR')}.


_________________________________________
CEDENTE: ${parties.seller.nome}
CNPJ: ${parties.seller.cpfCnpj}


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

    if (assetType.startsWith('grain-')) {
        const totalValue = asset.price || 0;
        const grainTemplate = `
CONTRATO DE COMPRA E VENDA DE GRÃOS

Pelo presente instrumento particular, as partes abaixo identificadas celebram o presente CONTRATO DE COMPRA E VENDA DE GRÃOS, que se regerá pelas cláusulas e condições seguintes:

1. IDENTIFICAÇÃO DAS PARTES

1.1. VENDEDOR:
Nome/Razão Social: ${parties.seller.nome}
CPF/CNPJ: ${parties.seller.cpfCnpj}
Endereço completo: ${parties.seller.endereco}
Contato: ${parties.seller.email}

1.2. COMPRADOR:
Nome/Razão Social: ${contract.fields.buyer.razaoSocial}
CPF/CNPJ: ${contract.fields.buyer.cnpj}
Endereço completo: ${contract.fields.buyer.endereco}
Contato: ${contract.fields.buyer.email}

2. OBJETO DO CONTRATO

2.1. O presente contrato tem por objeto a compra e venda de grãos, conforme abaixo especificado:

Tipo de Grão: ${'grain' in asset ? asset.grain : '[tipo_grao]'}
Cultivar/Variedade: ${'cultivar' in asset ? asset.cultivar : '[cultivar]'}
Safra: ${'safra' in asset ? asset.safra : '[safra]'}
Quantidade negociada: ${'quantity' in asset ? asset.quantity : ('quantidade' in asset ? asset.quantidade : 0)} sacas
Peso por saca: 60 kg
Qualidade:
Umidade: ${'qualidade' in asset && asset.qualidade?.umidade ? `${asset.qualidade.umidade}%` : '[umidade]%'}
Impurezas: ${'qualidade' in asset && asset.qualidade?.impurezas ? `${asset.qualidade.impurezas}%` : '[impurezas]%'}
Avariados: ${'qualidade' in asset && asset.qualidade?.avariados ? `${asset.qualidade.avariados}%` : '[avariados]%'}
Laudo de Classificação: ${'qualidade' in asset && asset.qualidade?.laudoUrl ? asset.qualidade.laudoUrl : '[url_laudo]'}

Parágrafo único. A qualidade deverá atender às normas do MAPA – Ministério da Agricultura e Pecuária, bem como às especificações deste contrato.

3. PREÇO E CONDIÇÕES DE PAGAMENTO

3.1. Preço unitário por saca: R$ ${'precoPorSaca' in asset && asset.precoPorSaca ? formatCurrency(asset.precoPorSaca) : ('precoFuturo' in asset && asset.precoFuturo ? formatCurrency(asset.precoFuturo) : formatCurrency(totalValue))}
3.2. Valor total da negociação: R$ ${formatCurrency(totalValue)}

3.3. Condição de pagamento:
Modalidade: ${contract.fields.seller.paymentMethod === 'vista' ? 'À Vista' : 'Parcelado'}
Número de parcelas: ${contract.fields.seller.installments || 1}
Valor de cada parcela: [valor_parcela]
Datas de vencimento: [datas_vencimento]
Sinal/Entrada (se houver): R$ [sinal] em [data_sinal]

3.4. Pagamentos serão realizados via: PIX ou Transferência Bancária

4. MODALIDADE DE ENTREGA

A entrega ocorrerá na modalidade ${'modalidadeEntrega' in asset && asset.modalidadeEntrega ? asset.modalidadeEntrega.tipo : '[modalidade_entrega]'}, conforme descrito:

4.1. EX-SILO
Retirada pelo comprador no local:
${'modalidadeEntrega' in asset && asset.modalidadeEntrega?.localRetirada ? asset.modalidadeEntrega.localRetirada : '[endereco_silo]'}, responsável técnico: [responsavel_silo].

4.2. FOB
Entrega realizada pelo vendedor até [local_fob].

4.3. CIF
Entrega na localização do comprador: [endereco_entrega], com frete incluso no preço.

4.4. Data/hora da entrega: ${'dataEntrega' in asset ? new Date(asset.dataEntrega).toLocaleDateString('pt-BR') : '[data_entrega]'}.

5. GARANTIAS E SEGURANÇA JURÍDICA
5.1. Para operações futuras (CPR/Termo)

Se aplicável, este contrato acompanha o instrumento:
Tipo: ${'instrumento' in asset ? asset.instrumento.tipo : '[tipo_instrumento]'}
Número da CPR/Termo: [numero_cpr]
Documento: ${'instrumento' in asset && asset.instrumento.documentoUrl ? asset.instrumento.documentoUrl : '[url_documento_cpr]'}

5.2. Garantias concedidas pelo vendedor
Seguro rural: ${'garantias' in asset && asset.garantias?.seguroRural ? 'Sim' : 'Não'}
Número da apólice: ${'garantias' in asset && asset.garantias?.apoliceUrl ? asset.garantias.apoliceUrl : '[numero_apolice]'}
Alienação fiduciária: ${'garantias' in asset && asset.garantias?.alienacaoFiduciaria ? 'Sim' : 'Não'}
Bem alienado: ${'garantias' in asset && asset.garantias?.bemAlienadoDescricao ? asset.garantias.bemAlienadoDescricao : '[descricao_bem_alienado]'}

6. OBRIGAÇÕES DAS PARTES
6.1. Obrigações do Vendedor
O Vendedor se compromete a:
a) Entregar os grãos dentro do padrão acordado.
b) Fornecer documentos obrigatórios: Nota fiscal nº [numero_nf] e Laudo de classificação (quando aplicável).
c) Manter o produto armazenado em condições adequadas até a entrega.
d) Responder por vícios ou defeitos ocultos.

6.2. Obrigações do Comprador
O Comprador se compromete a:
a) Efetuar o pagamento nos prazos estabelecidos.
b) Retirar o produto (em caso EX-SILO) dentro do período acertado.
c) Fornecer informações corretas e documentos necessários.

7. PENALIDADES E MULTAS
7.1. Atraso no pagamento: Multa de 2% + juros de 1% a.m.
7.2. Atraso na entrega: Multa de 2% sobre o valor ainda não entregue.
7.3. Inadimplemento total: A parte inadimplente pagará multa de 10%, sem prejuízo de perdas e danos.

8. RESCISÃO CONTRATUAL
Poderá ser rescindido em caso de: descumprimento de qualquer cláusula, fraude, falência, ou caso fortuito/força maior. A rescisão deve ser formalizada por escrito.

9. FORO
As partes elegem o foro da comarca de ${parties.seller.cidade || '[Cidade do Vendedor]'}, renunciando a qualquer outro.

10. DISPOSIÇÕES FINAIS
a) As partes declaram ter lido, compreendido e concordado integralmente.
b) A assinatura eletrônica realizada pela plataforma PECU’S INTERMEDIATE é válida e produz todos os efeitos legais (Lei 14.063/2020).
c) Este contrato passa a valer após o aceite digital do comprador e vendedor.

✅ Assinaturas Eletrônicas

VENDEDOR:
Assinado por: ${parties.seller.nome}
Data: ${contract.acceptances.seller.date ? new Date(contract.acceptances.seller.date).toLocaleString('pt-BR') : '[data_assinatura_vendedor]'}

COMPRADOR:
Assinado por: ${contract.fields.buyer.razaoSocial}
Data: ${contract.acceptances.buyer.date ? new Date(contract.acceptances.buyer.date).toLocaleString('pt-BR') : '[data_assinatura_comprador]'}
`;
        return grainTemplate;
    }


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
`,
        'grain-insumo': '',
        'grain-pos-colheita': '',
        'grain-futuro': '',
        'other': ''
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
