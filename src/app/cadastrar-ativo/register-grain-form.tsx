
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTransition, useRef, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, Loader2, FileText, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const grainSchema = z.object({
  tipoGrao: z.string().min(1, 'Tipo de grão é obrigatório'),
  cultivar: z.string().min(1, 'Cultivar/Variedade é obrigatório'),
  safra: z.string().min(1, 'Safra é obrigatória'),
  pesoPorSaca: z.coerce.number().min(1, 'Peso por saca é obrigatório'),
  umidade: z.coerce.number().optional(),
  impurezas: z.coerce.number().optional(),
  avariados: z.coerce.number().optional(),
  preco: z.coerce.number().min(0.01, 'Preço é obrigatório'),
  quantidade: z.coerce.number().min(1, 'Quantidade é obrigatória'),
});

type GrainFormValues = z.infer<typeof grainSchema>;

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

export function RegisterGrainForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [laudoFile, setLaudoFile] = useState<File | null>(null);

  const form = useForm<GrainFormValues>({
    resolver: zodResolver(grainSchema),
    defaultValues: {
        pesoPorSaca: 60,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "Arquivo muito grande", description: "O laudo não pode exceder 5MB.", variant: "destructive" });
        return;
      }
      setLaudoFile(file);
    }
  };

  const onSubmit = (data: GrainFormValues) => {
    startTransition(async () => {
        const auth = getAuth(app);
        const user = auth.currentUser;
        if (!user) {
            toast({ title: "Erro de Autenticação", description: "Você precisa estar logado.", variant: "destructive" });
            return;
        }

        try {
            let laudoUrl = '';
            if (laudoFile) {
                // In a real app, upload to a storage service. Here we convert to base64.
                laudoUrl = await toBase64(laudoFile);
            }
            
            const payload = {
              uidFirebase: user.uid,
              titulo: `Grãos de ${data.tipoGrao} - Safra ${data.safra}`,
              descricao: `Lote de ${data.quantidade} sacas de ${data.cultivar}.`,
              tipo: 'grain', // Generic grain type for now
              price: data.preco,
              metadados: {
                ...data,
                laudoUrl: laudoUrl, // Add laudo URL to metadados
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
            setLaudoFile(null);
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <section>
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Detalhes do Lote de Grãos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="tipoGrao" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Tipo de Grão</FormLabel><FormControl><Input {...field} placeholder="Soja, Milho, Trigo..." /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="cultivar" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Cultivar/Variedade</FormLabel><FormControl><Input {...field} placeholder="Ex: TMG 7062 IPRO" /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField name="safra" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Safra</FormLabel><FormControl><Input {...field} placeholder="Ex: 23/24" /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField name="pesoPorSaca" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Peso por Saca (kg)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
                <FormField name="quantidade" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Quantidade de Sacas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="preco" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Preço por Saca (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Qualidade do Grão</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField name="umidade" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Umidade (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="impurezas" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Impurezas (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="avariados" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Avariados (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
          </div>
        </section>

        <section>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Laudo de Classificação (Opcional)</h3>
            {!laudoFile ? (
                <div onClick={() => document.getElementById('laudo-input')?.click()} className="border-2 border-dashed p-6 text-center cursor-pointer hover:bg-secondary">
                    <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="text-sm">Clique ou arraste para adicionar o laudo</p>
                    <Input id="laudo-input" type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.png" onChange={handleFileChange} />
                </div>
            ) : (
                <div className="flex justify-between items-center text-sm p-3 bg-muted rounded-md border">
                    <div className='flex items-center gap-2'>
                        <FileText className="h-5 w-5"/>
                        <span>{laudoFile.name}</span>
                    </div>
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => setLaudoFile(null)}><Trash2 className="h-4 w-4"/></Button>
                </div>
            )}
        </section>

        <Button type="submit" className="w-full text-lg" size="lg" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          Cadastrar Anúncio de Grãos
        </Button>
      </form>
    </Form>
  );
}

