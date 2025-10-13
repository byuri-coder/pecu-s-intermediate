'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTransition, useState, useRef } from 'react';

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
import { CalendarIcon, UploadCloud, Wand2, Loader2, Info } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { getPriceSuggestion } from './actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { CarbonCredit } from '@/lib/types';


const registerCreditSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf_cnpj: z.string().min(1, 'CPF/CNPJ é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  credit_id: z.string().min(1, 'ID do crédito é obrigatório'),
  credit_type: z.string({ required_error: 'Tipo de crédito é obrigatório' }),
  quantity: z.coerce.number().min(1, 'Quantidade deve ser maior que 0'),
  location: z.string().min(1, 'Localização é obrigatória'),
  price: z.coerce.number().min(0.01, 'Preço é obrigatório'),
  issue_date: z.date({ required_error: 'Data de emissão é obrigatória' }),
  expiry_date: z.date({ required_error: 'Data de validade é obrigatória' }),
  vintage: z.string().min(4, "Vintage/Ano é obrigatório"),
});

type RegisterCreditFormValues = z.infer<typeof registerCreditSchema>;

export function RegisterCreditForm() {
  const [isPending, startTransition] = useTransition();
  const [isAiPending, startAiTransition] = useTransition();
  const [suggestion, setSuggestion] = useState<{ suggestedPrice: string; reasoning: string } | null>(null);
  const [isSuggestionOpen, setSuggestionOpen] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<RegisterCreditFormValues>({
    resolver: zodResolver(registerCreditSchema),
  });

  const onSubmit = (data: RegisterCreditFormValues) => {
    startTransition(() => {
      try {
        const newCredit: CarbonCredit = {
            id: data.credit_id,
            sellerName: data.name,
            creditType: data.credit_type as CarbonCredit['creditType'],
            quantity: data.quantity,
            location: data.location,
            pricePerCredit: data.price,
            vintage: data.vintage,
            standard: 'Padrão a ser definido',
            projectOverview: 'Visão geral do projeto a ser preenchida.',
            status: 'Ativo',
        };

        const existingCredits: CarbonCredit[] = JSON.parse(localStorage.getItem('carbon_credits') || '[]');
        localStorage.setItem('carbon_credits', JSON.stringify([newCredit, ...existingCredits]));

        toast({
          title: "Sucesso!",
          description: "Crédito de Carbono cadastrado e já disponível no marketplace!",
        });
        form.reset();
      } catch (error) {
        console.error("Failed to save credit:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao salvar o crédito no seu navegador.",
          variant: "destructive",
        });
      }
    });
  };

  const handleSuggestPrice = () => {
    const { credit_type, location, quantity, vintage } = form.getValues();
    if (!credit_type || !location || !quantity || !vintage) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, preencha 'Tipo de Crédito', 'Localização', 'Vintage' e 'Quantidade' para obter uma sugestão.",
        variant: "destructive",
      });
      return;
    }
    startAiTransition(async () => {
      const result = await getPriceSuggestion({ creditType: credit_type, location, quantity, vintage });
      if (result.suggestion) {
        setSuggestion(result.suggestion);
        setSuggestionOpen(true);
      } else {
        toast({
          title: "Erro na Sugestão",
          description: result.error || "Não foi possível obter uma sugestão de preço.",
          variant: "destructive",
        });
      }
    });
  };

  const useSuggestedPrice = () => {
    if (suggestion) {
        // Extracts the number from a string like "R$ 15,50" or "$15.50"
        const priceNumber = parseFloat(suggestion.suggestedPrice.replace(/[^0-9,.]/g, '').replace(',', '.'));
        if (!isNaN(priceNumber)) {
            form.setValue('price', priceNumber, { shouldValidate: true });
        }
    }
    setSuggestionOpen(false);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <section>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="cpf_cnpj" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>CPF ou CNPJ</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="phone" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Detalhes do Crédito</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField name="credit_id" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>ID do Crédito</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="credit_type" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Crédito</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Forestry">Forestry</SelectItem>
                      <SelectItem value="Renewable Energy">Renewable Energy</SelectItem>
                      <SelectItem value="Waste Management">Waste Management</SelectItem>
                      <SelectItem value="Agriculture">Agriculture</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="quantity" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="location" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Localização</FormLabel><FormControl><Input {...field} placeholder="Ex: Amazonas, Brasil" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="vintage" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Vintage / Ano de Emissão</FormLabel><FormControl><Input {...field} placeholder="Ex: 2023" /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField name="price" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço por Crédito (BRL)</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <Button type="button" variant="outline" size="icon" onClick={handleSuggestPrice} disabled={isAiPending}>
                      {isAiPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                      <span className="sr-only">Sugerir Preço</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="issue_date" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Data de Emissão</FormLabel>
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
              <FormField name="expiry_date" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Data de Validade</FormLabel>
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
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Documentação</h3>
            <div 
              className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 text-center cursor-pointer hover:bg-secondary transition-colors"
              onClick={() => fileInputRef.current?.click()}>
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">Clique para fazer o upload ou arraste e solte os arquivos</p>
              <p className="text-xs text-muted-foreground/70">PDF, DOCX, JPG (max. 10MB)</p>
              <Input ref={fileInputRef} type="file" className="hidden" multiple />
            </div>
          </section>

          <Button type="submit" className="w-full text-lg" size="lg" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Cadastrar Crédito de Carbono
          </Button>
        </form>
      </Form>

      {suggestion && (
        <AlertDialog open={isSuggestionOpen} onOpenChange={setSuggestionOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Wand2 className="text-primary"/>
                        Sugestão de Preço com IA
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Analisamos os atributos do seu crédito e as tendências de mercado para sugerir um preço justo.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-4 space-y-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Preço Sugerido</p>
                        <p className="text-4xl font-bold text-primary">{suggestion.suggestedPrice}</p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg border">
                        <p className="font-semibold text-sm flex items-center gap-1"><Info className="h-4 w-4"/> Racional</p>
                        <p className="text-sm text-muted-foreground mt-1">{suggestion.reasoning}</p>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Fechar</AlertDialogCancel>
                    <AlertDialogAction onClick={useSuggestedPrice}>Usar este preço</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
