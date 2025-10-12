

'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, FileSignature, CheckCircle, XCircle, Copy, Banknote, Download, FileText, FileDown, UploadCloud, X, Eye, Lock, Edit, MailCheck, Loader2, AlertTriangle, RefreshCw, Users, BadgePercent, Verified, Fingerprint } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { CarbonCredit, RuralLand, TaxCredit, Duplicata, CompletedDeal } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { numberToWords } from '@/lib/number-to-words';
import { Seal } from '@/components/ui/seal';


type AssetType = 'carbon-credit' | 'tax-credit' | 'rural-land';
type Asset = CarbonCredit | TaxCredit | RuralLand;
type UserRole = 'buyer' | 'seller';


const INVOICE_COUNTER_KEY = 'invoice_global_counter';
const DUPLICATAS_STORAGE_KEY = 'completed_deals_with_duplicates';

const carbonCreditContractTemplate = `CONTRATO DE CESSÃO DE CRÉDITOS DE CARBONO

Pelo presente instrumento particular, as partes:

CEDENTE: [NOME_RAZAO_SOCIAL_CEDENTE], pessoa jurídica de direito privado, inscrita no CNPJ/CPF sob o nº [CNPJ_CPF_CEDENTE], com sede em [ENDERECO_CEDENTE], neste ato representada na forma de seu contrato social por [REPRESENTANTE_CEDENTE].

CESSIONÁRIO: [NOME_RAZAO_SOCIAL_CESSIONARIO], pessoa jurídica de direito privado, inscrita no CNPJ/CPF sob o nº [CNPJ_CPF_CESSIONARIO], com sede em [ENDERECO_CESSIONARIO], neste ato representada na forma de seu contrato social por [REPRESENTANTE_CESSIONARIO].

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

CLÁUSULA QUINTA - DOS CUSTOS E ENCARGOS DA PLATAFORMA
5.1. Os custos operacionais da plataforma, correspondentes a uma taxa de serviço calculada sobre o valor negociado, serão divididos igualmente entre as partes, sendo 50% (cinquenta por cento) devido pelo CEDENTE e 50% (cinquenta por cento) pelo CESSIONÁRIO. O valor exato será detalhado na fatura de serviço emitida pela plataforma.
5.2. Em caso de atraso no pagamento da fatura de serviços da plataforma, incidirá multa moratória de 2% (dois por cento) sobre o valor devido, acrescida de juros de mora de 1% (um por cento) ao mês, calculados pro rata die a partir do dia seguinte ao do vencimento.

CLÁUSULA SEXTA - DAS DECLARAÇÕES E GARANTIAS
6.1. As partes declaram, sob as penas da lei, que possuem capacidade legal e poderes necessários para celebrar o presente contrato e cumprir com suas obrigações.
6.2. O CEDENTE declara que os créditos objeto desta cessão estão livres e desembaraçados de quaisquer ônus, dívidas ou litígios.

CLÁUSULA SÉTIMA - DA LEGISLAÇÃO APLICÁVEL E FORO
7.1. Este contrato será regido e interpretado de acordo com as leis da República Federativa do Brasil.
7.2. Fica eleito o foro da comarca de [FORO_COMARCA], com exclusão de qualquer outro, por mais privilegiado que seja, para dirimir quaisquer conflitos ou dúvidas decorrentes deste instrumento.

E por estarem justas e contratadas, as partes assinam o presente contrato em 2 (duas) vias de igual teor e forma, na presença das testemunhas abaixo.

[LOCAL_ASSINATURA], [DATA_EXTENSO].


____________________________________
[NOME_RAZAO_SOCIAL_CEDENTE]
(Cedente)


__________________________________
[NOME_RAZAO_SOCIAL_CESSIONARIO]
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

PROMITENTE VENDEDOR(A): [VENDEDOR_NOME], [nacionalidade], [estado_civil], [profissao], portador(a) do RG nº [rg] e inscrito(a) no CPF/MF sob o nº [cpf], residente e domiciliado(a) em [endereco_completo], doravante denominado simplesmente VENDEDOR.

PROMISSÁRIO COMPRADOR(A): [COMPRADOR_NOME], [nacionalidade_comprador], [estado_civil_comprador], [profissao_comprador], portador(a) do RG nº [rg_comprador] e inscrito(a) no CPF/MF sob o nº [cpf_comprador], residente e domiciliado(a) em [endereco_comprador], doravante denominado simplesmente COMPRADOR.

Resolvem celebrar o presente Contrato Particular de Promessa de Compra e Venda de Imóvel Rural, que se regerá pelas seguintes cláusulas e condições:

CLÁUSULA PRIMEIRA - DO OBJETO
1.1. O VENDEDOR é legítimo proprietário e possuidor do imóvel rural denominado "[DENOMINACAO_PROPRIEDADE]", situado no município de [PROPRIEDADE_MUNICIPIO], Estado de [PROPRIEDADE_ESTADO], com área total de [PROPRIEDADE_AREA] hectares, devidamente registrado no Cartório de Registro de Imóveis da Comarca de [PROPRIEDADE_COMARCA], sob a matrícula nº [PROPRIEDADE_MATRICULA].

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

CLÁUSULA SÉTIMA - DOS CUSTOS E ENCARGOS DA PLATAFORMA
7.1. Os custos operacionais da plataforma, correspondentes a uma taxa de serviço calculada sobre o valor negociado, serão divididos igualmente entre as partes, sendo 50% (cinquenta por cento) devido pelo VENDEDOR e 50% (cinquenta por cento) pelo COMPRADOR. O valor exato será detalhado na fatura de serviço emitida pela plataforma.
7.2. Em caso de atraso no pagamento da fatura de serviços da plataforma, incidirá multa moratória de 2% (dois por cento) sobre o valor devido, acrescida de juros de mora de 1% (um por cento) ao mês, calculados pro rata die a partir do dia seguinte ao do vencimento.

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

CLÁUSULA SEXTA - DOS CUSTOS E ENCARGOS DA PLATAFORMA
6.1. Os custos operacionais da plataforma, correspondentes a uma taxa de serviço calculada sobre o valor do contrato, serão divididos igualmente entre as partes, sendo 50% (cinquenta por cento) devido pelo ARRENDADOR e 50% (cinquenta por cento) pelo ARRENDATÁRIO. O valor exato será detalhado na fatura de serviço emitida pela plataforma.
6.2. Em caso de atraso no pagamento da fatura de serviços da plataforma, incidirá multa moratória de 2% (dois por cento) sobre o valor devido, acrescida de juros de mora de 1% (um por cento) ao mês, calculados pro rata die a partir do dia seguinte ao do vencimento.

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

CLÁUSULA QUARTA - DOS CUSTOS E ENCARGOS DA PLATAFORMA
4.1. Os custos operacionais da plataforma, correspondentes a uma taxa de serviço calculada sobre o valor de referência da transação, serão divididos igualmente entre as partes, sendo 50% (cinquenta por cento) devido pelo PERMUTANTE 1 e 50% (cinquenta por cento) pelo PERMUTANTE 2. O valor exato será detalhado na fatura de serviço emitida pela plataforma.
4.2. Em caso de atraso no pagamento da fatura de serviços da plataforma, incidirá multa moratória de 2% (dois por cento) sobre o valor devido, acrescida de juros de mora de 1% (um por cento) ao mês, calculados pro rata die a partir do dia seguinte ao do vencimento.

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
  disabled = false,
}: {
  file: File | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  acceptedTypes: string;
  maxSize: string;
  isReadOnly?: boolean;
  label: string;
  disabled?: boolean;
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
            {!isReadOnly && !disabled && (
                <Button variant="ghost" size="icon" onClick={onClear} className="h-7 w-7 text-muted-foreground">
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
      </div>
    );
  }

  if (isReadOnly || disabled) {
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

// Custom hook for persisting state to localStorage
function usePersistentState<T>(key: string, initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = React.useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialState;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialState;
        } catch (error) {
            console.error(error);
            return initialState;
        }
    });

    React.useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(error);
        }
    }, [key, state]);

    return [state, setState];
}

type AuthStatus = 'pending' | 'validated' | 'expired';
type AuthState = {
    status: AuthStatus;
    timestamp?: number; 
};

// Moved AuthStatusIndicator outside to prevent re-creation on every render.
const AuthStatusIndicator = React.memo(({ 
    role, 
    authStatus,
    email,
    onEmailChange,
    onSendVerification,
    isSendingEmail,
    currentUserRole,
    isFinalized
}: { 
    role: 'buyer' | 'seller';
    authStatus: AuthStatus;
    email: string;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSendVerification: () => void;
    isSendingEmail: boolean;
    currentUserRole: UserRole;
    isFinalized: boolean;
}) => {
    let content;
    switch (authStatus) {
        case 'validated':
            content = <span className="flex items-center gap-1.5 text-xs text-green-700 font-medium"><CheckCircle className="h-4 w-4"/> Validado</span>;
            break;
        case 'expired':
            content = (
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs text-destructive font-medium"><XCircle className="h-4 w-4"/> Expirado</span>
                    <Button size="sm" variant="link" className="text-xs h-auto p-0" onClick={onSendVerification} disabled={currentUserRole !== role}>Reenviar</Button>
                </div>
            );
            break;
        default: // pending
            content = <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5"><RefreshCw className="h-3 w-3 animate-spin"/>Pendente</span>;
            break;
    }

    return (
         <div className={cn("p-4 rounded-lg border", authStatus === 'validated' ? "bg-green-50 border-green-200" : authStatus === 'expired' ? "bg-destructive/10 border-destructive/20" : "bg-secondary/30")}>
            <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">{role === 'buyer' ? 'Comprador' : 'Vendedor'}</p>
                {content}
            </div>
            <div className="flex items-center gap-2">
                <Input type="email" placeholder={`email.${role}@exemplo.com`} value={email} onChange={onEmailChange} disabled={authStatus === 'validated' || isSendingEmail || (isFinalized && currentUserRole !== role)}/>
                <Button size="sm" variant="outline" onClick={onSendVerification} disabled={authStatus === 'validated' || isSendingEmail || !email || (isFinalized && currentUserRole !== role)}>
                    {isSendingEmail && currentUserRole === role ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Verificar'}
                </Button>
            </div>
        </div>
    );
});
AuthStatusIndicator.displayName = 'AuthStatusIndicator';

export function AdjustmentClientPage({ asset, assetType }: { asset: Asset, assetType: AssetType }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const negotiationId = `neg_${asset.id}`;
  
  // Simulate a logged-in user. In a real app, this would come from an auth context.
  const LOGGED_IN_USER_NAME = "Comprador Interessado";
  const sellerName = 'owner' in asset ? asset.owner : asset.sellerName;
  
  const [currentUserRole, setCurrentUserRole] = React.useState<UserRole>('buyer');

  React.useEffect(() => {
    // This logic determines the user's role based on the simulated logged-in user.
    // If the logged-in user is the owner of the asset, their role is 'seller'. Otherwise, 'buyer'.
    if (sellerName === LOGGED_IN_USER_NAME) {
      setCurrentUserRole('seller');
    } else {
      setCurrentUserRole('buyer');
    }
  }, [sellerName]);

  const isSeller = currentUserRole === 'seller';
  const isBuyer = currentUserRole === 'buyer';

  const [sellerAgrees, setSellerAgrees] = usePersistentState<boolean>(`${negotiationId}_sellerAgrees`, asset.id === 'cc-003');
  const [buyerAgrees, setBuyerAgrees] = usePersistentState(`${negotiationId}_buyerAgrees`, false);
  const [isFinalized, setFinalized] = usePersistentState(`${negotiationId}_isFinalized`, false);
  const [isTransactionComplete, setTransactionComplete] = usePersistentState(`${negotiationId}_isTransactionComplete`, false);

  const [authStatus, setAuthStatus] = usePersistentState<Record<'buyer' | 'seller', AuthStatus>>(`${negotiationId}_authStatus`, { buyer: 'pending', seller: 'pending' });
  const [authTimestamps, setAuthTimestamps] = usePersistentState<Record<'buyer' | 'seller', number | undefined>>(`${negotiationId}_authTimestamps`,{});
  
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);

  const [sellerEmail, setSellerEmail] = usePersistentState(`${negotiationId}_sellerEmail`, 'vendedor@example.com');
  const [buyerEmail, setBuyerEmail] = usePersistentState(`${negotiationId}_buyerEmail`, 'comprador@example.com');
  
  // Duplicates State
  const [showDuplicatesSection, setShowDuplicatesSection] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = usePersistentState<'vista' | 'parcelado'>(`${negotiationId}_paymentMethod`, 'vista');
  const [numberOfInstallments, setNumberOfInstallments] = usePersistentState(`${negotiationId}_installments`, '2');
  const [duplicates, setDuplicates] = usePersistentState<Duplicata[]>(`${negotiationId}_duplicates`, []);

  const getNextInvoiceNumber = () => {
    if (typeof window === 'undefined') return '000001';
    let currentCounter = parseInt(window.localStorage.getItem(INVOICE_COUNTER_KEY) || '0', 10);
    currentCounter++;
    window.localStorage.setItem(INVOICE_COUNTER_KEY, currentCounter.toString());
    return currentCounter.toString().padStart(6, '0');
  }

  const handleGenerateDuplicates = React.useCallback(() => {
    const totalValue = 'price' in asset && asset.price ? asset.price : ('amount' in asset ? asset.amount : 0);
    if (totalValue === 0) return;

    let newDuplicates: Duplicata[] = [];
    const issueDate = new Date();
    const invoiceNumber = getNextInvoiceNumber();

    const transactionHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const blockTimestamp = new Date().toISOString();

    if (paymentMethod === 'vista') {
        newDuplicates.push({
            orderNumber: '1/1',
            invoiceNumber: invoiceNumber,
            issueDate: issueDate.toLocaleDateString('pt-BR'),
            dueDate: 'À VISTA',
            value: totalValue,
            blockchain: { transactionHash, blockTimestamp }
        });
    } else {
        const installments = parseInt(numberOfInstallments, 10);
        if (isNaN(installments) || installments <= 0) return;
        
        const installmentValue = totalValue / installments;
        for (let i = 1; i <= installments; i++) {
            const dueDate = new Date(issueDate);
            dueDate.setMonth(dueDate.getMonth() + i);
            newDuplicates.push({
                orderNumber: `${String(i).padStart(3, '0')}/${String(installments).padStart(3, '0')}`,
                invoiceNumber: invoiceNumber,
                issueDate: issueDate.toLocaleDateString('pt-BR'),
                dueDate: dueDate.toLocaleDateString('pt-BR'),
                value: installmentValue,
                blockchain: { transactionHash, blockTimestamp }
            });
        }
    }
    setDuplicates(newDuplicates);
  }, [asset, paymentMethod, numberOfInstallments, setDuplicates]);


  React.useEffect(() => {
     handleGenerateDuplicates();
  }, [paymentMethod, numberOfInstallments, handleGenerateDuplicates]);
  
  React.useEffect(() => {
    if (!isFinalized) return;
    
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/contract-status?assetId=${asset.id}`);
        if (res.ok) {
          const { status: newStatus } = await res.json();
          if (newStatus.buyer !== authStatus.buyer || newStatus.seller !== authStatus.seller) {
            setAuthStatus(newStatus);
            if(newStatus.buyer === 'validated' && authStatus.buyer === 'pending') {
                 toast({ title: 'Comprador validou o contrato!' });
            }
             if(newStatus.seller === 'validated' && authStatus.seller === 'pending') {
                 toast({ title: 'Vendedor validou o contrato!' });
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar status do contrato:", error);
      }
    };

    const interval = setInterval(checkStatus, 5000);
    checkStatus();

    return () => clearInterval(interval);
  }, [isFinalized, asset.id, authStatus, toast, setAuthStatus]);


  React.useEffect(() => {
    const checkExpiration = (role: 'buyer' | 'seller') => {
        const timestamp = authTimestamps[role];
        
        if (authStatus[role] === 'pending' && timestamp) {
            const twentyFourHours = 24 * 60 * 60 * 1000;
            if (Date.now() - timestamp > twentyFourHours) {
                setAuthStatus(prev => ({...prev, [role]: 'expired'}));
            }
        }
    };
    const intervalId = setInterval(() => {
        checkExpiration('buyer');
        checkExpiration('seller');
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [authStatus, authTimestamps, setAuthStatus]);

  const [buyerProofFile, setBuyerProofFile] = React.useState<File | null>(null);
  const [sellerProofFile, setSellerProofFile] = React.useState<File | null>(null);
  const [signedContractBuyer, setSignedContractBuyer] = React.useState<File | null>(null);
  const [signedContractSeller, setSignedContractSeller] = React.useState<File | null>(null);
  
  
  const [genericContractFields, setGenericContractFields] = usePersistentState(`${negotiationId}_genericFields`, {
    cnpj_cpf_cedente: '11.111.111/0001-11',
    endereco_cedente: 'Rua do Cedente, 123, Cidade, Estado',
    representante_cedente: 'Nome Representante Cedente',
    nome_razao_social_cessionario: LOGGED_IN_USER_NAME,
    cnpj_cpf_cessionario: '22.222.222/0001-22',
    endereco_cessionario: 'Avenida do Cessionário, 456, Cidade, Estado',
    representante_cessionario: 'Nome Representante Cessionário',
    prazo_pagamento: '5',
    forma_pagamento: 'Transferência Bancária (TED/PIX)',
  });

  const [saleContractFields, setSaleContractFields] = usePersistentState(`${negotiationId}_saleFields`,{
      nacionalidade: 'Brasileiro(a)',
      estado_civil: 'Casado(a)',
      profissao: 'Empresário(a)',
      rg: '11.111.111-1',
      cpf: '111.111.111-11',
      endereco_completo: 'Rua do Vendedor, 123, São Paulo, SP',
      comprador_nome: LOGGED_IN_USER_NAME,
      nacionalidade_comprador: 'Brasileira',
      estado_civil_comprador: '',
      profissao_comprador: 'Empresa',
      rg_comprador: '',
      cpf_comprador: '00.000.000/0001-00',
      endereco_comprador: 'Rua Exemplo, 123, São Paulo - SP',
      condicao_pagamento: 'À vista, mediante transferência bancária (TED ou PIX).',
      detalhes_pagamento: 'O pagamento será realizado em conta de titularidade do VENDEDOR, informada na plataforma.',
      data_posse: 'data da assinatura deste instrumento',
      percentual_multa: '10',
      vias_contrato: '2 (duas)'
  });

  const [leaseContractFields, setLeaseContractFields] = usePersistentState(`${negotiationId}_leaseFields`, {
      nacionalidade_arrendador: 'Brasileiro(a)',
      estado_civil_arrendador: 'Solteiro(a)',
      profissao_arrendador: 'Produtor Rural',
      rg_arrendador: '22.222.222-2',
      cpf_arrendador: '222.222.222-22',
      endereco_arrendador: 'Rua do Arrendador, 456, Cuiabá, MT',
      arrendatario_nome: LOGGED_IN_USER_NAME,
      nacionalidade_arrendatario: 'Brasileira',
      estado_civil_arrendatario: '',
      profissao_arrendatario: 'Empresa',
      rg_arrendatario: '',
      cpf_arrendatario: '11.111.111/0001-11',
      endereco_arrendatario: 'Avenida Exemplo, 456, Belo Horizonte - MG',
      finalidade_arrendamento: 'Pecuária',
      prazo_arrendamento: '5',
      forma_pagamento_arrendamento: 'Anual',
      dia_pagamento_arrendamento: '10',
      data_inicio: new Date().toLocaleDateString('pt-BR'),
      data_termino: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toLocaleDateString('pt-BR'),
      area_arrendada: 'sizeHa' in asset ? asset.sizeHa.toString() : '0',
  });
  
  const [permutaContractFields, setPermutaContractFields] = usePersistentState(`${negotiationId}_permutaFields`, {
    nacionalidade1: 'Brasileiro(a)',
    estado_civil1: 'Divorciado(a)',
    profissao1: 'Investidor(a)',
    rg1: '33.333.333-3',
    cpf_cnpj1: '333.333.333-33',
    endereco1: 'Alameda dos Investidores, 789, Goiânia, GO',
    entrega1: `Imóvel Rural: ${asset.id}`,
    permutante2_nome: LOGGED_IN_USER_NAME,
    nacionalidade2: 'Brasileira',
    estado_civil2: '',
    profissao2: 'Investidor',
    rg2: '',
    cpf_cnpj2: '22.222.222/0001-22',
    endereco2: 'Av. Teste, 789, Curitiba - PR',
    entrega2: 'Imóvel Urbano, Matrícula 98765, situado em São Paulo, SP.',
    valor_torna: '0',
    prazo_torna: '0',
    prazo_entrega: '15',
    foro_comarca: 'São Paulo, SP'
  });

  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<any>>, field: string, value: string) => {
    setter((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setter(event.target.files[0]);
       toast({ title: "Arquivo anexado!", description: event.target.files[0].name });
    }
  };

  const id = asset.id;
  const assetName = 'title' in asset ? asset.title : `Crédito de ${'taxType' in asset ? asset.taxType : 'creditType' in asset ? asset.creditType : ''}`;
  
  const negotiatedValue = 'price' in asset && asset.price ? asset.price : ('amount' in asset ? asset.amount : 50000);
  
  const platformFeePercentage = negotiatedValue <= 100000 ? 1.5 : 1;
  const platformCost = negotiatedValue * (platformFeePercentage / 100);

  const getContractTemplateInfo = () => {
    if (assetType === 'rural-land' && 'businessType' in asset) {
        if(asset.businessType === 'Venda') return { template: ruralLandSaleContractTemplate, title: 'Venda de Imóvel Rural' };
        if(asset.businessType === 'Arrendamento') return { template: ruralLandLeaseContractTemplate, title: 'Arrendamento Rural' };
        if(asset.businessType === 'Permuta') return { template: ruralLandPermutaContractTemplate, title: 'Permuta de Imóveis' };
    }
    return { template: carbonCreditContractTemplate, title: 'Cessão de Créditos' };
  }

  const { template: contractTemplate, title: contractTitle } = getContractTemplateInfo();

  const getFinalContractText = React.useCallback(() => {
    const currentDate = new Date();
    const extendedDate = currentDate.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });

     let text = contractTemplate;

     const replacements: { [key: string]: string | undefined } = {
        'VALOR_NEGOCIADO_NUM': new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(negotiatedValue),
        'VALOR_NEGOCIADO': new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(negotiatedValue),
        'DATA_EXTENSO': extendedDate,
        ...genericContractFields
    };

    if ('title' in asset) { // Rural Land
        const land = asset as RuralLand;
        const [municipio, estado] = land.location.split(',').map(s => s.trim());
        Object.assign(replacements, {
            'VENDEDOR_NOME': land.owner,
            'ARRENDADOR_NOME': land.owner,
            'PERMUTANTE1_NOME': land.owner,
            'DENOMINACAO_PROPRIEDADE': land.title,
            'NOME_PROPRIEDADE': land.title,
            'PROPRIEDADE_MUNICIPIO': municipio,
            'PROPRIEDADE_ESTADO': estado || '',
            'PROPRIEDADE_AREA': land.sizeHa.toLocaleString('pt-BR'),
            'PROPRIEDADE_COMARCA': municipio,
            'PROPRIEDADE_MATRICULA': land.registration,
            'FORO_COMARCA': municipio,
            'localizacao_completa': land.location,
            'matricula_imovel': land.registration,
            'comarca_imovel': municipio,
            'area_total': land.sizeHa.toLocaleString('pt-BR'),
            'LOCAL_ASSINATURA': municipio,
            ...saleContractFields,
            ...leaseContractFields,
            ...permutaContractFields
        });
    } else { // Carbon or Tax credit
        Object.assign(replacements, {
            'NOME_RAZAO_SOCIAL_CEDENTE': sellerName,
            'PLATAFORMA_PROJETO': 'standard' in asset ? asset.standard : 'N/A',
            'ID_ATIVO': asset.id,
            'QUANTIDADE_ATIVO': 'quantity' in asset ? asset.quantity.toLocaleString('pt-BR') : 'N/A',
            'VALOR_TOTAL_ATIVO': new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format('amount' in asset && asset.amount ? asset.amount : ('quantity' in asset && 'pricePerCredit' in asset) ? asset.quantity * asset.pricePerCredit : negotiatedValue),
            'FORO_COMARCA': 'location' in asset ? asset.location.split(',')[0] : '',
            'LOCAL_ASSINATURA': 'location' in asset ? asset.location.split(',')[0] : '',
        });
    }
    
    for (const [key, value] of Object.entries(replacements)) {
        text = text.replace(new RegExp(`\\[${key}\\]`, 'g'), value || '[]');
    }

    return text;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset, contractTemplate, genericContractFields, leaseContractFields, negotiatedValue, permutaContractFields, saleContractFields, sellerName]);

  const finalContractText = getFinalContractText();

  
  const handleFinalize = async () => {
    handleGenerateDuplicates(); // Ensure duplicates are generated with the latest invoice number
    toast({
        title: "Contrato Finalizado!",
        description: "O contrato foi bloqueado para edições. Prossiga para a autenticação por e-mail.",
    });
    setFinalized(true);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };
    
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

            const margin = { top: 85.05, right: 56.7, bottom: 56.7, left: 85.05 }; // 3cm e 2cm
            const contentWidth = doc.internal.pageSize.getWidth() - margin.left - margin.right;
            const pageHeight = doc.internal.pageSize.getHeight();
            let cursorY = margin.top;
            const lineHeight = 1.5;

             const addPageNumbers = () => {
                const pageCount = (doc.internal as any).getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.text(
                        `Página ${i} de ${pageCount}`,
                        pageHeight - margin.bottom, doc.internal.pageSize.getWidth() / 2, { align: 'center'}, 90
                    );
                }
            };

            const lines = doc.splitTextToSize(finalContractText, contentWidth);
            
            lines.forEach((line: string) => {
                if (cursorY + (12 * lineHeight) > pageHeight - margin.bottom) {
                    doc.addPage();
                    cursorY = margin.top;
                }

                if (line.startsWith('CLÁUSULA') || line.startsWith('CONTRATO')) {
                    doc.setFont('times', 'bold');
                } else {
                    doc.setFont('times', 'normal');
                }

                doc.text(line, margin.left, cursorY, { align: 'justify', lineHeightFactor: lineHeight });
                cursorY += (12 * lineHeight);
            });

            addPageNumbers();
            doc.save('contrato_para_assinatura.pdf');

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
        fileDownload.download = 'contrato_para_assinatura.doc';
        fileDownload.click();
        document.body.removeChild(fileDownload);
        toast({ title: "Download do DOC iniciado!" });
    }

    const handleFinishTransaction = () => {
        if(typeof window !== 'undefined') {
             const transactionHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
            const blockTimestamp = new Date().toISOString();

            const newDeal: CompletedDeal = {
                assetId: asset.id,
                assetName: assetName,
                duplicates: duplicates,
                seller: {
                    name: sellerName,
                    doc: genericContractFields.cnpj_cpf_cedente,
                    address: genericContractFields.endereco_cedente
                },
                buyer: {
                    name: LOGGED_IN_USER_NAME,
                    doc: genericContractFields.cnpj_cpf_cessionario,
                    address: genericContractFields.endereco_cessionario
                },
                blockchain: { transactionHash, blockTimestamp }
            };
            const existingDeals: CompletedDeal[] = JSON.parse(window.localStorage.getItem(DUPLICATAS_STORAGE_KEY) || '[]');
            window.localStorage.setItem(DUPLICATAS_STORAGE_KEY, JSON.stringify([...existingDeals, newDeal]));
            
            // Set notification flags
            window.localStorage.setItem('newInvoicesAvailable', 'true');
            window.localStorage.setItem('newDuplicatesAvailable', 'true');
            // Dispatch a storage event to notify other tabs/windows (like the header)
            window.dispatchEvent(new Event('storage'));
        }

        setTransactionComplete(true);
        toast({
            title: "Transação Finalizada!",
            description: "A fatura foi gerada e os documentos salvos. Você será redirecionado.",
        });
        setTimeout(() => {
            router.push('/duplicatas');
        }, 3000);
    }
    
    const handleSendVerificationEmail = async (role: 'buyer' | 'seller') => {
        const email = role === 'buyer' ? buyerEmail : sellerEmail;
        if (!email) {
            toast({
                title: `E-mail do ${role === 'buyer' ? 'Comprador' : 'Vendedor'} não fornecido`,
                description: "Por favor, insira o e-mail para enviar a verificação.",
                variant: "destructive"
            });
            return;
        }

        setIsSendingEmail(true);

        try {
            const verificationLink = `${window.location.origin}/api/verify-acceptance?assetId=${asset.id}&role=${role}&email=${encodeURIComponent(email)}`;
            
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: email,
                    subject: "Confirmação de contrato - Pecu’s Intermediate",
                    htmlContent: `
                        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                          <h2>Olá!</h2>
                          <p>Você está recebendo este e-mail para validar um contrato na plataforma PECU'S INTERMEDIATE.</p>
                          <p>Para garantir a segurança de todos, por favor, clique no botão abaixo para confirmar a autenticidade do documento e registrar seu aceite. Isto validará sua parte no contrato.</p>
                          <a href="${verificationLink}"
                            style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; border: none; cursor: pointer;">
                            Confirmar e Validar Contrato
                          </a>
                          <br><br>
                          <small>Este link é válido por 24 horas.</small>
                          <p>Atenciosamente,<br>Equipe PECU'S INTERMEDIATE</p>
                        </div>
                    `,
                }),
            });

            if (!response.ok) throw new Error('Falha na resposta da API de e-mail');

            setAuthTimestamps(prev => ({...prev, [role]: Date.now()}));
            setAuthStatus(prev => ({...prev, [role]: 'pending'}));
            
            await fetch('/api/contract-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assetId: asset.id, role }),
            });

            toast({
                title: "E-mail de verificação enviado!",
                description: `Um link de validação foi enviado para ${email}. O link expira em 24 horas.`
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao enviar e-mail",
                description: "Não foi possível enviar o e-mail de verificação.",
                variant: "destructive"
            });
        } finally {
            setIsSendingEmail(false);
        }
    }
    
    if (searchParams.get('view') === 'archive') {
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
                                    file={new File(["comprovante"], "comprovante_pagamento.pdf", { type: "application/pdf" })}
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
                                    file={new File(["transferencia"], "doc_transferencia_ativo.pdf", { type: "application/pdf" })}
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

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-between items-center">
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
                        {isFinalized ? 'O contrato está finalizado. Prossiga com a autenticação e assinatura.' : 'Revise e preencha os termos, defina os custos e finalize a negociação.'}
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Edit className="h-5 w-5"/> Preencher dados do contrato ({contractTitle})</CardTitle>
                            <CardDescription>Preencha os detalhes que não estão disponíveis na plataforma.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {contractTemplate === ruralLandSaleContractTemplate && (
                                <>
                                    <h3 className="font-semibold text-md">Dados do Vendedor</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1"><Label>Nacionalidade</Label><Input value={saleContractFields.nacionalidade} onChange={(e) => handleFieldChange(setSaleContractFields, 'nacionalidade', e.target.value)} disabled={isFinalized || !isSeller} /></div>
                                        <div className="space-y-1"><Label>Estado Civil</Label><Input value={saleContractFields.estado_civil} onChange={(e) => handleFieldChange(setSaleContractFields, 'estado_civil', e.target.value)} disabled={isFinalized || !isSeller} /></div>
                                        <div className="space-y-1"><Label>Profissão</Label><Input value={saleContractFields.profissao} onChange={(e) => handleFieldChange(setSaleContractFields, 'profissao', e.target.value)} disabled={isFinalized || !isSeller} /></div>
                                        <div className="space-y-1"><Label>RG</Label><Input value={saleContractFields.rg} onChange={(e) => handleFieldChange(setSaleContractFields, 'rg', e.target.value)} disabled={isFinalized || !isSeller} /></div>
                                        <div className="space-y-1"><Label>CPF</Label><Input value={saleContractFields.cpf} onChange={(e) => handleFieldChange(setSaleContractFields, 'cpf', e.target.value)} disabled={isFinalized || !isSeller} /></div>
                                        <div className="space-y-1 md:col-span-2"><Label>Endereço Completo</Label><Input value={saleContractFields.endereco_completo} onChange={(e) => handleFieldChange(setSaleContractFields, 'endereco_completo', e.target.value)} disabled={isFinalized || !isSeller} /></div>
                                    </div>
                                    <h3 className="font-semibold text-md pt-4">Dados do Comprador</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1 md:col-span-2"><Label>Nome/Razão Social</Label><Input value={saleContractFields.comprador_nome} onChange={(e) => handleFieldChange(setSaleContractFields, 'comprador_nome', e.target.value)} disabled={isFinalized || !isBuyer}/></div>
                                        <div className="space-y-1"><Label>CPF/CNPJ</Label><Input value={saleContractFields.cpf_comprador} onChange={(e) => handleFieldChange(setSaleContractFields, 'cpf_comprador', e.target.value)} disabled={isFinalized || !isBuyer}/></div>
                                        <div className="space-y-1"><Label>RG</Label><Input value={saleContractFields.rg_comprador} onChange={(e) => handleFieldChange(setSaleContractFields, 'rg_comprador', e.target.value)} disabled={isFinalized || !isBuyer}/></div>
                                        <div className="space-y-1 md:col-span-2"><Label>Endereço Completo</Label><Input value={saleContractFields.endereco_comprador} onChange={(e) => handleFieldChange(setSaleContractFields, 'endereco_comprador', e.target.value)} disabled={isFinalized || !isBuyer}/></div>
                                    </div>
                                </>
                            )}
                             {contractTemplate === ruralLandLeaseContractTemplate && (
                                <>
                                    <h3 className="font-semibold text-md">Dados do Arrendador (Vendedor)</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1"><Label>Nacionalidade</Label><Input value={leaseContractFields.nacionalidade_arrendador} onChange={(e) => handleFieldChange(setLeaseContractFields, 'nacionalidade_arrendador', e.target.value)} disabled={isFinalized || !isSeller}/></div>
                                        <div className="space-y-1"><Label>Estado Civil</Label><Input value={leaseContractFields.estado_civil_arrendador} onChange={(e) => handleFieldChange(setLeaseContractFields, 'estado_civil_arrendador', e.target.value)} disabled={isFinalized || !isSeller}/></div>
                                        <div className="space-y-1"><Label>CPF</Label><Input value={leaseContractFields.cpf_arrendador} onChange={(e) => handleFieldChange(setLeaseContractFields, 'cpf_arrendador', e.target.value)} disabled={isFinalized || !isSeller}/></div>
                                        <div className="space-y-1 md:col-span-2"><Label>Endereço Completo</Label><Input value={leaseContractFields.endereco_arrendador} onChange={(e) => handleFieldChange(setLeaseContractFields, 'endereco_arrendador', e.target.value)} disabled={isFinalized || !isSeller}/></div>
                                    </div>
                                    <h3 className="font-semibold text-md pt-4">Dados do Arrendatário (Comprador)</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1"><Label>Nome/Razão Social</Label><Input value={leaseContractFields.arrendatario_nome} onChange={(e) => handleFieldChange(setLeaseContractFields, 'arrendatario_nome', e.target.value)} disabled={isFinalized || !isBuyer}/></div>
                                        <div className="space-y-1"><Label>CPF/CNPJ</Label><Input value={leaseContractFields.cpf_arrendatario} onChange={(e) => handleFieldChange(setLeaseContractFields, 'cpf_arrendatario', e.target.value)} disabled={isFinalized || !isBuyer}/></div>
                                        <div className="space-y-1 md:col-span-2"><Label>Endereço Completo</Label><Input value={leaseContractFields.endereco_arrendatario} onChange={(e) => handleFieldChange(setLeaseContractFields, 'endereco_arrendatario', e.target.value)} disabled={isFinalized || !isBuyer}/></div>
                                    </div>
                                </>
                            )}
                             {contractTemplate === ruralLandPermutaContractTemplate && (
                                 <>
                                    <h3 className="font-semibold text-md">Dados do Permutante 1 (Vendedor)</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1"><Label>Nacionalidade</Label><Input value={permutaContractFields.nacionalidade1} onChange={(e) => handleFieldChange(setPermutaContractFields, 'nacionalidade1', e.target.value)} disabled={isFinalized || !isSeller}/></div>
                                        <div className="space-y-1"><Label>Estado Civil</Label><Input value={permutaContractFields.estado_civil1} onChange={(e) => handleFieldChange(setPermutaContractFields, 'estado_civil1', e.target.value)} disabled={isFinalized || !isSeller}/></div>
                                        <div className="space-y-1"><Label>CPF/CNPJ</Label><Input value={permutaContractFields.cpf_cnpj1} onChange={(e) => handleFieldChange(setPermutaContractFields, 'cpf_cnpj1', e.target.value)} disabled={isFinalized || !isSeller}/></div>
                                        <div className="space-y-1 md:col-span-2"><Label>Endereço Completo</Label><Input value={permutaContractFields.endereco1} onChange={(e) => handleFieldChange(setPermutaContractFields, 'endereco1', e.target.value)} disabled={isFinalized || !isSeller}/></div>
                                    </div>
                                    <h3 className="font-semibold text-md pt-4">Dados do Permutante 2 (Comprador)</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1"><Label>Nome/Razão Social</Label><Input value={permutaContractFields.permutante2_nome} onChange={(e) => handleFieldChange(setPermutaContractFields, 'permutante2_nome', e.target.value)} disabled={isFinalized || !isBuyer}/></div>
                                        <div className="space-y-1"><Label>CPF/CNPJ</Label><Input value={permutaContractFields.cpf_cnpj2} onChange={(e) => handleFieldChange(setPermutaContractFields, 'cpf_cnpj2', e.target.value)} disabled={isFinalized || !isBuyer}/></div>
                                        <div className="space-y-1 md:col-span-2"><Label>Endereço Completo</Label><Input value={permutaContractFields.endereco2} onChange={(e) => handleFieldChange(setPermutaContractFields, 'endereco2', e.target.value)} disabled={isFinalized || !isBuyer}/></div>
                                    </div>
                                    <h3 className="font-semibold text-md pt-4">Cláusula do Objeto</h3>
                                    <div className="space-y-2">
                                       <div className="space-y-1"><Label>O que o Permutante 2 entrega</Label><Textarea value={permutaContractFields.entrega2} onChange={(e) => handleFieldChange(setPermutaContractFields, 'entrega2', e.target.value)} rows={2} disabled={isFinalized || !isBuyer}/></div>
                                    </div>
                                </>
                            )}
                             {contractTemplate === carbonCreditContractTemplate && (
                                <>
                                    <h3 className="font-semibold text-md">Dados do Cedente (Vendedor)</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1"><Label>CNPJ/CPF</Label><Input value={genericContractFields.cnpj_cpf_cedente} onChange={(e) => handleFieldChange(setGenericContractFields, 'cnpj_cpf_cedente', e.target.value)} disabled={isFinalized || !isSeller} /></div>
                                        <div className="space-y-1"><Label>Representante Legal</Label><Input value={genericContractFields.representante_cedente} onChange={(e) => handleFieldChange(setGenericContractFields, 'representante_cedente', e.target.value)} disabled={isFinalized || !isSeller} /></div>
                                        <div className="space-y-1 md:col-span-2"><Label>Endereço Completo</Label><Input value={genericContractFields.endereco_cedente} onChange={(e) => handleFieldChange(setGenericContractFields, 'endereco_cedente', e.target.value)} disabled={isFinalized || !isSeller} /></div>
                                    </div>
                                    <h3 className="font-semibold text-md pt-4">Dados do Cessionário (Comprador)</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1"><Label>Nome/Razão Social</Label><Input value={genericContractFields.nome_razao_social_cessionario} onChange={(e) => handleFieldChange(setGenericContractFields, 'nome_razao_social_cessionario', e.target.value)} disabled={isFinalized || !isBuyer} /></div>
                                        <div className="space-y-1"><Label>CNPJ/CPF</Label><Input value={genericContractFields.cnpj_cpf_cessionario} onChange={(e) => handleFieldChange(setGenericContractFields, 'cnpj_cpf_cessionario', e.target.value)} disabled={isFinalized || !isBuyer} /></div>
                                        <div className="space-y-1"><Label>Representante Legal</Label><Input value={genericContractFields.representante_cessionario} onChange={(e) => handleFieldChange(setGenericContractFields, 'representante_cessionario', e.target.value)} disabled={isFinalized || !isBuyer} /></div>
                                        <div className="space-y-1 md:col-span-2"><Label>Endereço Completo</Label><Input value={genericContractFields.endereco_cessionario} onChange={(e) => handleFieldChange(setGenericContractFields, 'endereco_cessionario', e.target.value)} disabled={isFinalized || !isBuyer} /></div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                    
                     <Card>
                        <CardHeader>
                            <CardTitle>Custos da Plataforma</CardTitle>
                            <CardDescription>A taxa de serviço é dividida igualmente (50/50) entre as partes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center bg-secondary p-4 rounded-md">
                                <span className="font-medium text-secondary-foreground">Taxa de Serviço ({platformFeePercentage.toFixed(1)}%)</span>
                                <span className="text-2xl font-bold text-primary">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(platformCost)}
                                </span>
                            </div>
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
                                    <Checkbox id="seller-agrees" checked={sellerAgrees} onCheckedChange={(checked) => setSellerAgrees(!!checked)} disabled={isFinalized || !isSeller} />
                                    <Label htmlFor="seller-agrees" className="font-medium">Vendedor aceita os termos</Label>
                                </div>
                                {sellerAgrees ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                            </div>
                            <div className={cn("flex items-center justify-between p-3 rounded-md transition-colors", buyerAgrees ? 'bg-green-100' : 'bg-secondary/40')}>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="buyer-agrees" checked={buyerAgrees} onCheckedChange={(checked) => setBuyerAgrees(!!checked)} disabled={isFinalized || !isBuyer} />
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
                        {isFinalized ? 'Contrato Finalizado' : 'Aceitar e Finalizar Contrato'}
                    </Button>
                </div>
                <div>
                     <Card>
                        <CardHeader>
                            <CardTitle>Pré-visualização do Contrato</CardTitle>
                            <CardDescription>
                                Este documento será a base do acordo. Faça o download para assinatura.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[70vh] overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-4 font-serif text-sm" style={{textAlign: 'justify', lineHeight: '1.5'}}>
                                {finalContractText}
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button onClick={handleDownloadPdf} disabled={!isFinalized}>
                                    <Download className="mr-2 h-4 w-4" /> Baixar PDF
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
             {isSeller && !isFinalized && (
                <div className="mt-8">
                    <Button variant="outline" onClick={() => setShowDuplicatesSection(prev => !prev)}>
                       {showDuplicatesSection ? 'Ocultar' : 'Gerar'} Duplicatas
                    </Button>
                </div>
             )}
             {(showDuplicatesSection || (duplicates && duplicates.length > 0)) && (
             <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Duplicatas de Venda Mercantil (DM)</CardTitle>
                     <CardDescription>
                        {isSeller ? 'Configure como o pagamento será estruturado através de duplicatas.' : 'Abaixo estão as duplicatas geradas pelo vendedor.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isSeller && !isFinalized && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end p-4 border rounded-lg bg-secondary/30">
                            <div>
                                <Label>Forma de Pagamento</Label>
                                <Select value={paymentMethod} onValueChange={(v: 'vista' | 'parcelado') => setPaymentMethod(v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="vista">À Vista</SelectItem>
                                        <SelectItem value="parcelado">Parcelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {paymentMethod === 'parcelado' && (
                                <div>
                                    <Label>Número de Parcelas</Label>
                                    <Input type="number" value={numberOfInstallments} onChange={e => setNumberOfInstallments(e.target.value)} min="2" max="24" />
                                </div>
                            )}
                        </div>
                    )}
                    {duplicates.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-center">Pré-visualização das Duplicatas</h3>
                             {duplicates.map((dup, index) => (
                                <Card key={index} className="bg-background overflow-hidden">
                                    <CardHeader className="bg-muted p-4">
                                        <CardTitle className="text-lg">DM - DUPLICATA DE VENDA MERCANTIL</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div><Label>Nº de Ordem:</Label><p>{dup.orderNumber}</p></div>
                                            <div><Label>Nº da Fatura:</Label><p>{dup.invoiceNumber}</p></div>
                                            <div><Label>Data Emissão:</Label><p>{dup.issueDate}</p></div>
                                            <div><Label>Data Vencimento:</Label><p>{dup.dueDate}</p></div>
                                        </div>
                                         <div className="text-center p-4 border rounded-lg">
                                            <Label>Valor do Título</Label>
                                            <p className="text-2xl font-bold text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dup.value)}</p>
                                            <p className="text-xs text-muted-foreground">{numberToWords(dup.value)}</p>
                                        </div>
                                         <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <h4 className="font-semibold">SACADOR (Vendedor)</h4>
                                                <p className="text-sm">{sellerName}</p>
                                                <p className="text-xs text-muted-foreground">{genericContractFields.cnpj_cpf_cedente}</p>
                                                <p className="text-xs text-muted-foreground">{genericContractFields.endereco_cedente}</p>
                                            </div>
                                             <div className="space-y-2">
                                                <h4 className="font-semibold">SACADO (Comprador)</h4>
                                                <p className="text-sm">{LOGGED_IN_USER_NAME}</p>
                                                <p className="text-xs text-muted-foreground">{genericContractFields.cnpj_cpf_cessionario}</p>
                                                <p className="text-xs text-muted-foreground">{genericContractFields.endereco_cessionario}</p>
                                            </div>
                                        </div>
                                        <div className="border-t pt-4 mt-4 text-center text-xs space-y-4">
                                            <p className="italic">RECONHEÇO(EMOS) A EXATIDÃO DESTA DUPLICATA DE VENDA MERCANTIL, NA IMPORTÂNCIA ACIMA, QUE PAGAREI(EMOS) AO SACADOR OU À SUA ORDEM, NA PRAÇA E VENCIMENTO INDICADOS.</p>
                                            <div className="grid grid-cols-2 gap-4 pt-4">
                                                 <div className="flex flex-col items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span>{isFinalized ? LOGGED_IN_USER_NAME : '________________'}</span>
                                                         {isFinalized && <Seal text="Assinado Digitalmente" className="border-green-300"/>}
                                                    </div>
                                                    <Label className="text-muted-foreground">Assinatura do Sacado (Comprador)</Label>
                                                </div>
                                                 <div className="flex flex-col items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span>{isFinalized ? sellerName : '________________'}</span>
                                                         {isFinalized && <Seal text="Assinado Digitalmente" className="border-green-300"/>}
                                                    </div>
                                                    <Label className="text-muted-foreground">Assinatura do Sacador (Vendedor)</Label>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
             </Card>
             )}
        </div>
      
      {isFinalized && (
        <div className="mt-8 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MailCheck className="h-5 w-5"/>Autenticação de Contrato</CardTitle>
                    <CardDescription>Para segurança, cada parte deve confirmar a autenticidade do contrato via e-mail. O link expira em 24 horas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                         <AuthStatusIndicator 
                            role="seller" 
                            authStatus={authStatus.seller}
                            email={sellerEmail}
                            onEmailChange={(e) => setSellerEmail(e.target.value)}
                            onSendVerification={() => handleSendVerificationEmail('seller')}
                            isSendingEmail={isSendingEmail}
                            currentUserRole={currentUserRole}
                            isFinalized={isFinalized}
                        />
                        <AuthStatusIndicator 
                            role="buyer"
                            authStatus={authStatus.buyer}
                            email={buyerEmail}
                            onEmailChange={(e) => setBuyerEmail(e.target.value)}
                            onSendVerification={() => handleSendVerificationEmail('buyer')}
                            isSendingEmail={isSendingEmail}
                            currentUserRole={currentUserRole}
                            isFinalized={isFinalized}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className={cn("transition-opacity", (authStatus.buyer !== 'validated' || authStatus.seller !== 'validated') && "opacity-50 pointer-events-none")}>
                <CardHeader>
                    <CardTitle>Assinaturas e Finalização</CardTitle>
                    <CardDescription>Anexe o contrato assinado e os documentos comprobatórios para concluir a transação.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Contrato Assinado pelo Vendedor</h3>
                            <FileUploadDisplay
                                file={signedContractSeller}
                                label="contrato_assinado_vendedor.pdf"
                                onFileChange={handleFileChange(setSignedContractSeller)}
                                onClear={() => setSignedContractSeller(null)}
                                acceptedTypes="PDF, JPG, PNG"
                                maxSize="10MB"
                                disabled={!isSeller}
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Contrato Assinado pelo Comprador</h3>
                            <FileUploadDisplay
                                file={signedContractBuyer}
                                label="contrato_assinado_comprador.pdf"
                                onFileChange={handleFileChange(setSignedContractBuyer)}
                                onClear={() => setSignedContractBuyer(null)}
                                acceptedTypes="PDF, JPG, PNG"
                                maxSize="10MB"
                                disabled={!isBuyer}
                            />
                        </div>
                    </div>
                     <Alert className="border-blue-600 bg-blue-50 text-blue-900">
                        <Banknote className="h-4 w-4 !text-blue-900" />
                        <AlertTitle>Próximo Passo: Pagamento</AlertTitle>
                        <AlertDescription>
                            <p>Após as assinaturas serem coletadas, o comprador deverá realizar a transferência para o vendedor e anexar o comprovante.</p>
                        </AlertDescription>
                    </Alert>
                     <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Comprovação do Comprador (Pagamento)</h3>
                            <FileUploadDisplay
                                file={buyerProofFile}
                                label="comprovante_pagamento.pdf"
                                onFileChange={handleFileChange(setBuyerProofFile)}
                                onClear={() => setBuyerProofFile(null)}
                                acceptedTypes="PDF, JPG, PNG, ZIP"
                                maxSize="10MB"
                                disabled={!isBuyer}
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Comprovação do Vendedor (Transferência do Ativo)</h3>
                            <FileUploadDisplay
                                file={sellerProofFile}
                                label="doc_transferencia_ativo.pdf"
                                onFileChange={handleFileChange(setSellerProofFile)}
                                onClear={() => setSellerProofFile(null)}
                                acceptedTypes="PDF, DOCX, ZIP"
                                maxSize="25MB"
                                disabled={!isSeller}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button 
                    size="lg"
                    disabled={!signedContractBuyer || !signedContractSeller || !buyerProofFile || !sellerProofFile || isTransactionComplete || authStatus.buyer !== 'validated' || authStatus.seller !== 'validated'}
                    onClick={handleFinishTransaction}
                >
                    {isTransactionComplete ? 'Transação Salva' : 'Finalizar Transação e Gerar Fatura'}
                </Button>
            </div>
        </div>
      )}

    </div>
  );
}

    