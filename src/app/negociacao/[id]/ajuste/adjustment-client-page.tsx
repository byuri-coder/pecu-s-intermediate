'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, FileSignature, CheckCircle, XCircle, Copy, Banknote, Download, FileText, FileDown, UploadCloud, X, Eye, Lock, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { CarbonCredit, RuralLand, TaxCredit } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';


type AssetType = 'carbon-credit' | 'tax-credit' | 'rural-land';
type Asset = CarbonCredit | TaxCredit | RuralLand;


const carbonCreditContractTemplate = `CONTRATO DE CESSÃO DE CRÉDITOS DE CARBONO

Pelo presente instrumento particular, as partes:

CEDENTE: [NOME/RAZÃO SOCIAL DO CEDENTE], pessoa jurídica de direito privado, inscrita no CNPJ/CPF sob o nº [CNPJ/CPF nº DO CEDENTE], com sede em [ENDERECO DO CEDENTE], neste ato representada na forma de seu contrato social por [REPRESENTANTE DO CEDENTE].

CESSIONÁRIO: [NOME/RAZÃO SOCIAL DO CESSIONÁRIO], pessoa jurídica de direito privado, inscrita no CNPJ/CPF sob o nº [CNPJ/CPF nº DO CESSIONÁRIO], com sede em [ENDERECO DO CESSIONÁRIO], neste ato representada na forma de seu contrato social por [REPRESENTANTE DO CESSIONÁRIO].

Resolvem celebrar o presente Contrato de Cessão de Créditos de Carbono, que se regerá pelas seguintes cláusulas e condições:

CLÁUSULA PRIMEIRA - DO OBJETO
1.1. O CEDENTE declara ser o legítimo titular e possuidor dos créditos de carbono descritos no sistema [PLATAFORMA_PROJETO], identificados pelo código [ID_ATIVO], totalizando um volume de [QUANTIDADE_ATIVO] créditos, correspondente ao valor total de R$ [VALOR_TOTAL_ATIVO].

CLÁUSULA SEGUNDA - DA CESSÃO
2.1. O CEDENTE, neste ato e pela melhor forma de direito, cede e transfere ao CESSIONÁRIO, em caráter definitivo, irrevogável e irretratável, a quantidade de créditos de carbono ora negociada, pelo valor certo e ajustado de R$ [VALOR_NEGOCIADO].

CLÁUSULA TERCEIRA - DO PREÇO E DA FORMA DE PAGAMENTO
3.1. O CESSIONÁRIO compromete-se a efetuar o pagamento do valor estabelecido na Cláusula Segunda no prazo de até [PRAZO_PAGAMENTO] dias úteis, contados da assinatura deste contrato, mediante [FORMA_PAGAMENTO].

CLÁUSULA QUARTA - DAS OBRIGAÇÕES DAS PARTES
4.1. O CEDENTE obriga-se a fornecer toda a documentação necessária para a efetivação da transferência dos créditos e a garantir a procedência e validade dos mesmos.
4.2. O CESSIONÁRIO obriga-se a realizar o pagamento na forma e prazo acordados.

CLÁUSULA QUINTA - DOS CUSTOS DA PLATAFORMA
5.1. Os custos operacionais da plataforma, no valor de R$ [CUSTO_PLATAFORMA_VALOR], serão suportados pelas partes na proporção de [PERCENTUAL_CEDENTE]% pelo CEDENTE e [PERCENTUAL_CESSIONARIO]% pelo CESSIONÁRIO.

CLÁUSULA SEXTA - DAS DECLARAÇÕES E GARANTIAS
6.1. As partes declaram, sob as penas da lei, que possuem capacidade legal e poderes necessários para celebrar o presente contrato e cumprir com suas obrigações.
6.2. O CEDENTE declara que os créditos objeto desta cessão estão livres e desembaraçados de quaisquer ônus, dívidas ou litígios.

CLÁUSULA SÉTIMA - DA LEGISLAÇÃO APLICÁVEL E FORO
7.1. Este contrato será regido e interpretado de acordo com as leis da República Federativa do Brasil.
7.2. Fica eleito o foro da comarca de [FORO_COMARCA], com exclusão de qualquer outro, por mais privilegiado que seja, para dirimir quaisquer conflitos ou dúvidas decorrentes deste instrumento.

E por estarem justas e contratadas, as partes assinam o presente contrato em 2 (duas) vias de igual teor e forma, na presença das testemunhas abaixo.

[LOCAL_ASSINATURA], [DATA_EXTENSO].


____________________________________
[NOME/RAZÃO SOCIAL DO CEDENTE]
(Cedente)


__________________________________
[NOME/RAZÃO SOCIAL DO CESSIONÁRIO]
(Cessionário)


Testemunhas:

1. ___________________________
   Nome:
   CPF:

2. ___________________________
   Nome:
   CPF:
`;

const ruralLandSaleContractTemplate = `CONTRATO PARTICULAR DE PROMESSA DE COMPRA E VENDA DE IMÓVEL RURAL

Pelo presente instrumento particular, as partes:

PROMITENTE VENDEDOR(A): [VENDEDOR_NOME], [nacionalidade], [estado civil], [profissao], portador(a) do RG nº [rg] e inscrito(a) no CPF/MF sob o nº [cpf], residente e domiciliado(a) em [endereco completo], doravante denominado simplesmente VENDEDOR.

PROMISSÁRIO COMPRADOR(A): [COMPRADOR_NOME], [nacionalidade_comprador], [estado_civil_comprador], [profissao_comprador], portador(a) do RG nº [rg_comprador] e inscrito(a) no CPF/MF sob o nº [cpf_comprador], residente e domiciliado(a) em [endereco_comprador], doravante denominado simplesmente COMPRADOR.

Resolvem celebrar o presente Contrato Particular de Promessa de Compra e Venda de Imóvel Rural, que se regerá pelas seguintes cláusulas e condições:

CLÁUSULA PRIMEIRA - DO OBJETO
1.1. O VENDEDOR é legítimo proprietário e possuidor do imóvel rural denominado "[denominação da propriedade]", situado no município de [PROPRIEDADE_MUNICIPIO], Estado de [PROPRIEDADE_ESTADO], com área total de [PROPRIEDADE_AREA] hectares, devidamente registrado no Cartório de Registro de Imóveis da Comarca de [PROPRIEDADE_COMARCA], sob a matrícula nº [PROPRIEDADE_MATRICULA].

CLÁUSULA SEGUNDA - DO PREÇO E DA FORMA DE PAGAMENTO
2.1. O preço certo e ajustado pela presente transação é de R$ [VALOR_NEGOCIADO_NUM], que o COMPRADOR pagará da seguinte forma:
a) [condicao_pagamento];
b) [detalhes_pagamento].

CLÁUSULA TERCEIRA - DA POSSE
3.1. A posse precária do imóvel será transmitida ao COMPRADOR na data de [data_posse], momento a partir do qual poderá nele ingressar e iniciar as atividades pretendidas, desde que cumpridas as condições de pagamento previstas.
3.2. A posse definitiva será transmitida com a outorga da Escritura Pública Definitiva de Compra e Venda.

CLÁUSULA QUARTA - DAS OBRIGAÇÕES
4.1. Compete ao VENDEDOR:
a) Entregar o imóvel livre e desembaraçado de quaisquer ônus, dívidas, hipotecas, arrendamentos ou litígios;
b) Apresentar as certidões negativas de praxe e o comprovante de quitação do ITR e CCIR até a data da outorga da escritura;
c) Responder pela evicção de direito.

4.2. Compete ao COMPRADOR:
a) Efetuar o pagamento do preço nas condições pactuadas;
b) Arcar com todas as despesas decorrentes da transmissão da propriedade, tais como ITBI, escritura, emolumentos cartorários e registro.

CLÁUSULA QUINTA - DA ESCRITURA DEFINITIVA
5.1. Cumpridas todas as obrigações contratuais, em especial o pagamento integral do preço, o VENDEDOR se obriga a outorgar ao COMPRADOR a competente Escritura Pública Definitiva de Compra e Venda no prazo de 30 (trinta) dias.

CLÁUSULA SEXTA - DA RESCISÃO
6.1. O inadimplemento de qualquer cláusula por qualquer das partes ensejará a rescisão deste contrato, sujeitando a parte inadimplente ao pagamento de multa penal correspondente a [percentual_multa]% do valor total da transação, sem prejuízo da apuração de perdas e danos.

CLÁUSULA SÉTIMA - DOS CUSTOS DA PLATAFORMA
7.1. Os custos operacionais da plataforma, no valor correspondente a 1% (um por cento), totalizando R$ [CUSTO_PLATAFORMA_VALOR], serão suportados pelas partes na seguinte proporção: [PERCENTUAL_VENDEDOR]% pelo VENDEDOR e [PERCENTUAL_COMPRADOR]% pelo COMPRADOR.

CLÁUSULA OITAVA - DO FORO
8.1. Fica eleito o foro da comarca de [FORO_COMARCA], Estado de [PROPRIEDADE_ESTADO], para dirimir quaisquer controvérsias oriundas do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

E por estarem assim justas e contratadas, as partes assinam o presente instrumento em [vias_contrato] vias de igual teor e forma, na presença das testemunhas abaixo.

[LOCAL_ASSINATURA], [DATA_EXTENSO].


__________________________________
[VENDEDOR_NOME]
(Promitente Vendedor)


__________________________________
[COMPRADOR_NOME]
(Promissário Comprador)


Testemunhas:

1. ___________________________
   Nome:
   CPF:

2. ___________________________
   Nome:
   CPF:
`;

const ruralLandLeaseContractTemplate = `CONTRATO DE ARRENDAMENTO RURAL

Pelo presente instrumento particular, as partes:

ARRENDADOR(A): [ARRENDADOR_NOME], [nacionalidade_arrendador], [estado_civil_arrendador], [profissao_arrendador], portador(a) do RG nº [rg_arrendador] e inscrito(a) no CPF/MF sob o nº [cpf_arrendador], residente e domiciliado(a) em [endereco_arrendador].

ARRENDATÁRIO(A): [ARRENDATARIO_NOME], [nacionalidade_arrendatario], [estado_civil_arrendatario], [profissao_arrendatario], portador(a) do RG nº [rg_arrendatario] e inscrito(a) no CPF/MF sob o nº [cpf_arrendatario], residente e domiciliado(a) em [endereco_arrendatario].

Resolvem celebrar o presente Contrato de Arrendamento Rural, em conformidade com o Estatuto da Terra (Lei nº 4.504/64) e seu Regulamento (Decreto nº 59.566/66), que se regerá pelas seguintes cláusulas e condições:

CLÁUSULA PRIMEIRA - DO OBJETO
1.1. O ARRENDADOR, sendo legítimo proprietário do imóvel rural denominado "[NOME_PROPRIEDADE]", situado em [localizacao_completa], registrado sob a matrícula nº [matricula_imovel] do Cartório de Registro de Imóveis da Comarca de [comarca_imovel], com área total de [area_total] hectares, cede em arrendamento ao ARRENDATÁRIO uma área de [AREA_ARRENDADA] hectares para fins de exploração de [finalidade_arrendamento].

CLÁUSULA SEGUNDA - DO PRAZO
2.1. O presente contrato terá a duração de [prazo_arrendamento] anos, com início em [DATA_INICIO] e término em [DATA_TERMINO].

CLÁUSULA TERCEIRA - DO PREÇO E DO PAGAMENTO
3.1. O valor do arrendamento é fixado em R$ [VALOR_NEGOCIADO] por [PERIODO_PAGAMENTO], a ser pago pelo ARRENDATÁRIO ao ARRENDADOR da seguinte forma: [forma_pagamento_arrendamento], até o dia [dia_pagamento_arrendamento] de cada período correspondente.

CLÁUSULA QUARTA - DAS OBRIGAÇÕES DAS PARTES
4.1. O ARRENDADOR se obriga a:
a) Garantir ao ARRENDATÁRIO o uso pacífico do imóvel durante o prazo do contrato;
b) Entregar o imóvel em condições de servir ao uso a que se destina.

4.2. O ARRENDATÁRIO se obriga a:
a) Utilizar o imóvel de acordo com a finalidade estabelecida, conservando os recursos naturais;
b) Manter as benfeitorias existentes em bom estado, responsabilizando-se por danos que causar;
c) Pagar pontualmente o valor do arrendamento;
d) Restituir o imóvel ao término do contrato, no estado em que o recebeu, salvo desgastes naturais.

CLÁUSULA QUINTA - DAS BENFEITORIAS
5.1. As benfeitorias necessárias introduzidas pelo ARRENDATÁRIO serão indenizadas. As úteis e voluptuárias dependerão de prévia autorização por escrito do ARRENDADOR para que possam ser indenizadas.

CLÁUSULA SEXTA - DOS CUSTOS DA PLATAFORMA
6.1. Os custos operacionais da plataforma, no valor de R$ [CUSTO_PLATAFORMA_VALOR] (correspondente a 1% do valor total do contrato), serão suportados pelas partes na seguinte proporção: [PERCENTUAL_ARRENDADOR]% pelo ARRENDADOR e [PERCENTUAL_ARRENDATARIO]% pelo ARRENDATÁRIO.

CLÁUSULA SÉTIMA - DO FORO
7.1. Fica eleito o foro da Comarca de [comarca_imovel] para dirimir quaisquer questões oriundas deste contrato, com renúncia a qualquer outro.

E por estarem justos e contratados, assinam o presente instrumento em duas vias de igual teor e forma, juntamente com as testemunhas abaixo.

[LOCAL_ASSINATURA], [DATA_EXTENSO].


___________________________________________
[ARRENDADOR_NOME]
(Arrendador)


_________________________________________
[ARRENDATARIO_NOME]
(Arrendatário)


Testemunhas:

1. __________________________
   Nome:
   CPF:

2. __________________________
   Nome:
   CPF:
`;

const ruralLandPermutaContractTemplate = `INSTRUMENTO PARTICULAR DE CONTRATO DE PERMUTA

Pelo presente instrumento particular, as partes:

PERMUTANTE 1: [PERMUTANTE1_NOME], [nacionalidade1], [estado_civil1], [profissao1], portador(a) do RG nº [rg1] e inscrito(a) no CPF/CNPJ sob o nº [cpf_cnpj1], residente e domiciliado(a)/sediado(a) em [endereco1].

PERMUTANTE 2: [PERMUTANTE2_NOME], [nacionalidade2], [estado_civil2], [profissao2], portador(a) do RG nº [rg2] e inscrito(a) no CPF/CNPJ sob o nº [cpf_cnpj2], residente e domiciliado(a)/sediado(a) em [endereco2].

Resolvem celebrar o presente Contrato de Permuta, que se regerá pelas cláusulas e condições a seguir.

CLÁUSULA PRIMEIRA – DO OBJETO
1.1. As partes acordam em realizar a permuta (troca) dos seguintes bens/ativos:
a) O PERMUTANTE 1 entrega ao PERMUTANTE 2: [ENTREGA1].
b) O PERMUTANTE 2 entrega ao PERMUTANTE 1: [ENTREGA2].

CLÁUSULA SEGUNDA – DA AVALIAÇÃO E DA TORNA
2.1. As partes declaram que os bens/ativos permutados são de valor equivalente, conforme avaliação mútua, não havendo, portanto, saldo a pagar (torna) em dinheiro.
2.2. (Opcional) Caso haja diferença de valor, a parte que receber o bem de maior valor pagará à outra, a título de torna, a quantia de R$ [VALOR_TORNA], a ser paga em até [PRAZO_TORNA] dias da assinatura deste instrumento.

CLÁUSULA TERCEIRA – DAS OBRIGAÇÕES
3.1. Os PERMUTANTES obrigam-se a entregar os respectivos bens/ativos descritos na Cláusula Primeira, livres e desembaraçados de quaisquer ônus, no prazo de [PRAZO_ENTREGA] dias, contados da assinatura deste contrato.
3.2. Cada parte arcará com as despesas de transferência e registro do bem que receber.

CLÁUSULA QUARTA - DOS CUSTOS DA PLATAFORMA
4.1. Os custos operacionais da plataforma, no valor de R$ [CUSTO_PLATAFORMA_VALOR] (correspondente a 1% do valor de referência da transação), serão suportados na proporção de [PERCENTUAL_PERMUTANTE1]% pelo PERMUTANTE 1 e [PERCENTUAL_PERMUTANTE2]% pelo PERMUTANTE 2.

CLÁUSULA QUINTA – DO FORO
5.1. Fica eleito o foro da Comarca de [FORO_COMARCA] para dirimir quaisquer controvérsias oriundas deste contrato, com renúncia a qualquer outro.

E por estarem justos e contratados, assinam o presente instrumento em duas vias de igual teor e forma, na presença de testemunhas.

[LOCAL_ASSINATURA], [DATA_EXTENSO].


___________________________________________
[PERMUTANTE1_NOME]
(Permutante 1)


___________________________________________
[PERMUTANTE2_NOME]
(Permutante 2)


Testemunhas:

1. __________________________
   Nome:
   CPF:

2. __________________________
   Nome:
   CPF:
`;


// Helper component for file upload display
const FileUploadDisplay = ({
  file,
  onFileChange,
  onClear,
  acceptedTypes,
  maxSize,
  isReadOnly = false,
  label,
}: {
  file: File | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  acceptedTypes: string;
  maxSize: string;
  isReadOnly?: boolean;
  label: string;
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const handleDownload = () => {
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleView = () => {
     if (file) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
    }
  }

  if (file) {
    return (
      <div className="flex items-center justify-between p-3 rounded-md border bg-secondary/30">
        <div className="flex items-center gap-3 overflow-hidden">
          <FileText className="h-6 w-6 text-primary flex-shrink-0" />
          <p className="font-semibold text-sm truncate" title={file.name}>
            {label}
          </p>
        </div>
        <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handleView} className="h-7 w-7 text-muted-foreground">
                <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDownload} className="h-7 w-7 text-muted-foreground">
                <Download className="h-4 w-4" />
            </Button>
            {!isReadOnly && (
                <Button variant="ghost" size="icon" onClick={onClear} className="h-7 w-7 text-muted-foreground">
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
      </div>
    );
  }

  if (isReadOnly) {
    return (
        <div className="flex items-center justify-between p-3 rounded-md border bg-secondary/30 text-muted-foreground">
             <p className="font-semibold text-sm truncate">Nenhum documento anexado.</p>
        </div>
    )
  }

  return (
    <div
      className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 text-center cursor-pointer hover:bg-secondary transition-colors"
      onClick={() => inputRef.current?.click()}
    >
      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
      <p className="mt-4 text-sm text-muted-foreground">Arraste ou clique para fazer upload</p>
      <p className="text-xs text-muted-foreground/70">{acceptedTypes} (máx. {maxSize})</p>
      <Input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={onFileChange}
        accept={acceptedTypes}
      />
    </div>
  );
};


export function AdjustmentClientPage({ asset, assetType }: { asset: Asset, assetType: AssetType }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const currentUserRole = 'buyer';

  const isArchiveView = searchParams.get('view') === 'archive';
  
  const [costSplit, setCostSplit] = React.useState('50/50');
  const [sellerAgrees, setSellerAgrees] = React.useState(isArchiveView);
  const [buyerAgrees, setBuyerAgrees] = React.useState(isArchiveView);
  const [isFinalized, setFinalized] = React.useState(isArchiveView);
  const [isTransactionComplete, setTransactionComplete] = React.useState(isArchiveView);

  const [buyerProofFile, setBuyerProofFile] = React.useState<File | null>(
    isArchiveView ? new File(["comprovante"], "comprovante_pagamento.pdf", { type: "application/pdf" }) : null
  );
  const [sellerProofFile, setSellerProofFile] = React.useState<File | null>(
    isArchiveView ? new File(["transferencia"], "doc_transferencia_ativo.pdf", { type: "application/pdf" }) : null
  );

  const platformFeePercentage = 1;
  
  const [saleContractFields, setSaleContractFields] = React.useState({
      nacionalidade: 'Brasileiro(a)',
      estado_civil: 'Casado(a)',
      profissao: 'Empresário(a)',
      rg: '',
      cpf: '',
      endereco_completo: '',
      comprador_nome: 'COMPRADOR EXEMPLO S.A.',
      nacionalidade_comprador: 'Brasileira',
      estado_civil_comprador: '',
      profissao_comprador: 'Empresa',
      rg_comprador: '',
      cpf_comprador: '00.000.000/0001-00',
      endereco_comprador: 'Rua Exemplo, 123',
      condicao_pagamento: 'À vista, mediante transferência bancária (TED ou PIX).',
      detalhes_pagamento: 'O pagamento será realizado em conta de titularidade do VENDEDOR, informada na plataforma.',
      data_posse: 'data da assinatura deste instrumento',
      percentual_multa: '10',
      vias_contrato: '2 (duas)'
  });

  const [leaseContractFields, setLeaseContractFields] = React.useState({
      nacionalidade_arrendador: 'Brasileiro(a)',
      estado_civil_arrendador: 'Casado(a)',
      profissao_arrendador: 'Empresário(a)',
      rg_arrendador: '',
      cpf_arrendador: '',
      endereco_arrendador: '',
      arrendatario_nome: 'ARRENDATÁRIO EXEMPLO LTDA',
      nacionalidade_arrendatario: 'Brasileira',
      estado_civil_arrendatario: '',
      profissao_arrendatario: 'Empresa',
      rg_arrendatario: '',
      cpf_arrendatario: '11.111.111/0001-11',
      endereco_arrendatario: 'Avenida Exemplo, 456',
      finalidade_arrendamento: 'Pecuária',
      prazo_arrendamento: '5',
      forma_pagamento_arrendamento: 'Anual',
      dia_pagamento_arrendamento: '10',
      data_inicio: new Date().toLocaleDateString('pt-BR'),
      data_termino: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toLocaleDateString('pt-BR'),
      area_arrendada: 'sizeHa' in asset ? asset.sizeHa.toString() : '0',
  });
  
  const [permutaContractFields, setPermutaContractFields] = React.useState({
    // Permutante 1 (Vendedor)
    nacionalidade1: 'Brasileiro(a)',
    estado_civil1: 'Casado(a)',
    profissao1: 'Empresário(a)',
    rg1: '',
    cpf_cnpj1: '',
    endereco1: '',
    entrega1: `Imóvel Rural: ${asset.id}`,
    // Permutante 2 (Comprador)
    permutante2_nome: 'PERMUTANTE 2 EXEMPLO',
    nacionalidade2: 'Brasileira',
    estado_civil2: '',
    profissao2: 'Investidor',
    rg2: '',
    cpf_cnpj2: '22.222.222/0001-22',
    endereco2: 'Av. Teste, 789',
    entrega2: 'Imóvel Urbano, Matrícula 98765, situado em São Paulo, SP.',
    // Cláusulas
    valor_torna: '0',
    prazo_torna: '0',
    prazo_entrega: '15',
    foro_comarca: 'São Paulo, SP'
  });

  const handlePermutaFieldChange = (field: keyof typeof permutaContractFields, value: string) => {
    setPermutaContractFields(prev => ({ ...prev, [field]: value }));
  };

  const handleSaleContractFieldChange = (field: keyof typeof saleContractFields, value: string) => {
    if (field === 'percentual_multa') {
        const numValue = parseInt(value, 10);
        if (numValue > 25) {
            toast({ title: "Valor Inválido", description: "A multa por rescisão não pode exceder 25%.", variant: "destructive"});
            setSaleContractFields(prev => ({ ...prev, [field]: '25' }));
            return;
        }
    }
      setSaleContractFields(prev => ({ ...prev, [field]: value }));
  };

  const handleLeaseContractFieldChange = (field: keyof typeof leaseContractFields, value: string) => {
    setLeaseContractFields(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setter(event.target.files[0]);
       toast({ title: "Arquivo anexado!", description: event.target.files[0].name });
    }
  };

  const id = asset.id;
  const sellerName = 'owner' in asset ? asset.owner : asset.sellerName;
  const negotiatedValue = 'price' in asset ? (asset.price || 0) : 50000;
  const platformCost = negotiatedValue * (platformFeePercentage / 100);

  const paymentInfo = {
    bank: "Banco Exemplo S.A.",
    agency: "0001",
    account: "12345-6",
    pixKey: "documento@email.com",
    holder: sellerName,
  };


  const getCostSplitPercentages = () => {
    switch (costSplit) {
      case '50/50': return { seller: '50', buyer: '50' };
      case 'seller': return { seller: '100', buyer: '0' };
      case 'buyer': return { seller: '0', buyer: '100' };
      default: return { seller: '50', buyer: '50' };
    }
  };
  
  const getContractTemplate = () => {
    if (assetType === 'rural-land' && 'businessType' in asset) {
        if(asset.businessType === 'Venda') return ruralLandSaleContractTemplate;
        if(asset.businessType === 'Arrendamento') return ruralLandLeaseContractTemplate;
        if(asset.businessType === 'Permuta') return ruralLandPermutaContractTemplate;
    }
    return carbonCreditContractTemplate;
  }

  const getFinalContractText = () => {
    const currentTemplate = getContractTemplate();
    const currentDate = new Date();
    const extendedDate = currentDate.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });

     if (currentTemplate === ruralLandPermutaContractTemplate && 'title' in asset) {
      const land = asset as RuralLand;
      const [municipio] = land.location.split(',').map(s => s.trim());

      return ruralLandPermutaContractTemplate
        .replace(/\[PERMUTANTE1_NOME\]/g, land.owner)
        .replace(/\[nacionalidade1\]/g, permutaContractFields.nacionalidade1 || '[..]')
        .replace(/\[estado_civil1\]/g, permutaContractFields.estado_civil1 || '[..]')
        .replace(/\[profissao1\]/g, permutaContractFields.profissao1 || '[..]')
        .replace(/\[rg1\]/g, permutaContractFields.rg1 || '[..]')
        .replace(/\[cpf_cnpj1\]/g, permutaContractFields.cpf_cnpj1 || '[..]')
        .replace(/\[endereco1\]/g, permutaContractFields.endereco1 || '[..]')
        .replace(/\[PERMUTANTE2_NOME\]/g, permutaContractFields.permutante2_nome || '[..]')
        .replace(/\[nacionalidade2\]/g, permutaContractFields.nacionalidade2 || '[..]')
        .replace(/\[estado_civil2\]/g, permutaContractFields.estado_civil2 || '[..]')
        .replace(/\[profissao2\]/g, permutaContractFields.profissao2 || '[..]')
        .replace(/\[rg2\]/g, permutaContractFields.rg2 || '[..]')
        .replace(/\[cpf_cnpj2\]/g, permutaContractFields.cpf_cnpj2 || '[..]')
        .replace(/\[endereco2\]/g, permutaContractFields.endereco2 || '[..]')
        .replace(/\[ENTREGA1\]/g, permutaContractFields.entrega1)
        .replace(/\[ENTREGA2\]/g, permutaContractFields.entrega2)
        .replace(/\[VALOR_TORNA\]/g, new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(permutaContractFields.valor_torna)))
        .replace(/\[PRAZO_TORNA\]/g, permutaContractFields.prazo_torna)
        .replace(/\[PRAZO_ENTREGA\]/g, permutaContractFields.prazo_entrega)
        .replace(/\[CUSTO_PLATAFORMA_VALOR\]/g, platformCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
        .replace(/\[PERCENTUAL_PERMUTANTE1\]/g, getCostSplitPercentages().seller)
        .replace(/\[PERCENTUAL_PERMUTANTE2\]/g, getCostSplitPercentages().buyer)
        .replace(/\[FORO_COMARCA\]/g, permutaContractFields.foro_comarca || '[..]')
        .replace(/\[LOCAL_ASSINATURA\]/g, municipio || '[Cidade]')
        .replace(/\[DATA_EXTENSO\]/g, extendedDate);
    }
    
    if (currentTemplate === ruralLandLeaseContractTemplate && 'title' in asset) {
      const land = asset as RuralLand;
      const [municipio] = land.location.split(',').map(s => s.trim());
      
      return ruralLandLeaseContractTemplate
          .replace(/\[ARRENDADOR_NOME\]/g, land.owner)
          .replace(/\[nacionalidade_arrendador\]/g, leaseContractFields.nacionalidade_arrendador || '[..]')
          .replace(/\[estado_civil_arrendador\]/g, leaseContractFields.estado_civil_arrendador || '[..]')
          .replace(/\[profissao_arrendador\]/g, leaseContractFields.profissao_arrendador || '[..]')
          .replace(/\[rg_arrendador\]/g, leaseContractFields.rg_arrendador || '[..]')
          .replace(/\[cpf_arrendador\]/g, leaseContractFields.cpf_arrendador || '[..]')
          .replace(/\[endereco_arrendador\]/g, leaseContractFields.endereco_arrendador || '[..]')
          .replace(/\[ARRENDATARIO_NOME\]/g, leaseContractFields.arrendatario_nome || '[..]')
          .replace(/\[nacionalidade_arrendatario\]/g, leaseContractFields.nacionalidade_arrendatario || '[..]')
          .replace(/\[estado_civil_arrendatario\]/g, leaseContractFields.estado_civil_arrendatario || '[..]')
          .replace(/\[profissao_arrendatario\]/g, leaseContractFields.profissao_arrendatario || '[..]')
          .replace(/\[rg_arrendatario\]/g, leaseContractFields.rg_arrendatario || '[..]')
          .replace(/\[cpf_arrendatario\]/g, leaseContractFields.cpf_arrendatario || '[..]')
          .replace(/\[endereco_arrendatario\]/g, leaseContractFields.endereco_arrendatario || '[..]')
          .replace(/\[localizacao_completa\]/g, land.location)
          .replace(/\[matricula_imovel\]/g, land.registration)
          .replace(/\[comarca_imovel\]/g, municipio || '[..]')
          .replace(/\[area_total\]/g, land.sizeHa.toLocaleString('pt-BR'))
          .replace(/\[AREA_ARRENDADA\]/g, leaseContractFields.area_arrendada)
          .replace(/\[NOME_PROPRIEDADE\]/g, land.title)
          .replace(/\[DATA_INICIO\]/g, leaseContractFields.data_inicio)
          .replace(/\[DATA_TERMINO\]/g, leaseContractFields.data_termino)
          .replace(/\[PERIODO_PAGAMENTO\]/g, leaseContractFields.forma_pagamento_arrendamento.toLowerCase())
          .replace(/\[finalidade_arrendamento\]/g, leaseContractFields.finalidade_arrendamento || '[..]')
          .replace(/\[prazo_arrendamento\]/g, leaseContractFields.prazo_arrendamento || '[..]')
          .replace(/\[forma_pagamento_arrendamento\]/g, leaseContractFields.forma_pagamento_arrendamento || '[..]')
          .replace(/\[dia_pagamento_arrendamento\]/g, leaseContractFields.dia_pagamento_arrendamento || '[..]')
          .replace(/\[VALOR_NEGOCIADO\]/g, new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(negotiatedValue))
          .replace(/\[CUSTO_PLATAFORMA_VALOR\]/g, platformCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
          .replace(/\[PERCENTUAL_ARRENDADOR\]/g, getCostSplitPercentages().seller)
          .replace(/\[PERCENTUAL_ARRENDATARIO\]/g, getCostSplitPercentages().buyer)
          .replace(/\[LOCAL_ASSINATURA\]/g, municipio || '[Cidade]')
          .replace(/\[DATA_EXTENSO\]/g, extendedDate);
    }
    
    if (currentTemplate === ruralLandSaleContractTemplate && 'title' in asset) {
        const land = asset as RuralLand;
        const [municipio, estado] = land.location.split(',').map(s => s.trim());
        
        return ruralLandSaleContractTemplate
            .replace(/\[VENDEDOR_NOME\]/g, land.owner)
            .replace(/\[nacionalidade\]/g, saleContractFields.nacionalidade || '[..]')
            .replace(/\[estado civil\]/g, saleContractFields.estado_civil || '[..]')
            .replace(/\[profissao\]/g, saleContractFields.profissao || '[..]')
            .replace(/\[rg\]/g, saleContractFields.rg || '[..]')
            .replace(/\[cpf\]/g, saleContractFields.cpf || '[..]')
            .replace(/\[endereco completo\]/g, saleContractFields.endereco_completo || '[..]')
            .replace(/\[COMPRADOR_NOME\]/g, saleContractFields.comprador_nome || '[..]')
            .replace(/\[nacionalidade_comprador\]/g, saleContractFields.nacionalidade_comprador || '[..]')
            .replace(/\[estado_civil_comprador\]/g, saleContractFields.estado_civil_comprador || '[..]')
            .replace(/\[profissao_comprador\]/g, saleContractFields.profissao_comprador || '[..]')
            .replace(/\[rg_comprador\]/g, saleContractFields.rg_comprador || '[..]')
            .replace(/\[cpf_comprador\]/g, saleContractFields.cpf_comprador || '[..]')
            .replace(/\[endereco_comprador\]/g, saleContractFields.endereco_comprador || '[..]')
            .replace(/\[denominação da propriedade\]/g, land.title)
            .replace(/\[PROPRIEDADE_MUNICIPIO\]/g, municipio || '[..]')
            .replace(/\[PROPRIEDADE_ESTADO\]/g, estado || '[..]')
            .replace(/\[PROPRIEDADE_AREA\]/g, land.sizeHa.toLocaleString('pt-BR'))
            .replace(/\[PROPRIEDADE_COMARCA\]/g, municipio || '[..]')
            .replace(/\[PROPRIEDADE_MATRICULA\]/g, land.registration)
            .replace(/\[VALOR_NEGOCIADO_NUM\]/g, new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(negotiatedValue))
            .replace(/\[condicao_pagamento\]/g, saleContractFields.condicao_pagamento || '[..]')
            .replace(/\[detalhes_pagamento\]/g, saleContractFields.detalhes_pagamento || '[..]')
            .replace(/\[data_posse\]/g, saleContractFields.data_posse || '[..]')
            .replace(/\[percentual_multa\]/g, saleContractFields.percentual_multa || '[..]')
            .replace(/\[FORO_COMARCA\]/g, municipio || '[..]')
            .replace(/\[vias_contrato\]/g, saleContractFields.vias_contrato || '[..]')
            .replace(/\[LOCAL_ASSINATURA\]/g, municipio || '[Cidade]')
            .replace(/\[DATA_EXTENSO\]/g, extendedDate)
            .replace(/\[CUSTO_PLATAFORMA_VALOR\]/g, platformCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
            .replace(/\[PERCENTUAL_VENDEDOR\]/g, getCostSplitPercentages().seller)
            .replace(/\[PERCENTUAL_COMPRADOR\]/g, getCostSplitPercentages().buyer);
    }
    
    // Default to Carbon Credit / Other contract
    return carbonCreditContractTemplate
      .replace(/\[NOME\/RAZÃO SOCIAL DO CEDENTE\]/g, sellerName)
      .replace(/\[CNPJ\/CPF nº DO CEDENTE\]/g, '[..]')
      .replace(/\[ENDERECO DO CEDENTE\]/g, '[..]')
      .replace(/\[REPRESENTANTE DO CEDENTE\]/g, '[..]')
      .replace(/\[NOME\/RAZÃO SOCIAL DO CESSIONÁRIO\]/g, '[..]')
      .replace(/\[CNPJ\/CPF nº DO CESSIONÁRIO\]/g, '[..]')
      .replace(/\[ENDERECO DO CESSIONÁRIO\]/g, '[..]')
      .replace(/\[REPRESENTANTE DO CESSIONÁRIO\]/g, '[..]')
      .replace(/\[VALOR_NEGOCIADO\]/g, new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(negotiatedValue))
      .replace(/\[PLATAFORMA_PROJETO\]/g, 'standard' in asset ? asset.standard : '[plataforma/projeto]')
      .replace(/\[ID_ATIVO\]/g, asset.id)
      .replace(/\[QUANTIDADE_ATIVO\]/g, 'quantity' in asset ? asset.quantity.toLocaleString('pt-BR') : '[N/A]')
      .replace(/\[VALOR_TOTAL_ATIVO\]/g, new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format('amount' in asset && asset.amount ? asset.amount : 'quantity' in asset && asset.quantity ? asset.quantity * asset.pricePerCredit : negotiatedValue))
      .replace(/\[CUSTO_PLATAFORMA_VALOR\]/g, platformCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
      .replace(/\[PERCENTUAL_CEDENTE\]/g, getCostSplitPercentages().seller)
      .replace(/\[PERCENTUAL_CESSIONARIO\]/g, getCostSplitPercentages().buyer)
      .replace(/\[PRAZO_PAGAMENTO\]/g, '[..]')
      .replace(/\[FORMA_PAGAMENTO\]/g, '[..]')
      .replace(/\[FORO_COMARCA\]/g, 'location' in asset ? asset.location.split(',')[0] : '[Cidade/UF]')
      .replace(/\[LOCAL_ASSINATURA\]/g, 'location' in asset ? asset.location.split(',')[0] : '[Cidade]')
      .replace(/\[DATA_EXTENSO\]/g, extendedDate);
  }

  const finalContractText = getFinalContractText();

    const handleFinalize = () => {
        toast({
            title: "Contrato Finalizado!",
            description: "O contrato foi assinado e a negociação concluída.",
        });
        setFinalized(true);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
    
    const copyToClipboard = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${fieldName} copiado!`,
            description: `O valor foi copiado para a área de transferência.`
        });
    }

    const handleDownloadPdf = () => {
        try {
            const doc = new jsPDF('p', 'pt', 'a4');
            
            doc.addFont('times', 'normal', 'WinAnsiEncoding');
            doc.addFont('times', 'bold', 'WinAnsiEncoding');
            doc.setFont('times', 'normal');
            doc.setFontSize(12);

            const margin = { top: 60, right: 60, bottom: 60, left: 60 };
            const contentWidth = doc.internal.pageSize.getWidth() - margin.left - margin.right;
            const pageHeight = doc.internal.pageSize.getHeight();
            let cursorY = margin.top;

            const addPageNumbers = (doc: jsPDF) => {
                const pageCount = (doc.internal as any).getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.setFontSize(10);
                    doc.text(
                        `Página ${i} de ${pageCount}`,
                        doc.internal.pageSize.getWidth() / 2,
                        pageHeight - margin.bottom / 2,
                        { align: 'center' }
                    );
                }
            };
            
            const lines = doc.splitTextToSize(finalContractText, contentWidth);
            
            lines.forEach((line: string) => {
                if (cursorY + 12 * 1.5 > pageHeight - margin.bottom) {
                    doc.addPage();
                    cursorY = margin.top;
                }
                doc.text(line, margin.left, cursorY, { align: 'justify', lineHeightFactor: 1.5 });
                cursorY += 12 * 1.5; // Aproximadamente 1.5 de espaçamento
            });

            addPageNumbers(doc);
            doc.save('contrato_assinado.pdf');

        } catch (error) {
            console.error("Failed to generate PDF", error);
            toast({ title: "Erro ao Gerar PDF", variant: "destructive" });
        }
    }

    const handleDownloadDocx = () => {
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Contrato</title></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + '<pre style="font-family: \'Times New Roman\', Times, serif; font-size: 12pt; text-align: justify; white-space: pre-wrap; line-height: 1.5;">' + finalContractText + '</pre>' + footer;
        
        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = 'contrato_assinado.doc';
        fileDownload.click();
        document.body.removeChild(fileDownload);
        toast({ title: "Download do DOC iniciado!" });
    }

    const handleFinishTransaction = () => {
        setTransactionComplete(true);
        toast({
            title: "Transação Finalizada e Salva!",
            description: "Todos os documentos foram salvos. Você será redirecionado.",
        });
        setTimeout(() => {
            router.push('/dashboard?tab=history');
        }, 2000);
    }
    
    // RENDER FOR ARCHIVE VIEW
    if (isArchiveView) {
        return (
             <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para o Gerenciamento
                        </Link>
                    </Button>
                </div>
                 <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold font-headline flex items-center gap-3">
                        <FileSignature className="h-7 w-7" />
                        Arquivo da Negociação: {asset.id}
                      </CardTitle>
                      <CardDescription>
                        Esta é uma visualização dos documentos finais da negociação concluída.
                      </CardDescription>
                    </CardHeader>
                </Card>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contrato Definitivo</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="h-80 overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-4 font-serif text-sm relative" style={{textAlign: 'justify', lineHeight: '1.5'}}>
                                {finalContractText}
                                <div className="absolute bottom-4 right-4 bg-green-100 text-green-800 p-2 rounded-md border border-green-300 text-xs font-semibold">
                                    ✓ Assinado Digitalmente (ICP-Brasil)
                                </div>
                            </div>
                             <div className="flex gap-2 mt-4">
                                <Button onClick={handleDownloadPdf}>
                                    <Download className="mr-2 h-4 w-4" /> Baixar PDF
                                </Button>
                                <Button variant="outline" onClick={handleDownloadDocx}>
                                    <FileText className="mr-2 h-4 w-4" /> Baixar DOCX
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Documentos Comprobatórios</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-2">Comprovação do Comprador</h3>
                                <FileUploadDisplay
                                    file={buyerProofFile}
                                    label="comprovante_pagamento.pdf"
                                    onFileChange={() => {}}
                                    onClear={() => {}}
                                    acceptedTypes=""
                                    maxSize=""
                                    isReadOnly={true}
                                />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Comprovação do Vendedor</h3>
                                <FileUploadDisplay
                                    file={sellerProofFile}
                                    label="doc_transferencia_ativo.pdf"
                                    onFileChange={() => {}}
                                    onClear={() => {}}
                                    acceptedTypes=""
                                    maxSize=""
                                    isReadOnly={true}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
             </div>
        )
    }

  // RENDER FOR ACTIVE ADJUSTMENT
  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
            <Link href={`/negociacao/${id}?type=${assetType}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para a Negociação
            </Link>
        </Button>
      </div>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold font-headline flex items-center gap-3">
                        <FileSignature className="h-8 w-8" />
                        Ajuste e Assinatura do Contrato
                    </CardTitle>
                    <CardDescription>
                        Revise e preencha os termos, defina os custos e finalize a negociação.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna de Edição */}
                <div className="space-y-6">
                     {assetType === 'rural-land' && 'businessType' in asset && asset.businessType === 'Permuta' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Edit className="h-5 w-5"/> Preencher Dados do Contrato (Permuta)</CardTitle>
                                <CardDescription>Preencha os detalhes da permuta.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <h3 className="font-semibold text-md">Dados do Permutante 1 (Vendedor)</h3>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><Label>Nacionalidade</Label><Input value={permutaContractFields.nacionalidade1} onChange={(e) => handlePermutaFieldChange('nacionalidade1', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Estado Civil</Label><Input value={permutaContractFields.estado_civil1} onChange={(e) => handlePermutaFieldChange('estado_civil1', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>CPF/CNPJ</Label><Input value={permutaContractFields.cpf_cnpj1} onChange={(e) => handlePermutaFieldChange('cpf_cnpj1', e.target.value)} /></div>
                                    <div className="space-y-1 md:col-span-2"><Label>Endereço Completo</Label><Input value={permutaContractFields.endereco1} onChange={(e) => handlePermutaFieldChange('endereco1', e.target.value)} /></div>
                                </div>
                                <h3 className="font-semibold text-md pt-4">Dados do Permutante 2 (Comprador)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><Label>Nome/Razão Social</Label><Input value={permutaContractFields.permutante2_nome} onChange={(e) => handlePermutaFieldChange('permutante2_nome', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>CPF/CNPJ</Label><Input value={permutaContractFields.cpf_cnpj2} onChange={(e) => handlePermutaFieldChange('cpf_cnpj2', e.target.value)} /></div>
                                    <div className="space-y-1 md:col-span-2"><Label>Endereço Completo</Label><Input value={permutaContractFields.endereco2} onChange={(e) => handlePermutaFieldChange('endereco2', e.target.value)} /></div>
                                </div>
                                <h3 className="font-semibold text-md pt-4">Cláusulas do Contrato</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1"><Label>Cl. 1a: O que o Permutante 1 entrega</Label><Textarea value={permutaContractFields.entrega1} onChange={(e) => handlePermutaFieldChange('entrega1', e.target.value)} rows={2} /></div>
                                    <div className="space-y-1"><Label>Cl. 1b: O que o Permutante 2 entrega</Label><Textarea value={permutaContractFields.entrega2} onChange={(e) => handlePermutaFieldChange('entrega2', e.target.value)} rows={2} /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1"><Label>Cl. 2.2: Valor da Torna (R$)</Label><Input type="number" value={permutaContractFields.valor_torna} onChange={(e) => handlePermutaFieldChange('valor_torna', e.target.value)} /></div>
                                      <div className="space-y-1"><Label>Cl. 2.2: Prazo Torna (dias)</Label><Input type="number" value={permutaContractFields.prazo_torna} onChange={(e) => handlePermutaFieldChange('prazo_torna', e.target.value)} /></div>
                                      <div className="space-y-1"><Label>Cl. 3.1: Prazo de Entrega (dias)</Label><Input type="number" value={permutaContractFields.prazo_entrega} onChange={(e) => handlePermutaFieldChange('prazo_entrega', e.target.value)} /></div>
                                    </div>
                                    <div className="space-y-1"><Label>Cl. 5.1: Foro</Label><Input value={permutaContractFields.foro_comarca} onChange={(e) => handlePermutaFieldChange('foro_comarca', e.target.value)} /></div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {assetType === 'rural-land' && 'businessType' in asset && asset.businessType === 'Venda' && (
                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Edit className="h-5 w-5"/> Preencher Dados do Contrato (Venda)</CardTitle>
                                <CardDescription>Preencha as informações que não estão na plataforma.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <h3 className="font-semibold text-md">Dados do Vendedor</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><Label>Nacionalidade</Label><Input value={saleContractFields.nacionalidade} onChange={(e) => handleSaleContractFieldChange('nacionalidade', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Estado Civil</Label><Input value={saleContractFields.estado_civil} onChange={(e) => handleSaleContractFieldChange('estado_civil', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Profissão</Label><Input value={saleContractFields.profissao} onChange={(e) => handleSaleContractFieldChange('profissao', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>RG</Label><Input value={saleContractFields.rg} onChange={(e) => handleSaleContractFieldChange('rg', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>CPF</Label><Input value={saleContractFields.cpf} onChange={(e) => handleSaleContractFieldChange('cpf', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Endereço Completo</Label><Input value={saleContractFields.endereco_completo} onChange={(e) => handleSaleContractFieldChange('endereco_completo', e.target.value)} /></div>
                                </div>
                                <h3 className="font-semibold text-md pt-4">Dados do Comprador</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><Label>Nome/Razão Social</Label><Input value={saleContractFields.comprador_nome} onChange={(e) => handleSaleContractFieldChange('comprador_nome', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>CPF/CNPJ</Label><Input value={saleContractFields.cpf_comprador} onChange={(e) => handleSaleContractFieldChange('cpf_comprador', e.target.value)} /></div>
                                    <div className="space-y-1 md:col-span-2"><Label>Endereço Completo</Label><Input value={saleContractFields.endereco_comprador} onChange={(e) => handleSaleContractFieldChange('endereco_comprador', e.target.value)} /></div>
                                </div>
                                <h3 className="font-semibold text-md pt-4">Cláusulas do Contrato</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1"><Label>Cl. 2.1a: Condição de Pagamento</Label><Textarea value={saleContractFields.condicao_pagamento} onChange={(e) => handleSaleContractFieldChange('condicao_pagamento', e.target.value)} rows={2} /></div>
                                    <div className="space-y-1"><Label>Cl. 2.1b: Detalhes Pagamento</Label><Textarea value={saleContractFields.detalhes_pagamento} onChange={(e) => handleSaleContractFieldChange('detalhes_pagamento', e.target.value)} rows={2} /></div>
                                    <div className="space-y-1"><Label>Cl. 3.1: Data de Imissão na Posse</Label><Input value={saleContractFields.data_posse} onChange={(e) => handleSaleContractFieldChange('data_posse', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Cl. 6.1: Multa por Rescisão (%)</Label><Input type="number" max="25" value={saleContractFields.percentual_multa} onChange={(e) => handleSaleContractFieldChange('percentual_multa', e.target.value)} /></div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {assetType === 'rural-land' && 'businessType' in asset && asset.businessType === 'Arrendamento' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Edit className="h-5 w-5"/> Preencher Dados do Contrato (Arrendamento)</CardTitle>
                                <CardDescription>Preencha as informações que não estão na plataforma.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <h3 className="font-semibold text-md">Dados do Arrendador (Vendedor)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><Label>Nacionalidade</Label><Input value={leaseContractFields.nacionalidade_arrendador} onChange={(e) => handleLeaseContractFieldChange('nacionalidade_arrendador', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Estado Civil</Label><Input value={leaseContractFields.estado_civil_arrendador} onChange={(e) => handleLeaseContractFieldChange('estado_civil_arrendador', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>CPF</Label><Input value={leaseContractFields.cpf_arrendador} onChange={(e) => handleLeaseContractFieldChange('cpf_arrendador', e.target.value)} /></div>
                                    <div className="space-y-1 md:col-span-2"><Label>Endereço Completo</Label><Input value={leaseContractFields.endereco_arrendador} onChange={(e) => handleLeaseContractFieldChange('endereco_arrendador', e.target.value)} /></div>
                                </div>
                                <h3 className="font-semibold text-md pt-4">Dados do Arrendatário (Comprador)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><Label>Nome/Razão Social</Label><Input value={leaseContractFields.arrendatario_nome} onChange={(e) => handleLeaseContractFieldChange('arrendatario_nome', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>CPF/CNPJ</Label><Input value={leaseContractFields.cpf_arrendatario} onChange={(e) => handleLeaseContractFieldChange('cpf_arrendatario', e.target.value)} /></div>
                                    <div className="space-y-1 md:col-span-2"><Label>Endereço Completo</Label><Input value={leaseContractFields.endereco_arrendatario} onChange={(e) => handleLeaseContractFieldChange('endereco_arrendatario', e.target.value)} /></div>
                                </div>
                                <h3 className="font-semibold text-md pt-4">Cláusulas do Contrato</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><Label>Cl. 1.1: Finalidade da Exploração</Label><Input value={leaseContractFields.finalidade_arrendamento} onChange={(e) => handleLeaseContractFieldChange('finalidade_arrendamento', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Cl. 1.1: Área Arrendada (Ha)</Label><Input type="number" value={leaseContractFields.area_arrendada} onChange={(e) => handleLeaseContractFieldChange('area_arrendada', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Cl. 2.1: Prazo do Contrato (anos)</Label><Input type="number" value={leaseContractFields.prazo_arrendamento} onChange={(e) => handleLeaseContractFieldChange('prazo_arrendamento', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Cl. 3.1: Forma de Pagamento</Label><Input value={leaseContractFields.forma_pagamento_arrendamento} onChange={(e) => handleLeaseContractFieldChange('forma_pagamento_arrendamento', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Cl. 3.1: Dia do Pagamento</Label><Input value={leaseContractFields.dia_pagamento_arrendamento} onChange={(e) => handleLeaseContractFieldChange('dia_pagamento_arrendamento', e.target.value)} /></div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Custos da Plataforma</CardTitle>
                            <CardDescription>Defina como os custos da transação serão divididos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center bg-secondary p-4 rounded-md">
                                <span className="font-medium text-secondary-foreground">Custo ({platformFeePercentage}%)</span>
                                <span className="text-2xl font-bold text-primary">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(platformCost)}
                                </span>
                            </div>

                            <RadioGroup value={costSplit} onValueChange={setCostSplit} disabled={isFinalized}>
                                <Label>Divisão do Custo</Label>
                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="50/50" id="50-50" />
                                        <Label htmlFor="50-50">50% / 50%</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="seller" id="seller" />
                                        <Label htmlFor="seller">Vendedor 100%</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="buyer" id="buyer" />
                                        <Label htmlFor="buyer">Comprador 100%</Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Acordo Mútuo</CardTitle>
                            <CardDescription>Ambas as partes devem concordar com os termos para finalizar.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className={cn("flex items-center justify-between p-3 rounded-md transition-colors", sellerAgrees ? 'bg-green-100' : 'bg-secondary/40')}>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="seller-agrees" checked={sellerAgrees} onCheckedChange={(checked) => setSellerAgrees(!!checked)} disabled={isFinalized || currentUserRole === 'buyer'} />
                                    <Label htmlFor="seller-agrees" className="font-medium">Vendedor aceita os termos</Label>
                                </div>
                                {sellerAgrees ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                            </div>
                            <div className={cn("flex items-center justify-between p-3 rounded-md transition-colors", buyerAgrees ? 'bg-green-100' : 'bg-secondary/40')}>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="buyer-agrees" checked={buyerAgrees} onCheckedChange={(checked) => setBuyerAgrees(!!checked)} disabled={isFinalized || currentUserRole === 'seller'} />
                                    <Label htmlFor="buyer-agrees" className="font-medium">Comprador aceita os termos</Label>
                                </div>
                                {buyerAgrees ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                            </div>
                        </CardContent>
                    </Card>
                     <Button 
                        size="lg" 
                        className="w-full" 
                        disabled={!sellerAgrees || !buyerAgrees || isFinalized}
                        onClick={handleFinalize}
                    >
                        {isFinalized ? <Lock className="mr-2 h-5 w-5"/> : <CheckCircle className="mr-2 h-5 w-5"/>}
                        {isFinalized ? 'Contrato Assinado' : 'Aceitar e Assinar Contrato'}
                    </Button>
                </div>
                {/* Coluna de Visualização */}
                <div>
                     <Card>
                        <CardHeader>
                            <CardTitle>Pré-visualização do Contrato</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[70vh] overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-4 font-serif text-sm" style={{textAlign: 'justify', lineHeight: '1.5'}}>
                                {finalContractText}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
      
      {isFinalized && (
        <div className="mt-8 space-y-6">
            <Alert className="border-green-600 bg-green-50 text-green-900">
                <Banknote className="h-4 w-4 !text-green-900" />
                <AlertTitle>Ação Necessária: Pagamento</AlertTitle>
                <AlertDescription>
                    <p>O contrato foi assinado! Para concluir a transação, o comprador deve agora realizar a transferência no valor de <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(negotiatedValue)}</strong> para o vendedor utilizando os dados abaixo. Após a confirmação, o ativo será transferido.</p>
                    <Card className="mt-4 bg-white/70">
                        <CardHeader>
                            <CardTitle className="text-base">Dados para Pagamento - {paymentInfo.holder}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between items-center"><span><strong>Banco:</strong> {paymentInfo.bank}</span></div>
                            <div className="flex justify-between items-center"><span><strong>Agência:</strong> {paymentInfo.agency}</span></div>
                            <div className="flex justify-between items-center"><span><strong>Conta:</strong> {paymentInfo.account}</span></div>
                            <div className="flex justify-between items-center">
                                <span><strong>Chave PIX:</strong> {paymentInfo.pixKey}</span>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyToClipboard(paymentInfo.pixKey, 'Chave PIX')}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle>Contrato Definitivo</CardTitle>
                    <CardDescription>Este é o contrato final assinado digitalmente via ICP-Brasil.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80 overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-4 font-serif text-sm relative" style={{textAlign: 'justify', lineHeight: '1.5'}}>
                        {finalContractText}
                        <div className="absolute bottom-4 right-4 bg-green-100 text-green-800 p-2 rounded-md border border-green-300 text-xs font-semibold">
                            ✓ Assinado Digitalmente (ICP-Brasil)
                        </div>
                    </div>
                </CardContent>
                <CardContent>
                    <div className="flex gap-2">
                        <Button onClick={handleDownloadPdf}>
                            <Download className="mr-2 h-4 w-4" /> Baixar PDF
                        </Button>
                         <Button variant="outline" onClick={handleDownloadDocx}>
                            <FileText className="mr-2 h-4 w-4" /> Baixar DOCX
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Comprovação do Comprador</CardTitle>
                        <CardDescription>Anexe o comprovante de pagamento para o vendedor liberar o ativo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <FileUploadDisplay
                            file={buyerProofFile}
                            label="comprovante_pagamento.pdf"
                            onFileChange={handleFileChange(setBuyerProofFile)}
                            onClear={() => setBuyerProofFile(null)}
                            acceptedTypes="PDF, JPG, PNG"
                            maxSize="10MB"
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Comprovação do Vendedor</CardTitle>
                        <CardDescription>Anexe o documento que comprova a transferência da titularidade do ativo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FileUploadDisplay
                            file={sellerProofFile}
                            label="doc_transferencia_ativo.pdf"
                            onFileChange={handleFileChange(setSellerProofFile)}
                            onClear={() => setSellerProofFile(null)}
                            acceptedTypes="PDF, DOCX, ZIP"
                            maxSize="25MB"
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="flex justify-end">
                <Button 
                    size="lg"
                    disabled={!buyerProofFile || !sellerProofFile || isTransactionComplete}
                    onClick={handleFinishTransaction}
                >
                    {isTransactionComplete ? 'Transação Salva' : 'Finalizar Transação'}
                </Button>
            </div>
        </div>
      )}

    </div>
  );
}
