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

CEDENTE: [NOME/RAZÃO SOCIAL DO CEDENTE], inscrito no [CNPJ/CPF nº DO CEDENTE], com sede/endereço em [ENDERECO DO CEDENTE], neste ato representado por [REPRESENTANTE DO CEDENTE].

CESSIONÁRIO: [NOME/RAZÃO SOCIAL DO CESSIONÁRIO], inscrito no [CNPJ/CPF nº DO CESSIONÁRIO], com sede/endereço em [ENDERECO DO CESSIONÁRIO], neste ato representado por [REPRESENTANTE DO CESSIONÁRIO].

OBJETO: Cessão de Créditos de Carbono no valor de R$ [VALOR_NEGOCIADO].

DATA: [DATA_CONTRATO].

CLÁUSULAS E CONDIÇÕES

Cláusula 1ª – Da Titularidade
O CEDENTE declara ser o legítimo titular e possuidor dos créditos de carbono descritos no sistema [PLATAFORMA_PROJETO], identificados pelo código [ID_ATIVO], cujo valor total corresponde a R$ [VALOR_TOTAL_ATIVO].

Cláusula 2ª – Da Cessão
O CEDENTE cede e transfere ao CESSIONÁRIO, em caráter irrevogável e irretratável, a quantidade de créditos de carbono ora negociada, pelo valor de R$ [VALOR_NEGOCIADO], na forma e condições estabelecidas neste contrato.

Cláusula 3ª – Dos Custos da Plataforma
Os custos operacionais da plataforma, no valor de R$ [CUSTO_PLATAFORMA_VALOR], serão suportados pelas partes na proporção de [PERCENTUAL_CEDENTE] pelo CEDENTE e [PERCENTUAL_CESSIONARIO] pelo CESSIONÁRIO.

Cláusula 4ª – Do Pagamento
O CESSIONÁRIO compromete-se a efetuar o pagamento do valor estabelecido na Cláusula 2ª no prazo de até [PRAZO_PAGAMENTO] dias úteis contados da assinatura deste contrato, mediante [FORMA_PAGAMENTO].

Cláusula 5ª – Das Declarações
As partes declaram que:
a) possuem capacidade legal e poderes necessários para celebrar o presente contrato;
b) estão cientes da natureza e condições dos créditos objeto da cessão;
c) concordam expressamente com todos os termos e obrigações aqui previstos.

Cláusula 6ª – Da Legislação Aplicável e Foro
Este contrato será regido pela legislação brasileira. Fica eleito o foro da comarca de [FORO_COMARCA], com renúncia a qualquer outro, para dirimir eventuais conflitos decorrentes deste instrumento.

E por estarem justas e contratadas, as partes assinam o presente contrato em 2 vias de igual teor e forma, na presença de testemunhas.

[LOCAL_ASSINATURA], [DATA_EXTENSO].

CEDENTE: ____________________________________
[NOME/RAZÃO SOCIAL DO CEDENTE]

CESSIONÁRIO: __________________________________
[NOME/RAZÃO SOCIAL DO CESSIONÁRIO]

TESTEMUNHAS:

Nome: _____________________ – CPF: _______________

Nome: _____________________ – CPF: _______________
`;

const ruralLandSaleContractTemplate = `CONTRATO PARTICULAR DE COMPRA E VENDA DE IMÓVEL RURAL

VENDEDOR(ES): [VENDEDOR_NOME], [nacionalidade], [estado civil], [profissão], portador do RG nº [rg] e CPF nº [cpf], residente e domiciliado em [endereco completo].

COMPRADOR(ES): [COMPRADOR_NOME], [nacionalidade_comprador], [estado_civil_comprador], [profissao_comprador], portador do RG nº [rg_comprador] e CPF nº [cpf_comprador], residente e domiciliado em [endereco_comprador].

As partes acima qualificadas têm entre si justo e contratado o presente Contrato Particular de Compra e Venda de Imóvel Rural, que se regerá pelas cláusulas e condições seguintes:

CLÁUSULAS

Cláusula 1ª – Do Objeto
O VENDEDOR é legítimo proprietário e possuidor do imóvel rural denominado [denominação da propriedade], situado no município de [PROPRIEDADE_MUNICIPIO], Estado de [PROPRIEDADE_ESTADO], com área total de [PROPRIEDADE_AREA] hectares, registrado no Cartório de Registro de Imóveis da Comarca de [PROPRIEDADE_COMARCA], sob a matrícula nº [PROPRIEDADE_MATRICULA].

Cláusula 2ª – Do Preço e Forma de Pagamento
O preço certo e ajustado da venda é de R$ [VALOR_NEGOCIADO_NUM], que o COMPRADOR pagará da seguinte forma:
a) [condicao_pagamento];
b) [detalhes_pagamento].

Cláusula 3ª – Da Imissão na Posse
A posse será transmitida ao COMPRADOR na data de [data_posse], desde que cumpridas as condições de pagamento previstas. A partir desta data, o imóvel poderá ser utilizado para exploração rural, respeitadas as normas ambientais e fundiárias.

Cláusula 4ª – Das Obrigações do Vendedor
O VENDEDOR declara e garante que:
a) o imóvel encontra-se livre e desembaraçado de quaisquer ônus, gravames, hipotecas, arrendamentos, servidões ou litígios;
b) está quite com o pagamento do ITR (Imposto Territorial Rural), CCIR (Certificado de Cadastro de Imóvel Rural) e demais obrigações fiscais até a data da assinatura;
c) possui inscrição no CAR (Cadastro Ambiental Rural), a qual será transferida ao COMPRADOR juntamente com a posse do imóvel;
d) não há passivos ambientais, embargos ou restrições legais incidentes sobre a propriedade.

Cláusula 5ª – Das Obrigações do Comprador
O COMPRADOR compromete-se a:
a) efetuar o pagamento integral do preço ajustado nas condições pactuadas;
b) arcar com despesas de escritura, ITBI, registro e demais custos cartorários;
c) providenciar, após a lavratura da escritura, a atualização cadastral do imóvel junto ao INCRA, Receita Federal e demais órgãos competentes;
d) manter a exploração do imóvel em conformidade com a legislação agrária e ambiental.

Cláusula 6ª – Da Escritura Definitiva
Cumpridas as obrigações contratuais, as partes comparecerão ao Cartório de Notas competente para a lavratura da escritura pública de compra e venda e posterior registro no Cartório de Registro de Imóveis.

Cláusula 7ª – Da Responsabilidade Ambiental
As partes reconhecem que o imóvel possui [detalhes_area_ambiental], conforme registro no CAR.
O VENDEDOR declara que até a presente data não incorreu em infrações ambientais.
O COMPRADOR assume a responsabilidade de preservar e respeitar as áreas de reserva legal e APP, nos termos do Código Florestal (Lei nº 12.651/2012).

Cláusula 8ª – Da Rescisão e Multa
O inadimplemento de qualquer das partes ensejará a rescisão contratual, mediante notificação, ficando a parte inadimplente sujeita ao pagamento de multa equivalente a [percentual_multa]% do valor do contrato, além de perdas e danos.

Cláusula 9ª – Da Legislação e Foro
O presente contrato será regido pela legislação brasileira. Fica eleito o foro da comarca de [FORO_COMARCA], com renúncia a qualquer outro, para dirimir eventuais controvérsias.

Cláusula 10ª – Dos Custos da Plataforma
Os custos operacionais da plataforma, no valor correspondente a 1% (um por cento), no valor de R$ [CUSTO_PLATAFORMA_VALOR], serão suportados pelas partes na seguinte proporção: [PERCENTUAL_VENDEDOR]% pelo VENDEDOR e [PERCENTUAL_COMPRADOR]% pelo COMPRADOR.

E por estarem assim justas e contratadas, firmam o presente contrato em [vias_contrato] vias de igual teor e forma, na presença de testemunhas.

[LOCAL_ASSINATURA], [DATA_EXTENSO].

VENDEDOR(ES): __________________________________
[VENDEDOR_NOME]

COMPRADOR(ES): __________________________________
[COMPRADOR_NOME]

TESTEMUNHAS:

Nome: _____________________ – CPF: _______________

Nome: _____________________ – CPF: _______________
`;

const ruralLandLeaseContractTemplate = `CONTRATO DE ARRENDAMENTO RURAL

ARRENDADOR: [ARRENDADOR_NOME], [nacionalidade_arrendador], [estado_civil_arrendador], [profissao_arrendador], portador do RG nº [rg_arrendador] e CPF nº [cpf_arrendador], residente e domiciliado em [endereco_arrendador].

ARRENDATÁRIO: [ARRENDATARIO_NOME], [nacionalidade_arrendatario], [estado_civil_arrendatario], [profissao_arrendatario], portador do RG nº [rg_arrendatario] e CPF nº [cpf_arrendatario], residente e domiciliado em [endereco_arrendatario].

IMÓVEL: Área rural situada em [localizacao_completa], registrada sob a matrícula nº [matricula_imovel], do Cartório de Registro de Imóveis da Comarca de [comarca_imovel], com área total de [area_total] hectares.

OBJETO: Arrendamento do imóvel rural para fins de [finalidade_arrendamento], com uso autorizado de todas as benfeitorias, instalações e acessões existentes.

VALOR: R$ [VALOR_NEGOCIADO].

DATA: [DATA_CONTRATO].

CLÁUSULAS CONTRATUAIS

Cláusula 1ª – Objeto
O ARRENDADOR cede ao ARRENDATÁRIO, em caráter temporário e oneroso, o uso e gozo do imóvel rural descrito, para exploração de [finalidade_arrendamento], pelo prazo de [prazo_arrendamento] anos, contados da assinatura deste contrato.

Cláusula 2ª – Legitimidade e Situação do Imóvel
O ARRENDADOR declara ser legítimo proprietário do imóvel, livre e desembaraçado de quaisquer ônus que impeçam o arrendamento, responsabilizando-se pela evicção de direito, se houver.

Cláusula 3ª – Preço e Forma de Pagamento
O preço do arrendamento é de R$ [VALOR_NEGOCIADO], a ser pago pelo ARRENDATÁRIO ao ARRENDADOR da seguinte forma: [forma_pagamento_arrendamento], até o dia [dia_pagamento_arrendamento] de cada mês/período.

Cláusula 4ª – Obrigações do ARRENDADOR
O ARRENDADOR se obriga a:
a) garantir ao ARRENDATÁRIO o uso pacífico do imóvel durante todo o prazo do contrato;
b) entregar o imóvel em condições de uso compatíveis com sua finalidade.

Cláusula 5ª – Obrigações do ARRENDATÁRIO
O ARRENDATÁRIO se compromete a:
a) utilizar o imóvel de acordo com a finalidade estabelecida neste contrato;
b) conservar as benfeitorias existentes, responsabilizando-se por danos que der causa;
c) pagar pontualmente o valor do arrendamento;
d) restituir o imóvel ao término do contrato, no estado em que recebeu, ressalvado o desgaste natural pelo uso normal.

Cláusula 6ª – Benfeitorias
As benfeitorias necessárias introduzidas pelo ARRENDATÁRIO serão indenizadas pelo ARRENDADOR. As úteis ou voluptuárias dependerão de prévia autorização por escrito do ARRENDADOR, que poderá ou não indenizá-las ao final do contrato.

Cláusula 7ª – Rescisão
O contrato poderá ser rescindido por:
a) inadimplemento de qualquer cláusula contratual;
b) uso diverso da finalidade ajustada;
c) descumprimento de normas ambientais ou legais.

Cláusula 8ª – Dos Custos da Plataforma
Os custos operacionais da plataforma, no valor correspondente a 1% (um por cento) do valor total do contrato, no valor de R$ [CUSTO_PLATAFORMA_VALOR], serão suportados pelas partes na seguinte proporção: [PERCENTUAL_ARRENDADOR]% pelo ARRENDADOR e [PERCENTUAL_ARRENDATARIO]% pelo ARRENDATÁRIO.

Cláusula 9ª – Foro
Fica eleito o foro da Comarca de [comarca_imovel], com renúncia expressa a qualquer outro, por mais privilegiado que seja, para dirimir eventuais questões oriundas deste contrato.

E por estarem justos e contratados, assinam o presente instrumento em duas vias de igual teor e forma, juntamente com as testemunhas abaixo.

[LOCAL_ASSINATURA], [DATA_EXTENSO].

ARRENDADOR: ___________________________________________
[ARRENDADOR_NOME]

ARRENDATÁRIO: _________________________________________
[ARRENDATARIO_NOME]

TESTEMUNHAS:

Nome: __________________________ CPF: _________________

Nome: __________________________ CPF: _________________
`;

const ruralLandPermutaContractTemplate = `CONTRATO DE PERMUTA

PERMUTANTE 1: [PERMUTANTE1_NOME], [nacionalidade1], [estado_civil1], [profissao1], portador do RG nº [rg1] e CPF/CNPJ nº [cpf_cnpj1], residente e domiciliado/sediado em [endereco1].

PERMUTANTE 2: [PERMUTANTE2_NOME], [nacionalidade2], [estado_civil2], [profissao2], portador do RG nº [rg2] e CPF/CNPJ nº [cpf_cnpj2], residente e domiciliado/sediado em [endereco2].

OBJETO: Permuta de [descrever bens, serviços, créditos ou ativos permutados], conforme detalhamento abaixo.

DATA: [DATA_CONTRATO].

CLÁUSULAS CONTRATUAIS

Cláusula 1ª – Do Objeto
As partes acima qualificadas acordam em realizar a permuta, mediante a troca dos seguintes bens/ativos/serviços:

PERMUTANTE 1 entrega: [ENTREGA1].

PERMUTANTE 2 entrega: [ENTREGA2].

Cláusula 2ª – Da Equivalência e Avaliação
As partes reconhecem que os bens/serviços/ativos objeto da permuta são de valor equivalente, ajustado em comum acordo, não havendo saldo a pagar em dinheiro, salvo disposição expressa em cláusula complementar.

Cláusula 3ª – Da Eventual Torna
Caso se apure diferença de valores entre os bens/serviços permutados, a parte que recebeu maior vantagem compensará a outra mediante pagamento em espécie de R$ [VALOR_TORNA], no prazo de [PRAZO_TORNA] dias, após assinatura do presente contrato.

Cláusula 4ª – Das Obrigações do PERMUTANTE 1
O PERMUTANTE 1 se obriga a entregar ao PERMUTANTE 2 os bens/serviços/ativos descritos na Cláusula 1, livres de quaisquer ônus, no prazo de [PRAZO_ENTREGA1] dias, contados da assinatura deste contrato.

Cláusula 5ª – Das Obrigações do PERMUTANTE 2
O PERMUTANTE 2 se obriga a entregar ao PERMUTANTE 1 os bens/serviços/ativos descritos na Cláusula 1, livres de quaisquer ônus, no prazo de [PRAZO_ENTREGA2] dias, contados da assinatura deste contrato.

Cláusula 6ª – Da Garantia e Responsabilidade
As partes declaram que possuem plena titularidade sobre os bens/serviços/ativos permutados, respondendo pela evicção de direito e por eventuais vícios ou defeitos ocultos que venham a prejudicar a outra parte.

Cláusula 7ª – Da Rescisão
O presente contrato poderá ser rescindido por descumprimento de quaisquer de suas cláusulas, assegurado à parte inocente o direito de exigir perdas e danos, caso cabíveis.

Cláusula 8ª – Dos Custos da Plataforma
Os custos operacionais da plataforma, no valor correspondente a 1% (um por cento) do valor total da permuta, no valor de R$ [CUSTO_PLATAFORMA_VALOR], serão suportados pelas partes na seguinte proporção: [PERCENTUAL_PERMUTANTE1]% pelo PERMUTANTE 1 e [PERCENTUAL_PERMUTANTE2]% pelo PERMUTANTE 2.

Cláusula 9ª – Do Foro
Fica eleito o foro da Comarca de [FORO_COMARCA], com renúncia expressa a qualquer outro, por mais privilegiado que seja, para dirimir quaisquer dúvidas oriundas deste contrato.

E por estarem justos e contratados, assinam o presente instrumento em duas vias de igual teor e forma, juntamente com as testemunhas abaixo.

[LOCAL_ASSINATURA], [DATA_EXTENSO].

PERMUTANTE 1: ___________________________________________
[PERMUTANTE1_NOME]

PERMUTANTE 2: ___________________________________________
[PERMUTANTE2_NOME]

TESTEMUNHAS:

Nome: __________________________ CPF: _________________

Nome: __________________________ CPF: _________________
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
      detalhes_area_ambiental: '[___ hectares de área de reserva legal / APP / área produtiva]',
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
    prazo_entrega1: '15',
    // Permutante 2 (Comprador)
    permutante2_nome: 'PERMUTANTE 2 EXEMPLO',
    nacionalidade2: 'Brasileira',
    estado_civil2: '',
    profissao2: 'Investidor',
    rg2: '',
    cpf_cnpj2: '22.222.222/0001-22',
    endereco2: 'Av. Teste, 789',
    entrega2: 'Imóvel Urbano, Matrícula 98765, situado em São Paulo, SP.',
    prazo_entrega2: '15',
    // Cláusulas
    objeto_permuta: 'Imóvel Rural por Imóvel Urbano',
    valor_torna: '0',
    prazo_torna: '0',
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
    const formattedDate = currentDate.toLocaleDateString('pt-BR');
    const extendedDate = currentDate.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });

     if (currentTemplate === ruralLandPermutaContractTemplate && 'title' in asset) {
      const land = asset as RuralLand;
      const [municipio] = land.location.split(',').map(s => s.trim());

      return ruralLandPermutaContractTemplate
        .replace(/\[PERMUTANTE1_NOME\]/g, land.owner)
        .replace(/\[nacionalidade1\]/g, permutaContractFields.nacionalidade1 || '[...]')
        .replace(/\[estado_civil1\]/g, permutaContractFields.estado_civil1 || '[...]')
        .replace(/\[profissao1\]/g, permutaContractFields.profissao1 || '[...]')
        .replace(/\[rg1\]/g, permutaContractFields.rg1 || '[]')
        .replace(/\[cpf_cnpj1\]/g, permutaContractFields.cpf_cnpj1 || '[]')
        .replace(/\[endereco1\]/g, permutaContractFields.endereco1 || '[...]')
        .replace(/\[PERMUTANTE2_NOME\]/g, permutaContractFields.permutante2_nome || '[...]')
        .replace(/\[nacionalidade2\]/g, permutaContractFields.nacionalidade2 || '[...]')
        .replace(/\[estado_civil2\]/g, permutaContractFields.estado_civil2 || '[...]')
        .replace(/\[profissao2\]/g, permutaContractFields.profissao2 || '[...]')
        .replace(/\[rg2\]/g, permutaContractFields.rg2 || '[]')
        .replace(/\[cpf_cnpj2\]/g, permutaContractFields.cpf_cnpj2 || '[]')
        .replace(/\[endereco2\]/g, permutaContractFields.endereco2 || '[...]')
        .replace(/\[descrever bens, serviços, créditos ou ativos permutados\]/g, permutaContractFields.objeto_permuta || '[...]')
        .replace(/\[DATA_CONTRATO\]/g, formattedDate)
        .replace(/\[ENTREGA1\]/g, permutaContractFields.entrega1)
        .replace(/\[ENTREGA2\]/g, permutaContractFields.entrega2)
        .replace(/\[VALOR_TORNA\]/g, new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(permutaContractFields.valor_torna)))
        .replace(/\[PRAZO_TORNA\]/g, permutaContractFields.prazo_torna)
        .replace(/\[PRAZO_ENTREGA1\]/g, permutaContractFields.prazo_entrega1)
        .replace(/\[PRAZO_ENTREGA2\]/g, permutaContractFields.prazo_entrega2)
        .replace(/\[CUSTO_PLATAFORMA_VALOR\]/g, platformCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
        .replace(/\[PERCENTUAL_PERMUTANTE1\]/g, getCostSplitPercentages().seller)
        .replace(/\[PERCENTUAL_PERMUTANTE2\]/g, getCostSplitPercentages().buyer)
        .replace(/\[FORO_COMARCA\]/g, permutaContractFields.foro_comarca || '[...]')
        .replace(/\[LOCAL_ASSINATURA\]/g, municipio || '[Cidade]')
        .replace(/\[DATA_EXTENSO\]/g, extendedDate);
    }
    
    if (currentTemplate === ruralLandLeaseContractTemplate && 'title' in asset) {
      const land = asset as RuralLand;
      const [municipio] = land.location.split(',').map(s => s.trim());
      
      return ruralLandLeaseContractTemplate
          .replace(/\[ARRENDADOR_NOME\]/g, land.owner)
          .replace(/\[nacionalidade_arrendador\]/g, leaseContractFields.nacionalidade_arrendador || '[...]')
          .replace(/\[estado_civil_arrendador\]/g, leaseContractFields.estado_civil_arrendador || '[...]')
          .replace(/\[profissao_arrendador\]/g, leaseContractFields.profissao_arrendador || '[...]')
          .replace(/\[rg_arrendador\]/g, leaseContractFields.rg_arrendador || '[]')
          .replace(/\[cpf_arrendador\]/g, leaseContractFields.cpf_arrendador || '[]')
          .replace(/\[endereco_arrendador\]/g, leaseContractFields.endereco_arrendador || '[...]')
          .replace(/\[ARRENDATARIO_NOME\]/g, leaseContractFields.arrendatario_nome || '[...]')
          .replace(/\[nacionalidade_arrendatario\]/g, leaseContractFields.nacionalidade_arrendatario || '[...]')
          .replace(/\[estado_civil_arrendatario\]/g, leaseContractFields.estado_civil_arrendatario || '[...]')
          .replace(/\[profissao_arrendatario\]/g, leaseContractFields.profissao_arrendatario || '[...]')
          .replace(/\[rg_arrendatario\]/g, leaseContractFields.rg_arrendatario || '[]')
          .replace(/\[cpf_arrendatario\]/g, leaseContractFields.cpf_arrendatario || '[]')
          .replace(/\[endereco_arrendatario\]/g, leaseContractFields.endereco_arrendatario || '[...]')
          .replace(/\[localizacao_completa\]/g, land.location)
          .replace(/\[matricula_imovel\]/g, land.registration)
          .replace(/\[comarca_imovel\]/g, municipio || '[...]')
          .replace(/\[area_total\]/g, land.sizeHa.toLocaleString('pt-BR'))
          .replace(/\[finalidade_arrendamento\]/g, leaseContractFields.finalidade_arrendamento || '[...]')
          .replace(/\[prazo_arrendamento\]/g, leaseContractFields.prazo_arrendamento || '[...]')
          .replace(/\[forma_pagamento_arrendamento\]/g, leaseContractFields.forma_pagamento_arrendamento || '[...]')
          .replace(/\[dia_pagamento_arrendamento\]/g, leaseContractFields.dia_pagamento_arrendamento || '[...]')
          .replace(/\[VALOR_NEGOCIADO\]/g, new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(negotiatedValue))
          .replace(/\[DATA_CONTRATO\]/g, formattedDate)
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
            .replace(/\[nacionalidade\]/g, saleContractFields.nacionalidade || '[...]')
            .replace(/\[estado civil\]/g, saleContractFields.estado_civil || '[...]')
            .replace(/\[profissão\]/g, saleContractFields.profissao || '[...]')
            .replace(/\[rg\]/g, saleContractFields.rg || '[]')
            .replace(/\[cpf\]/g, saleContractFields.cpf || '[]')
            .replace(/\[endereco completo\]/g, saleContractFields.endereco_completo || '[...]')
            .replace(/\[COMPRADOR_NOME\]/g, saleContractFields.comprador_nome || '[...]')
            .replace(/\[nacionalidade_comprador\]/g, saleContractFields.nacionalidade_comprador || '[...]')
            .replace(/\[estado_civil_comprador\]/g, saleContractFields.estado_civil_comprador || '[...]')
            .replace(/\[profissao_comprador\]/g, saleContractFields.profissao_comprador || '[...]')
            .replace(/\[rg_comprador\]/g, saleContractFields.rg_comprador || '[]')
            .replace(/\[cpf_comprador\]/g, saleContractFields.cpf_comprador || '[]')
            .replace(/\[endereco_comprador\]/g, saleContractFields.endereco_comprador || '[...]')
            .replace(/\[denominação da propriedade\]/g, land.title)
            .replace(/\[PROPRIEDADE_MUNICIPIO\]/g, municipio || '[]')
            .replace(/\[PROPRIEDADE_ESTADO\]/g, estado || '[]')
            .replace(/\[PROPRIEDADE_AREA\]/g, land.sizeHa.toLocaleString('pt-BR'))
            .replace(/\[PROPRIEDADE_COMARCA\]/g, municipio || '[]')
            .replace(/\[PROPRIEDADE_MATRICULA\]/g, land.registration)
            .replace(/\[VALOR_NEGOCIADO_NUM\]/g, new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(negotiatedValue))
            .replace(/\[condicao_pagamento\]/g, saleContractFields.condicao_pagamento || '[]')
            .replace(/\[detalhes_pagamento\]/g, saleContractFields.detalhes_pagamento || '[]')
            .replace(/\[data_posse\]/g, saleContractFields.data_posse || '[]')
            .replace(/\[detalhes_area_ambiental\]/g, saleContractFields.detalhes_area_ambiental || '[...]')
            .replace(/\[percentual_multa\]/g, saleContractFields.percentual_multa || '[]')
            .replace(/\[FORO_COMARCA\]/g, municipio || '[]')
            .replace(/\[vias_contrato\]/g, saleContractFields.vias_contrato || '[...]')
            .replace(/\[LOCAL_ASSINATURA\]/g, municipio || '[Cidade]')
            .replace(/\[DATA_EXTENSO\]/g, extendedDate)
            .replace(/\[CUSTO_PLATAFORMA_VALOR\]/g, platformCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
            .replace(/\[PERCENTUAL_VENDEDOR\]/g, getCostSplitPercentages().seller)
            .replace(/\[PERCENTUAL_COMPRADOR\]/g, getCostSplitPercentages().buyer);
    }
    
    // Default to Carbon Credit / Other contract
    return carbonCreditContractTemplate
      .replace(/\[NOME\/RAZÃO SOCIAL DO CEDENTE\]/g, sellerName)
      .replace(/\[CNPJ\/CPF nº DO CEDENTE\]/g, '[...]')
      .replace(/\[ENDERECO DO CEDENTE\]/g, '[...]')
      .replace(/\[REPRESENTANTE DO CEDENTE\]/g, '[...]')
      .replace(/\[NOME\/RAZÃO SOCIAL DO CESSIONÁRIO\]/g, '[...]')
      .replace(/\[CNPJ\/CPF nº DO CESSIONÁRIO\]/g, '[...]')
      .replace(/\[ENDERECO DO CESSIONÁRIO\]/g, '[...]')
      .replace(/\[REPRESENTANTE DO CESSIONÁRIO\]/g, '[...]')
      .replace(/\[VALOR_NEGOCIADO\]/g, new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(negotiatedValue))
      .replace(/\[DATA_CONTRATO\]/g, formattedDate)
      .replace(/\[PLATAFORMA_PROJETO\]/g, 'standard' in asset ? asset.standard : '[plataforma/projeto]')
      .replace(/\[ID_ATIVO\]/g, asset.id)
      .replace(/\[VALOR_TOTAL_ATIVO\]/g, new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format('amount' in asset && asset.amount ? asset.amount : 'quantity' in asset && asset.quantity ? asset.quantity * asset.pricePerCredit : negotiatedValue))
      .replace(/\[CUSTO_PLATAFORMA_VALOR\]/g, platformCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
      .replace(/\[PERCENTUAL_CEDENTE\]/g, getCostSplitPercentages().seller)
      .replace(/\[PERCENTUAL_CESSIONARIO\]/g, getCostSplitPercentages().buyer)
      .replace(/\[PRAZO_PAGAMENTO\]/g, '[...]')
      .replace(/\[FORMA_PAGAMENTO\]/g, '[...]')
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
            const margin = 40;
            const contentWidth = doc.internal.pageSize.getWidth() - margin * 2;
            const splitText = doc.splitTextToSize(finalContractText, contentWidth);
            doc.text(splitText, margin, margin);
            doc.save('contrato_assinado.pdf');
        } catch (error) {
            console.error("Failed to generate PDF", error);
            toast({ title: "Erro ao Gerar PDF", variant: "destructive" });
        }
    }

    const handleDownloadDocx = () => {
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Contrato</title></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + '<pre>' + finalContractText + '</pre>' + footer;
        
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
                             <div className="h-80 overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-4 font-mono text-sm relative">
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
                                    <div className="space-y-1"><Label>Cl. 1: Objeto da Permuta</Label><Input value={permutaContractFields.objeto_permuta} onChange={(e) => handlePermutaFieldChange('objeto_permuta', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Cl. 1: O que o Permutante 1 entrega</Label><Textarea value={permutaContractFields.entrega1} onChange={(e) => handlePermutaFieldChange('entrega1', e.target.value)} rows={2} /></div>
                                    <div className="space-y-1"><Label>Cl. 1: O que o Permutante 2 entrega</Label><Textarea value={permutaContractFields.entrega2} onChange={(e) => handlePermutaFieldChange('entrega2', e.target.value)} rows={2} /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1"><Label>Cl. 3: Valor da Torna (R$)</Label><Input type="number" value={permutaContractFields.valor_torna} onChange={(e) => handlePermutaFieldChange('valor_torna', e.target.value)} /></div>
                                      <div className="space-y-1"><Label>Cl. 3: Prazo Torna (dias)</Label><Input type="number" value={permutaContractFields.prazo_torna} onChange={(e) => handlePermutaFieldChange('prazo_torna', e.target.value)} /></div>
                                      <div className="space-y-1"><Label>Cl. 4: Prazo Entrega Perm. 1 (dias)</Label><Input type="number" value={permutaContractFields.prazo_entrega1} onChange={(e) => handlePermutaFieldChange('prazo_entrega1', e.target.value)} /></div>
                                      <div className="space-y-1"><Label>Cl. 5: Prazo Entrega Perm. 2 (dias)</Label><Input type="number" value={permutaContractFields.prazo_entrega2} onChange={(e) => handlePermutaFieldChange('prazo_entrega2', e.target.value)} /></div>
                                    </div>
                                    <div className="space-y-1"><Label>Cl. 9: Foro</Label><Input value={permutaContractFields.foro_comarca} onChange={(e) => handlePermutaFieldChange('foro_comarca', e.target.value)} /></div>
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
                                    <div className="space-y-1"><Label>Cl. 2a: Condição de Pagamento</Label><Textarea value={saleContractFields.condicao_pagamento} onChange={(e) => handleSaleContractFieldChange('condicao_pagamento', e.target.value)} rows={2} /></div>
                                    <div className="space-y-1"><Label>Cl. 2b: Detalhes Pagamento</Label><Textarea value={saleContractFields.detalhes_pagamento} onChange={(e) => handleSaleContractFieldChange('detalhes_pagamento', e.target.value)} rows={2} /></div>
                                    <div className="space-y-1"><Label>Cl. 3: Data de Imissão na Posse</Label><Input value={saleContractFields.data_posse} onChange={(e) => handleSaleContractFieldChange('data_posse', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Cl. 7: Detalhes Área Ambiental</Label><Input value={saleContractFields.detalhes_area_ambiental} onChange={(e) => handleSaleContractFieldChange('detalhes_area_ambiental', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Cl. 8: Multa por Rescisão (%)</Label><Input type="number" max="25" value={saleContractFields.percentual_multa} onChange={(e) => handleSaleContractFieldChange('percentual_multa', e.target.value)} /></div>
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
                                    <div className="space-y-1"><Label>Cl. 1: Finalidade da Exploração</Label><Input value={leaseContractFields.finalidade_arrendamento} onChange={(e) => handleLeaseContractFieldChange('finalidade_arrendamento', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Cl. 1: Prazo do Contrato (anos)</Label><Input type="number" value={leaseContractFields.prazo_arrendamento} onChange={(e) => handleLeaseContractFieldChange('prazo_arrendamento', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Cl. 3: Forma de Pagamento</Label><Input value={leaseContractFields.forma_pagamento_arrendamento} onChange={(e) => handleLeaseContractFieldChange('forma_pagamento_arrendamento', e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Cl. 3: Dia do Pagamento</Label><Input value={leaseContractFields.dia_pagamento_arrendamento} onChange={(e) => handleLeaseContractFieldChange('dia_pagamento_arrendamento', e.target.value)} /></div>
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
                            <div className="h-[70vh] overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-4 font-mono text-sm">
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
                    <div className="h-80 overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-4 font-mono text-sm relative">
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
