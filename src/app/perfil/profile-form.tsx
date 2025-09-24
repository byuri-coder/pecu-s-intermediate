'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
import { Loader2, MapPin, UserCircle, Pencil, Banknote, Landmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { states } from '@/lib/states';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const profileSchema = z.object({
  fullName: z.string().min(3, 'Nome completo é obrigatório'),
  email: z.string().email('Email inválido'),
  
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmNewPassword: z.string().optional(),

  stateRegistration: z.string().optional(),
  registrationState: z.string().optional(),

  address: z.string().min(5, 'Endereço é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  zipCode: z.string().min(8, 'CEP inválido'),
  
  specialRegistration: z.string().optional(),

  // Payment Info
  bankName: z.string().optional(),
  agency: z.string().optional(),
  account: z.string().optional(),
  pixKey: z.string().optional(),
  
}).refine((data) => {
    if (data.newPassword && !data.currentPassword) {
        return false;
    }
    return true;
}, {
    message: "Por favor, insira sua senha atual para definir uma nova.",
    path: ["currentPassword"],
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "As novas senhas não coincidem.",
    path: ["confirmNewPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    // Placeholder data for an existing user
    defaultValues: {
      fullName: 'Usuário de Exemplo',
      email: 'usuario@email.com',
      stateRegistration: '123.456.789.112',
      registrationState: 'SP',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      specialRegistration: 'Autorização para comercialização de créditos de carbono Verra VCS #1234.',
      // Mocked payment data
      bankName: 'Banco Exemplo S.A.',
      agency: '0001',
      account: '12345-6',
      pixKey: 'documento@email.com'
    },
  });
  
  const address = form.watch('address');
  const city = form.watch('city');
  const state = form.watch('state');
  const fullAddress = [address, city, state].filter(Boolean).join(', ');


  const onSubmit = (data: ProfileFormValues) => {
    startTransition(async () => {
      // Here you would typically send the data to your backend
      console.log(data);
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Perfil Atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
      form.reset(data); // reset with new values
    });
  };

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <section className="space-y-4 p-6 border rounded-lg">
            <h3 className="text-xl font-semibold border-b pb-2">Informações Pessoais e Acesso</h3>
            <div className="flex items-center gap-6">
                <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-primary/20">
                        <AvatarImage src="https://picsum.photos/seed/avatar1/96/96" alt="User Avatar" />
                        <AvatarFallback>
                            <UserCircle className="h-12 w-12" />
                        </AvatarFallback>
                    </Avatar>
                    <Button size="icon" variant="outline" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
                        <Pencil className="h-4 w-4"/>
                        <span className="sr-only">Editar foto</span>
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 flex-1">
                    <FormField name="fullName" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="email" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </div>
            
            <div className="pt-4">
                 <h4 className="text-md font-semibold mb-2">Alterar Senha</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField name="currentPassword" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Senha Atual</FormLabel><FormControl><Input type="password" {...field} placeholder="••••••••" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="newPassword" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Nova Senha</FormLabel><FormControl><Input type="password" {...field} placeholder="Nova senha forte" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="confirmNewPassword" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Confirme a Nova Senha</FormLabel><FormControl><Input type="password" {...field} placeholder="Repita a nova senha" /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </div>
          </section>

          <section className="space-y-4 p-6 border rounded-lg">
            <h3 className="text-xl font-semibold border-b pb-2 flex items-center gap-2"><Landmark className="h-5 w-5"/> Informações de Pagamento</h3>
            <FormDescription>
                Estes dados serão compartilhados com o comprador após a conclusão de uma negociação para que o pagamento seja efetuado.
            </FormDescription>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <FormField name="bankName" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Nome do Banco</FormLabel><FormControl><Input {...field} placeholder="Ex: Banco do Brasil" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="agency" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Agência</FormLabel><FormControl><Input {...field} placeholder="Ex: 0001" /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField name="account" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Conta Corrente com dígito</FormLabel><FormControl><Input {...field} placeholder="Ex: 12345-6" /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField name="pixKey" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Chave PIX</FormLabel><FormControl><Input {...field} placeholder="Email, CPF/CNPJ, Telefone ou Chave Aleatória" /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
          </section>

          <section className="space-y-4 p-6 border rounded-lg">
             <h3 className="text-xl font-semibold border-b pb-2">Informações Fiscais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField name="stateRegistration" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Inscrição Estadual</FormLabel><FormControl><Input {...field} placeholder="Número da Inscrição (se aplicável)" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="registrationState" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Estado de Inscrição</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione o estado" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {states.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage /></FormItem>
              )} />
            </div>
          </section>

          <section className="space-y-4 p-6 border rounded-lg">
             <h3 className="text-xl font-semibold border-b pb-2">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField name="address" control={form.control} render={({ field }) => (
                <FormItem className="lg:col-span-3"><FormLabel>Endereço Completo</FormLabel><FormControl><Input {...field} placeholder="Rua, Número, Bairro" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="city" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="state" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Estado</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {states.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage /></FormItem>
              )} />
              <FormField name="zipCode" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>CEP</FormLabel><FormControl><Input {...field} placeholder="00000-000" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            {fullAddress && (
                 <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                 >
                    <MapPin className="h-4 w-4" />
                    Visualizar no Google Maps
                 </a>
            )}
          </section>

          <section className="space-y-4 p-6 border rounded-lg">
            <h3 className="text-xl font-semibold border-b pb-2">Autorizações Especiais</h3>
             <FormField name="specialRegistration" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Matrículas ou Autorizações Especiais</FormLabel>
                  <FormControl><Textarea {...field} rows={4} placeholder="Se necessário, informe aqui matrículas em órgãos, programas ou autorizações (ex: para mineração, venda de certos créditos, etc.)" /></FormControl>
                  <FormDescription>Campo opcional. Preencha caso sua atividade exija alguma autorização específica.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
          </section>

          <Button type="submit" className="w-full text-lg" size="lg" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Salvar Alterações
          </Button>
        </form>
      </Form>
  );
}
