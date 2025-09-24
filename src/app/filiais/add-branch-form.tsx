'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTransition } from 'react';

import { Button } from '../../components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { states } from '@/lib/states';
import { addBranchAction } from './actions';

const addBranchSchema = z.object({
  branchName: z.string().min(3, 'Nome da filial é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  stateRegistration: z.string().optional(),
  registrationState: z.string().optional(),
  address: z.string().min(5, 'Endereço é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  zipCode: z.string().min(8, 'CEP inválido'),
  specialRegistration: z.string().optional(),
});

type AddBranchFormValues = z.infer<typeof addBranchSchema>;

export function AddBranchForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<AddBranchFormValues>({
    resolver: zodResolver(addBranchSchema),
    defaultValues: {
        branchName: '',
        cnpj: '',
        stateRegistration: '',
        registrationState: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        specialRegistration: '',
    }
  });

  const onSubmit = (data: AddBranchFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
          if (value) formData.append(key, String(value));
      });
      
      const result = await addBranchAction(formData);
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        });
        form.reset();
        onSuccess?.();
      } else {
        toast({
          title: "Erro",
          description: result.message || "Ocorreu um erro ao cadastrar a filial.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 py-4">
        
        <FormField name="branchName" control={form.control} render={({ field }) => (
            <FormItem className="md:col-span-2">
                <FormLabel>Nome da Filial</FormLabel>
                <FormControl><Input {...field} placeholder="Ex: Filial Minas Gerais" /></FormControl>
                <FormMessage />
            </FormItem>
        )} />

        <FormField name="cnpj" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>CNPJ</FormLabel>
                <FormControl><Input {...field} placeholder="00.000.000/0000-00" /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        
        <FormField name="stateRegistration" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Inscrição Estadual</FormLabel>
                <FormControl><Input {...field} placeholder="Número da Inscrição (se aplicável)" /></FormControl>
                <FormMessage />
            </FormItem>
        )} />

        <FormField name="address" control={form.control} render={({ field }) => (
            <FormItem className="md:col-span-2">
                <FormLabel>Endereço Completo</FormLabel>
                <FormControl><Input {...field} placeholder="Rua, Número, Bairro" /></FormControl>
                <FormMessage />
            </FormItem>
        )} />

        <FormField name="city" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />

        <FormField name="state" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                <SelectContent>
                    {states.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
        )} />

        <FormField name="zipCode" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>CEP</FormLabel>
                <FormControl><Input {...field} placeholder="00000-000" /></FormControl>
                <FormMessage />
            </FormItem>
        )} />

        <FormField name="specialRegistration" control={form.control} render={({ field }) => (
            <FormItem className="md:col-span-2">
                <FormLabel>Matrículas ou Autorizações Especiais</FormLabel>
                <FormControl><Textarea {...field} rows={3} placeholder="Se necessário, informe aqui autorizações específicas para esta filial." /></FormControl>
                <FormDescription>Campo opcional. Preencha caso a filial exija alguma autorização específica.</FormDescription>
                <FormMessage />
            </FormItem>
        )} />

        <div className="md:col-span-2 flex justify-end">
            <Button type="submit" className="w-full md:w-auto" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Salvar Filial
            </Button>
        </div>
      </form>
    </Form>
  );
}
