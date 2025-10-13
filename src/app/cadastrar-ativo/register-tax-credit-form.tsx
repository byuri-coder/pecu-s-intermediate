'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTransition, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, app } from '@/lib/firebase';

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
import { UploadCloud, Loader2, FileText, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { TaxCredit } from '@/lib/types';


const registerTaxCreditSchema = z.object({
  sellerName: z.string().min(3, 'O nome do vendedor é obrigatório'),
  taxType: z.string({ required_error: 'O tipo de tributo é obrigatório' }),
  location: z.string().min(2, 'A localização (UF) é obrigatória'),
  amount: z.coerce.number().min(1, 'O valor do crédito deve ser maior que zero'),
  price: z.coerce.number().min(1, 'O preço de venda deve ser maior que zero'),
  details: z.string().min(10, 'Forneça detalhes sobre a origem do crédito'),
  fiscalStatus: z.string({ required_error: 'A situação fiscal é obrigatória' }),
}).refine(data => data.price < data.amount, {
  message: 'O preço de venda deve ser menor que o valor de face do crédito.',
  path: ['price'],
});

type RegisterTaxCreditFormValues = z.infer<typeof registerTaxCreditSchema>;

export function RegisterTaxCreditForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const cndInputRef = useRef<HTMLInputElement>(null);
  const otherDocsInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<RegisterTaxCreditFormValues>({
    resolver: zodResolver(registerTaxCreditSchema),
    defaultValues: {
        taxType: 'ICMS',
        location: 'São Paulo, SP'
    }
  });

  const onSubmit = (data: RegisterTaxCreditFormValues) => {
    startTransition(async () => {
      const auth = getAuth(app);
      const user = auth.currentUser;

      if (!user) {
        toast({
          title: "Erro de Autenticação",
          description: "Você precisa estar logado para cadastrar um ativo.",
          variant: "destructive",
        });
        return;
      }
      try {
        const newCredit: Omit<TaxCredit, 'id'> = {
            sellerName: data.sellerName,
            taxType: data.taxType as TaxCredit['taxType'],
            amount: data.amount,
            price: data.price,
            location: data.location,
            status: 'Disponível',
            ownerId: user.uid,
            createdAt: serverTimestamp(),
        };
        
        await addDoc(collection(db, "tax-credits"), newCredit);

        toast({
          title: "Sucesso!",
          description: "Crédito Tributário cadastrado com sucesso e disponível no marketplace!",
        });
        form.reset();
      } catch (error) {
         console.error("Failed to save tax credit:", error);
         toast({
            title: "Erro",
            description: "Ocorreu um erro ao salvar o crédito tributário no seu navegador.",
            variant: "destructive",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <section>
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Detalhes do Crédito Tributário de ICMS (SP)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="sellerName" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Nome do Vendedor (Cedente)</FormLabel><FormControl><Input {...field} placeholder="Razão Social da empresa" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="taxType" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Tributo</FormLabel>
                 <FormControl>
                    <Input {...field} readOnly disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="amount" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Valor de Face do Crédito (BRL)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="price" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Preço de Venda (BRL)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormDescription>O deságio será calculado automaticamente.</FormDescription><FormMessage /></FormItem>
            )} />
             <FormField name="location" control={form.control} render={({ field }) => (
              <FormItem className="md:col-span-2"><FormLabel>Localização (Estado de Origem do Crédito)</FormLabel>
                <FormControl>
                    <Input {...field} readOnly disabled />
                </FormControl>
              <FormMessage /></FormItem>
            )} />
            <FormField name="details" control={form.control} render={({ field }) => (
              <FormItem className="md:col-span-2"><FormLabel>Origem e Detalhes do Crédito</FormLabel><FormControl><Textarea {...field} rows={4} placeholder="Descreva brevemente a origem do crédito (ex: decisão judicial transitada em julgado, saldo credor acumulado, etc.)." /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </section>

        <section>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Certidão Negativa de Débitos (CND)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField name="fiscalStatus" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Situação da Certidão</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione a situação fiscal" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Negativa">Negativa</SelectItem>
                            <SelectItem value="Positiva com efeitos de Negativa">Positiva com efeitos de Negativa</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                 )} />
                  <FormItem>
                    <FormLabel>Arquivo da Certidão</FormLabel>
                     <div 
                        className="border border-input rounded-md flex items-center pr-3 cursor-pointer hover:bg-secondary transition-colors"
                        onClick={() => cndInputRef.current?.click()}>
                        <div className="flex-1 px-3 py-2 text-sm text-muted-foreground">Anexar arquivo...</div>
                        <Input ref={cndInputRef} type="file" className="hidden" />
                        <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <FormDescription>Anexe o arquivo da CND (conhecido como "Nada Consta").</FormDescription>
                </FormItem>
            </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Outros Documentos Comprobatórios</h3>
           <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 text-center cursor-pointer hover:bg-secondary transition-colors"
                onClick={() => otherDocsInputRef.current?.click()}>
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">Clique para fazer o upload ou arraste e solte os arquivos</p>
                <p className="text-xs text-muted-foreground/70">Documentos (PDF, XML, DOCX)</p>
                <Input ref={otherDocsInputRef} type="file" className="hidden" multiple />
              </div>
              <p className="text-sm text-muted-foreground">Anexe documentos adicionais que comprovem a liquidez e certeza do crédito, como certidões, decisões judiciais, notas fiscais, etc. As informações sensíveis podem ser omitidas.</p>
           </div>
        </section>

        <Button type="submit" className="w-full text-lg" size="lg" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          Cadastrar Crédito Tributário
        </Button>
      </form>
    </Form>
  );
}
