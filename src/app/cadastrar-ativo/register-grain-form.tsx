
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useTransition, useRef, useState } from 'react';
import Image from 'next/image';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

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
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, Loader2, Trash2, Film, FileText, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Schemas for each grain category
const insumoSchema = z.object({
  grain: z.string().min(1, 'Grão é obrigatório'),
  cultivar: z.string().min(1, 'Cultivar é obrigatório'),
  tecnologia: z.string().optional(),
  ciclo: z.string().optional(),
  tratamento_fungicida: z.boolean().default(false),
  tratamento_inseticida: z.boolean().default(false),
  tratamento_outros: z.string().optional(),
  vigor: z.coerce.number().min(80, "Vigor deve ser no mínimo 80%").optional(),
  germinacao: z.coerce.number().min(1, 'Germinação é obrigatória'),
  zonaRecomendada: z.string().optional(),
  precoPorSaca: z.coerce.number().min(0.01, 'Preço é obrigatório'),
  quantidadeDisponivel: z.coerce.number().min(1, 'Quantidade é obrigatória'),
});

const posColheitaSchema = z.object({
  grain: z.string().min(1, 'Grão é obrigatório'),
  safra: z.string().min(1, 'Safra é obrigatória'),
  umidade: z.coerce.number().max(14, "Umidade máxima deve ser 14%").optional(),
  impurezas: z.coerce.number().optional(),
  avariados: z.coerce.number().optional(),
  modalidadeEntrega: z.string({ required_error: "Modalidade é obrigatória" }),
  localRetirada: z.string().optional(),
  precoPorSaca: z.coerce.number().min(0.01, 'Preço é obrigatório'),
  quantidadeDisponivel: z.coerce.number().min(1, 'Quantidade é obrigatória'),
}).refine(data => data.modalidadeEntrega !== 'EX-SILO' || !!data.localRetirada, {
    message: "Local de retirada é obrigatório para modalidade EX-SILO.",
    path: ["localRetirada"],
});

const futuroSchema = z.object({
  grain: z.string().min(1, 'Grão é obrigatório'),
  safra: z.string().min(1, 'Safra é obrigatória'),
  quantidade: z.coerce.number().min(1, 'Quantidade é obrigatória'),
  dataEntrega: z.date({ required_error: "Data de entrega é obrigatória" }),
  precoFuturo: z.coerce.number().min(0.01, 'Preço é obrigatório'),
  instrumento: z.string({ required_error: "Instrumento é obrigatório" }),
  garantia_seguroRural: z.boolean().default(false),
  garantia_alienacao: z.boolean().default(false),
  bemAlienadoDescricao: z.string().optional(),
  sinalPercentual: z.coerce.number().optional(),
  mecanismoPagamento: z.string().optional(),
}).refine(data => data.garantia_seguroRural || data.garantia_alienacao, {
    message: "Ao menos uma garantia (Seguro Rural ou Alienação Fiduciária) é obrigatória.",
    path: ["garantia_seguroRural"],
});

const formSchema = z.object({
  categoria: z.string({ required_error: "Selecione uma categoria" }),
  // Nested schemas based on category
  insumo: insumoSchema.optional(),
  posColheita: posColheitaSchema.optional(),
  futuro: futuroSchema.optional(),
});

type FormValues = z.infer<typeof formSchema>;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

export function RegisterGrainForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [mediaFiles, setMediaFiles] = useState<{file: File, preview: string, type: 'image' | 'video'}[]>([]);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  
  const form = useForm<FormValues>({
    resolver: async (data, context, options) => {
        let resolver;
        switch(data.categoria) {
            case 'insumo': resolver = zodResolver(insumoSchema); break;
            case 'pos-colheita': resolver = zodResolver(posColheitaSchema); break;
            case 'futuro': resolver = zodResolver(futuroSchema); break;
            default: return { values: data, errors: {} };
        }
        return resolver(data[data.categoria as keyof FormValues] || {}, context, options);
    },
    defaultValues: {
      categoria: undefined,
    },
  });

  const categoria = useWatch({ control: form.control, name: 'categoria' });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setFilesFn: Function, type: 'media' | 'doc') => {
    const files = event.target.files;
    if (files) {
        const newFiles = Array.from(files).filter(file => {
            if (file.size > MAX_FILE_SIZE) {
                toast({ title: "Arquivo muito grande", description: `O arquivo ${file.name} excede 10MB.`, variant: "destructive" });
                return false;
            }
            return true;
        });

        if (type === 'media') {
             const newMediaFiles = newFiles.map(file => ({
                file,
                preview: URL.createObjectURL(file),
                type: file.type.startsWith('video') ? 'video' : 'image' as 'image' | 'video',
            }));
            setFilesFn((prev: any) => [...prev, ...newMediaFiles]);
        } else {
            setFilesFn((prev: any) => [...prev, ...newFiles]);
        }
    }
  };

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(mediaFiles[index].preview);
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeDoc = (index: number) => {
    setDocFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
        const auth = getAuth(app);
        const user = auth.currentUser;
        if (!user) {
            toast({ title: "Erro de Autenticação", description: "Você precisa estar logado.", variant: "destructive" });
            return;
        }

        try {
             const uploadedMedia = await Promise.all(mediaFiles.map(async (mf) => ({
                url: await toBase64(mf.file), type: mf.type, alt: `Imagem do grão`,
            })));
            const uploadedDocs = await Promise.all(docFiles.map(async (df) => ({
                url: await toBase64(df), type: 'doc', alt: df.name,
            })));

            const specificData = data[data.categoria as keyof FormValues];
            const titulo = `Grãos de ${specificData?.grain} - Safra ${specificData?.safra || specificData?.cultivar}`;
            const tipo = `grain-${data.categoria}`;

            const payload = {
              uidFirebase: user.uid,
              titulo: titulo,
              descricao: `Anúncio de ${data.categoria} para ${specificData?.grain}`,
              tipo: tipo,
              price: specificData?.precoPorSaca || specificData?.precoFuturo,
              imagens: uploadedMedia,
              metadados: {
                ...specificData,
                docs: uploadedDocs,
              },
            };

            const response = await fetch('/api/anuncios/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error((await response.json()).error || "Falha ao criar anúncio.");

            toast({ title: "Sucesso!", description: "Anúncio de grãos cadastrado!" });
            form.reset();
            setMediaFiles([]);
            setDocFiles([]);
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    });
  };
  
  const renderFormFields = () => {
    if (!categoria) return null;

    switch (categoria) {
      case 'insumo':
        return (
          <>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2 md:col-span-2">Detalhes do Insumo (Sementes)</h3>
            <FormField name="insumo.grain" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Grão</FormLabel><FormControl><Input {...field} placeholder="Soja, Milho, Trigo..." /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="insumo.cultivar" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Cultivar</FormLabel><FormControl><Input {...field} placeholder="Ex: TMG 7062 IPRO" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="insumo.germinacao" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Germinação (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="insumo.vigor" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Vigor (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <div className="md:col-span-2 space-y-2">
                 <FormLabel>Tratamento Industrial</FormLabel>
                <div className="flex items-center gap-4">
                    <FormField name="insumo.tratamento_fungicida" control={form.control} render={({ field }) => (<FormItem className="flex items-center gap-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Fungicida</FormLabel></FormItem>)} />
                    <FormField name="insumo.tratamento_inseticida" control={form.control} render={({ field }) => (<FormItem className="flex items-center gap-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Inseticida</FormLabel></FormItem>)} />
                </div>
            </div>
            <FormField name="insumo.precoPorSaca" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Preço por Saca (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="insumo.quantidadeDisponivel" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Quantidade de Sacas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </>
        );
      case 'pos-colheita':
        return (
          <>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2 md:col-span-2">Grãos Pós-Colheita (Venda Imediata)</h3>
            <FormField name="posColheita.grain" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Grão</FormLabel><FormControl><Input {...field} placeholder="Soja, Milho..." /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="posColheita.safra" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Safra</FormLabel><FormControl><Input {...field} placeholder="Ex: 23/24" /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="posColheita.umidade" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Umidade (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="posColheita.avariados" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Avariados (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="posColheita.modalidadeEntrega" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Modalidade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="EX-SILO">EX-SILO (Retirada no Local)</SelectItem>
                        <SelectItem value="CIF">CIF (Custo, Seguro e Frete)</SelectItem>
                        <SelectItem value="FOB">FOB (Livre a Bordo)</SelectItem>
                    </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
            {useWatch({ control: form.control, name: 'posColheita.modalidadeEntrega' }) === 'EX-SILO' && (
                 <FormField name="posColheita.localRetirada" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Local de Retirada</FormLabel><FormControl><Input {...field} placeholder="Cidade, Estado do armazém" /></FormControl><FormMessage /></FormItem>
                )} />
            )}
             <FormField name="posColheita.precoPorSaca" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Preço por Saca (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="posColheita.quantidadeDisponivel" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Quantidade de Sacas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </>
        );
      case 'futuro':
        return (
          <>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2 md:col-span-2">Grãos Futuros (CPR / Termo)</h3>
             <FormField name="futuro.grain" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Grão</FormLabel><FormControl><Input {...field} placeholder="Soja, Milho..." /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="futuro.safra" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Safra</FormLabel><FormControl><Input {...field} placeholder="Ex: 24/25" /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="futuro.quantidade" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Quantidade de Sacas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="futuro.precoFuturo" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Preço Futuro por Saca (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="futuro.dataEntrega" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Data de Entrega</FormLabel>
                  <Popover><PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Escolha uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage />
                </FormItem>
              )} />
            <FormField name="futuro.instrumento" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Instrumento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="CPR">CPR (Cédula de Produto Rural)</SelectItem>
                        <SelectItem value="TERMO">Contrato a Termo</SelectItem>
                    </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
             <div className="md:col-span-2 space-y-2">
                 <FormLabel>Garantias Oferecidas</FormLabel>
                <div className="flex items-center gap-4">
                    <FormField name="futuro.garantia_seguroRural" control={form.control} render={({ field }) => (<FormItem className="flex items-center gap-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Seguro Rural</FormLabel></FormItem>)} />
                    <FormField name="futuro.garantia_alienacao" control={form.control} render={({ field }) => (<FormItem className="flex items-center gap-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Alienação Fiduciária</FormLabel></FormItem>)} />
                </div>
                 <FormMessage>{form.formState.errors.futuro?.root?.message}</FormMessage>
            </div>
             {useWatch({ control: form.control, name: 'futuro.garantia_alienacao' }) && (
                <FormField name="futuro.bemAlienadoDescricao" control={form.control} render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel>Descrição do Bem Alienado</FormLabel><FormControl><Textarea rows={2} {...field} placeholder="Ex: Trator John Deere 8R, Matrícula de Imóvel Rural..." /></FormControl><FormMessage /></FormItem>
                )} />
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <FormField name="categoria" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>1. Selecione a Categoria do Anúncio</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Escolha a categoria..." /></SelectTrigger></FormControl>
                <SelectContent>
                    <SelectItem value="insumo">Grãos para Plantio (Insumos/Sementes)</SelectItem>
                    <SelectItem value="pos-colheita">Grãos Pós-Colheita (Venda Imediata)</SelectItem>
                    <SelectItem value="futuro">Venda Futura (CPR / Termo)</SelectItem>
                </SelectContent>
            </Select><FormMessage /></FormItem>
        )} />

        {categoria && (
            <>
                <section>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderFormFields()}
                    </div>
                </section>
                
                <section>
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">Documentos e Mídia</h3>
                    <div className="space-y-4">
                        <Label>Fotos e Vídeos do Lote</Label>
                         <div onClick={() => document.getElementById('media-input')?.click()} className="border-2 border-dashed p-6 text-center cursor-pointer hover:bg-secondary">
                            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                            <p className="text-sm">Clique ou arraste para adicionar fotos/vídeos</p>
                            <Input id="media-input" type="file" className="hidden" multiple accept="image/*,video/*" onChange={(e) => handleFileChange(e, setMediaFiles, 'media')} />
                        </div>
                        {mediaFiles.length > 0 && <div className="grid grid-cols-3 gap-2">{mediaFiles.map((f,i) => <div key={i} className="relative aspect-square"><Image src={f.preview} alt="preview" fill className="object-cover"/><Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeMedia(i)}><Trash2 className="h-4 w-4"/></Button></div>)}</div>}

                        <Label>Documentos (Laudos, Certificados, CPR, etc.)</Label>
                        <div onClick={() => document.getElementById('doc-input')?.click()} className="border-2 border-dashed p-6 text-center cursor-pointer hover:bg-secondary">
                            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                            <p className="text-sm">Clique ou arraste para adicionar documentos</p>
                            <Input id="doc-input" type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => handleFileChange(e, setDocFiles, 'doc')} />
                        </div>
                        {docFiles.length > 0 && <div className="space-y-1">{docFiles.map((f,i) => <div key={i} className="flex justify-between items-center text-sm p-2 bg-muted rounded-md"><span>{f.name}</span><Button type="button" size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeDoc(i)}><Trash2 className="h-4 w-4"/></Button></div>)}</div>}
                    </div>
                </section>

                <Button type="submit" className="w-full text-lg" size="lg" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Cadastrar Anúncio de Grãos
                </Button>
            </>
        )}
      </form>
    </Form>
  );
}
