
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTransition } from 'react';

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
import { Loader2, Upload, FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Petition } from '@/lib/types';

const petitionSchema = z.object({
  title: z.string().min(5, 'O título é muito curto.'),
  customHeader: z.string().optional(),
  partyCnpj: z.string().min(14, 'O CNPJ da parte é obrigatório.'),
  creditBalance: z.coerce.number().min(0, 'O saldo credor não pode ser negativo.'),
  petitionBody: z.string().min(50, 'O corpo da petição precisa ser mais detalhado.'),
  status: z.enum(['rascunho', 'finalizado']),
});

type PetitionFormValues = z.infer<typeof petitionSchema>;

interface PetitionFormProps {
  petition: Petition | null;
  onSuccess: () => void;
}

export function PetitionForm({ petition, onSuccess }: PetitionFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<PetitionFormValues>({
    resolver: zodResolver(petitionSchema),
    defaultValues: {
      title: petition?.title || '',
      customHeader: '', // Placeholder
      partyCnpj: '', // Placeholder
      creditBalance: 0, // Placeholder
      petitionBody: '', // Placeholder
      status: petition?.status || 'rascunho',
    },
  });

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="title" control={form.control} render={({ field }) => (
                <FormItem className="md:col-span-2">
                    <FormLabel>Título da Petição</FormLabel>
                    <FormControl><Input {...field} placeholder="Ex: Petição de Transferência ICMS" /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField name="partyCnpj" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>CNPJ da Parte</FormLabel>
                    <FormControl><Input {...field} placeholder="00.000.000/0001-00" /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
             <FormField name="creditBalance" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>Saldo Credor (R$)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
        </div>

        <FormField name="customHeader" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Cabeçalho Personalizado</FormLabel>
                <FormControl><Textarea {...field} rows={2} placeholder="Insira o texto que aparecerá no cabeçalho do documento." /></FormControl>
                <FormMessage />
            </FormItem>
        )} />

        <FormField name="petitionBody" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Corpo da Petição</FormLabel>
                <FormControl><Textarea {...field} rows={10} placeholder="Digite ou cole aqui o texto principal da sua petição. Você pode usar placeholders como {{CNPJ_PARTE}} ou {{SALDO_CREDOR}} que serão substituídos dinamicamente." /></FormControl>
                <FormMessage />
            </FormItem>
        )} />

        <div>
            <FormLabel>Anexos</FormLabel>
             <div className="space-y-2 mt-2">
                <div className="border rounded-md p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">certidao_negativa_debitos.pdf</span>
                    </div>
                    <Button type="button" variant="outline" size="sm">Remover</Button>
                </div>
                 <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-secondary">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground"/>
                    <p className="text-sm mt-2">Adicionar novo anexo</p>
                    <Input type="file" className="hidden" />
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
