
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTransition, useEffect } from 'react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, FileText, Download, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Petition } from '@/lib/types';
import { states } from '@/lib/states';
import { cn } from '@/lib/utils';
import { numberToWords } from '@/lib/number-to-words'; // Assuming this utility exists


const petitionSchema = z.object({
  title: z.string().min(5, 'O título é muito curto.'),
  customHeader: z.string().optional(),
  
  // Dados do Cedente (Vendedor) - Simulados por enquanto
  partyCnpj: z.string().min(14, 'O CNPJ da parte é obrigatório.'),
  creditBalance: z.coerce.number().min(0, 'O saldo credor não pode ser negativo.'),
  
  // Dados do Representante
  representativeName: z.string().min(1, "Nome do representante é obrigatório."),
  representativeRole: z.string().min(1, "Cargo do representante é obrigatório."),
  representativeState: z.string().min(1, "Estado do representante é obrigatório."),
  representativeCpf: z.string().min(11, "CPF do representante é inválido."),

  // Dados da Operação
  tipoOperacao: z.string().min(1, "O tipo de operação é obrigatório."),
  periodoApuracao: z.string().min(1, "O período de apuração é obrigatório."),
  negotiatedValue: z.coerce.number().optional(),
  
  // Corpo e data
  petitionBody: z.string().min(50, 'O corpo da petição precisa ser mais detalhado.'),
  petitionDate: z.date().optional(),

  // Status
  status: z.enum(['rascunho', 'finalizado']),
});


type PetitionFormValues = z.infer<typeof petitionSchema>;

interface PetitionFormProps {
  petition: Petition | null;
  onSuccess: () => void;
}

const defaultPetitionBodyTemplate = `AO(À)
Ilmo.(a) Sr.(a) Secretário(a) da Fazenda do Estado de [UF]

Ref.: Requerimento de transferência de crédito acumulado de ICMS — Pedido de homologação

Requerente (Cedente):
Razão Social: [RAZAO_SOCIAL_CEDENTE]
CNPJ: [CNPJ_CEDENTE]
Inscrição Estadual: [IE_CEDENTE]
Endereço: [ENDERECO_CEDENTE]
Representante legal: [NOME_REPRESENTANTE_CEDENTE] — CPF: [CPF_REPRESENTANTE] — Cargo: [CARGO_REPRESENTANTE]

Requerido (Cessionário/Indicação de destinatário do crédito):
Razão Social: [RAZAO_SOCIAL_CESSIONARIO]
CNPJ: [CNPJ_CESSIONARIO]
Inscrição Estadual: [IE_CESSIONARIO]
Endereço: [ENDERECO_CESSIONARIO]

I — DOS FATOS

O(a) Requerente declara ser titular de créditos acumulados de ICMS no valor nominal de R$ [VALOR_NOMINAL_CREDITO] (por extenso: [VALOR_NOMINAL_POR_EXTENSO]), gerados no período de [PERIODO_DE_APURACAO], originados de operações de [TIPO_DE_OPERACAO], devidamente demonstrados nas notas fiscais e documentos que seguem anexos.

Em decorrência de negociação comercial com [RAZAO_SOCIAL_CESSIONARIO], as partes acordaram a cessão onerosa de parte dos referidos créditos, equivalente a R$ [VALOR_NEGOCIADO] (por extenso: [VALOR_NEGOCIADO_POR_EXTENSO]), correspondente a [QUANTIDADE_OU_PORCENTAGEM]% do saldo indicado, mediante condições ajustadas entre as partes, conforme instrumento particular anexo.

Para instruir o presente pedido, acompanham-se todos os documentos exigidos pela normativa aplicável e pelo procedimento administrativo do Estado de [UF], conforme lista de anexos abaixo.

II — DO DIREITO

O presente pedido funda-se na legislação federal e estadual aplicável, notadamente na Lei Complementar nº 87/1996 (Lei Kandir) e nos dispositivos legais e normativos estaduais que tratam da transferência de créditos acumulados de ICMS, conforme [NORMATIVA_ESTADUAL — inserir Portaria/Decreto/Norma do Estado/UF].

Requer-se a prática dos atos administrativos cabíveis para que seja homologada a cessão/transferência do crédito indicado, com a inscrição e o lançamento do crédito na conta fiscal do cessionário, na forma e condições previstas na regulamentação estadual.

III — DO PEDIDO

Diante do exposto, requer-se, respeitosamente:

a) O recebimento do presente requerimento, com seus documentos comprobatórios;
b) A análise técnica e homologação administrativa da transferência/cessão do crédito acumulado de ICMS na quantia de R$ [VALOR_NEGOCIADO], do CNPJ [CNPJ_CEDENTE] para o CNPJ [CNPJ_CESSIONARIO], nos termos da legislação aplicável;
c) Se necessário, que Vossa Senhoria determine as diligências e complementações documentais eventualmente exigidas;
d) A expedição de ato administrativo que oficialize a transferência, com indicação do lançamento na escrita fiscal do cessionário;
e) A comunicação por meio eletrônico (e-mail ou sistema oficial) dos atos decisórios relacionados ao processo aqui instaurado.

IV — DOCUMENTOS ANEXOS (CHECKLIST)

Instrumento particular de cessão de crédito (contrato/termo de cessão) — [URL_CONTRATO_CESSAO]
Planilha de apuração do crédito (memória de cálculo) — [URL_PLANILHA_APURACAO]
XML / DANFE / relação das NF-e que originaram o crédito (lista: [LISTA_NFES]) — [URL_NFES_ZIP]
Certidão Negativa de Débitos/Certidões exigidas (federal/estadual/municipal, conforme requerido) — [URL_CND_FEDERAL], [URL_CND_ESTADUAL]
Balanço/declaração contábil que comprove a origem do crédito — [URL_BALANCO]
Procuração eletrônica ou autorização para representação (se aplicável) — [URL_PROCURAÇÃO]
Outros documentos: [OUTROS_DOCS_LISTA]

V — DECLARAÇÕES

O(a) Requerente declara, sob as penas da lei, que as informações e documentos apresentados são verdadeiros e correspondem à realidade das operações e apurações fiscais.

O(a) Requerente autoriza que a Secretaria da Fazenda realize as verificações necessárias junto aos órgãos competentes (SPED, SINTEGRA e demais bases públicas).

O(a) Requerente declara estar ciente de que a efetiva transferência do crédito depende de decisão administrativa da Secretaria e de observância das normas estaduais aplicáveis.

VI — REQUEST (FORMALIZAÇÃO FINAL)

Por todo o exposto, requer-se o deferimento do presente pedido de transferência/cessão de crédito acumulado de ICMS, com a consequente homologação e lançamento fiscal em favor do CNPJ [CNPJ_CESSIONARIO], nos termos da legislação aplicável.

Nestes termos, pede deferimento.

[LOCAL], [DATA_PREENCHIDA_PELA_PLATAFORMA]

Pelo(à) Requerente,

[NOME_REPRESENTANTE_CEDENTE]
Representante legal — [CARGO_REPRESENTANTE]
CPF: [CPF_REPRESENTANTE] — Assinatura digital: [ASSINATURA_ICP_BRASIL_URL]
`;


export function PetitionForm({ petition, onSuccess }: PetitionFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<PetitionFormValues>({
    resolver: zodResolver(petitionSchema),
    defaultValues: petition ? {
        ...petition,
        creditBalance: petition.creditBalance || 0,
        petitionDate: petition.dataPeticao ? new Date(petition.dataPeticao) : undefined,
    } : {
      title: 'Nova Petição',
      customHeader: '',
      partyCnpj: '11.222.333/0001-44', // Mock
      creditBalance: 150000.00, // Mock
      representativeName: '',
      representativeRole: '',
      representativeState: '',
      representativeCpf: '',
      tipoOperacao: '',
      periodoApuracao: '',
      negotiatedValue: 145000.00, // Mock
      petitionBody: defaultPetitionBodyTemplate,
      status: 'rascunho',
    },
  });

  const watchedFields = form.watch();

  useEffect(() => {
    // Mock data that would come from the platform
    const cedente = {
        razaoSocial: 'Empresa Cedente S.A. (Vendedora)',
        ie: '123.456.789.110',
        endereco: 'Rua das Flores, 123, São Paulo, SP',
    };
    const cessionario = {
        razaoSocial: 'Empresa Cessionária Ltda. (Compradora)',
        cnpj: '99.888.777/0001-66',
        ie: '987.654.321.119',
        endereco: 'Avenida Principal, 456, Rio de Janeiro, RJ',
    };
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    
    let updatedBody = defaultPetitionBodyTemplate;

    const replacements = {
        '[UF]': watchedFields.representativeState || '[UF]',
        '[RAZAO_SOCIAL_CEDENTE]': cedente.razaoSocial,
        '[CNPJ_CEDENTE]': watchedFields.partyCnpj || '[CNPJ_CEDENTE]',
        '[IE_CEDENTE]': cedente.ie,
        '[ENDERECO_CEDENTE]': cedente.endereco,
        '[NOME_REPRESENTANTE_CEDENTE]': watchedFields.representativeName || '[NOME_REPRESENTANTE_CEDENTE]',
        '[CPF_REPRESENTANTE]': watchedFields.representativeCpf || '[CPF_REPRESENTANTE]',
        '[CARGO_REPRESENTANTE]': watchedFields.representativeRole || '[CARGO_REPRESENTANTE]',
        '[RAZAO_SOCIAL_CESSIONARIO]': cessionario.razaoSocial,
        '[CNPJ_CESSIONARIO]': cessionario.cnpj,
        '[IE_CESSIONARIO]': cessionario.ie,
        '[ENDERECO_CESSIONARIO]': cessionario.endereco,
        '[VALOR_NOMINAL_CREDITO]': formatCurrency(watchedFields.creditBalance || 0),
        '[VALOR_NOMINAL_POR_EXTENSO]': numberToWords(watchedFields.creditBalance || 0),
        '[PERIODO_DE_APURACAO]': watchedFields.periodoApuracao || '[PERIODO_DE_APURACAO]',
        '[TIPO_DE_OPERACAO]': watchedFields.tipoOperacao || '[TIPO_DE_OPERACAO]',
        '[VALOR_NEGOCIADO]': formatCurrency(watchedFields.negotiatedValue || 0),
        '[VALOR_NEGOCIADO_POR_EXTENSO]': numberToWords(watchedFields.negotiatedValue || 0),
        '[QUANTIDADE_OU_PORCENTAGEM]': watchedFields.creditBalance && watchedFields.negotiatedValue ? ((watchedFields.negotiatedValue / watchedFields.creditBalance) * 100).toFixed(2) : '0.00',
        '[LOCAL]': cedente.endereco.split(',').slice(-2).join(', ').trim(),
        '[DATA_PREENCHIDA_PELA_PLATAFORMA]': watchedFields.petitionDate ? format(watchedFields.petitionDate, 'dd/MM/yyyy') : '[DATA]',
    };

    for (const [key, value] of Object.entries(replacements)) {
        updatedBody = updatedBody.replace(new RegExp(key.replace(/\[/g, '\\[').replace(/\]/g, '\\]'), 'g'), value);
    }
    
    if(updatedBody !== watchedFields.petitionBody) {
      form.setValue('petitionBody', updatedBody, { shouldDirty: true });
    }

  }, [watchedFields, form]);

  const onSubmit = (data: PetitionFormValues) => {
    startTransition(async () => {
      // Here you would call create or update action
      console.log(data);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Sucesso!",
        description: `Petição ${petition ? 'atualizada' : 'criada'} com sucesso.`,
      });
      onSuccess();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
        
        <FormField name="title" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Título da Petição</FormLabel>
                <FormControl><Input {...field} placeholder="Ex: Petição de Transferência ICMS" /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <FormField name="customHeader" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Cabeçalho Personalizado</FormLabel>
                <FormControl><Textarea {...field} rows={2} placeholder="Insira o texto que aparecerá no cabeçalho do documento." /></FormControl>
                <FormMessage />
            </FormItem>
        )} />

        <h3 className="text-lg font-semibold border-b pb-2">Dados da Operação e Representante</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="partyCnpj" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>CNPJ do Cedente (Vendedor)</FormLabel><FormControl><Input {...field} placeholder="00.000.000/0001-00" /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="creditBalance" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Saldo Credor Total (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="negotiatedValue" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Valor Negociado (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="representativeName" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Nome do Representante Legal</FormLabel><FormControl><Input {...field} placeholder="Nome completo do signatário" /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="representativeRole" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Cargo do Representante</FormLabel><FormControl><Input {...field} placeholder="Ex: Diretor Financeiro" /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="representativeCpf" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>CPF do Representante</FormLabel><FormControl><Input {...field} placeholder="000.000.000-00" /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="representativeState" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Estado da Petição (UF)</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione o estado" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {states.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                    </Select><FormMessage />
                </FormItem>
            )} />
             <FormField name="tipoOperacao" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Tipo de Operação (Origem)</FormLabel><FormControl><Input {...field} placeholder="Ex: exportação, insumos agropecuários" /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="periodoApuracao" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Período de Apuração</FormLabel><FormControl><Input {...field} placeholder="Ex: Janeiro/2023 a Dezembro/2023" /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="petitionDate" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Data do Documento</FormLabel>
                  <Popover><PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Escolha uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent></Popover><FormMessage />
                </FormItem>
              )} />
        </div>

        <FormField name="petitionBody" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Corpo da Petição</FormLabel>
                <FormControl><Textarea {...field} rows={15} placeholder="O corpo da petição será preenchido dinamicamente." /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        
        <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Anexos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem>
                    <FormLabel>Planilha de Apuração</FormLabel>
                    <FormControl><Input type="file" /></FormControl>
                </FormItem>
                 <FormItem>
                    <FormLabel>Balanço / Declaração Contábil</FormLabel>
                    <FormControl><Input type="file" /></FormControl>
                </FormItem>
                 <FormItem>
                    <FormLabel>Notas Fiscais (Arquivo .ZIP)</FormLabel>
                    <FormControl><Input type="file" accept=".zip" /></FormControl>
                </FormItem>
                 <FormItem>
                    <FormLabel>Contrato de Cessão</FormLabel>
                    <FormControl><Input type="file" /></FormControl>
                </FormItem>
            </div>
             <div>
                <FormLabel>Outros Documentos</FormLabel>
                <div className="space-y-2 mt-2">
                    <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-secondary">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground"/>
                        <p className="text-sm mt-2">Adicionar novo anexo</p>
                        <Input type="file" className="hidden" />
                    </div>
                </div>
            </div>
        </div>


         <FormField name="status" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="finalizado">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Rascunhos podem ser editados. Petições finalizadas ficam bloqueadas para edição.</FormDescription>
                <FormMessage />
            </FormItem>
        )} />

        <div className="flex justify-between items-center pt-4 border-t">
            <div>
                <Button type="button" variant="outline" disabled={petition?.status !== 'finalizado'}>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar PDF
                </Button>
            </div>
            <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={onSuccess}>Cancelar</Button>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {petition ? 'Salvar Alterações' : 'Criar Petição'}
                </Button>
            </div>
        </div>
      </form>
    </Form>
  );
}
