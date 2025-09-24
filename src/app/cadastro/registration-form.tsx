'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

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
import { Loader2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { states } from '@/lib/states';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { app } from '@/lib/firebase';

const registrationSchema = z.object({
  fullName: z.string().min(3, 'Nome completo é obrigatório'),
  cpfCnpj: z.string().min(11, 'CPF ou CNPJ inválido'),
  email: z.string().email('Email inválido'),
  contactPhone: z.string().min(10, 'Telefone de contato inválido'),
  
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'A confirmação de senha é obrigatória'),

  stateRegistration: z.string().optional(),
  registrationState: z.string().optional(),

  address: z.string().min(5, 'Endereço é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  zipCode: z.string().min(8, 'CEP inválido'),
  
  specialRegistration: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export function RegistrationForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = React.useState('');
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      cpfCnpj: '',
      email: '',
      contactPhone: '',
      password: '',
      confirmPassword: '',
      stateRegistration: '',
      registrationState: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      specialRegistration: '',
    },
  });
  
  const address = form.watch('address');
  const city = form.watch('city');
  const state = form.watch('state');
  const fullAddress = [address, city, state].filter(Boolean).join(', ');


  const onSubmit = (data: RegistrationFormValues) => {
    setError('');
    startTransition(async () => {
      const auth = getAuth(app);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        
        await updateProfile(userCredential.user, {
            displayName: data.fullName
        });

        toast({
            title: "Cadastro realizado com sucesso!",
            description: "Sua conta foi criada. Você será redirecionado.",
        });
        
        router.push('/dashboard');

      } catch (error: any) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            setError("Este email já está em uso por outra conta.");
            break;
          case 'auth/weak-password':
            setError("A senha é muito fraca. Tente uma mais forte.");
            break;
          default:
            setError("Ocorreu um erro inesperado durante o cadastro.");
            console.error(error);
        }
      }
    });
  };

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Personal Information */}
          <section className="space-y-4 p-6 border rounded-lg">
            <h3 className="text-xl font-semibold border-b pb-2">Informações Pessoais e Acesso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField name="fullName" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} placeholder="Seu nome completo" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="cpfCnpj" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>CPF ou CNPJ</FormLabel><FormControl><Input {...field} placeholder="00.000.000/0000-00" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} placeholder="seu.email@exemplo.com" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="contactPhone" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Telefone para Contato</FormLabel><FormControl><Input type="tel" {...field} placeholder="(00) 90000-0000" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="password" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Senha</FormLabel><FormControl><Input type="password" {...field} placeholder="Crie uma senha forte" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="confirmPassword" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Confirme sua Senha</FormLabel><FormControl><Input type="password" {...field} placeholder="Repita a senha" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </section>

          {/* Registration Information */}
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

          {/* Address Information */}
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

          {/* Special Authorizations */}
          <section className="space-y-4 p-6 border rounded-lg">
            <h3 className="text-xl font-semibold border-b pb-2">Autorizações Especiais</h3>
             <FormField name="specialRegistration" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Matrículas ou Autorizações Especiais</FormLabel>
                  <FormControl><Textarea {...field} placeholder="Se necessário, informe aqui matrículas em órgãos, programas ou autorizações (ex: para mineração, venda de certos créditos, etc.)" /></FormControl>
                  <FormDescription>Campo opcional. Preencha caso sua atividade exija alguma autorização específica.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
          </section>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <Button type="submit" className="w-full text-lg" size="lg" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Criar Minha Conta
          </Button>
        </form>
      </Form>
  );
}
