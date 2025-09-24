'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTransition } from 'react';
import Link from 'next/link';

import { Button } from '../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '../../components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  cpfCnpj: z.string().min(1, 'CPF ou CNPJ é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      cpfCnpj: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    startTransition(async () => {
      // Here you would typically authenticate the user
      console.log(data);
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Login bem-sucedido!",
        description: "Você será redirecionado para o painel.",
      });
      
      // router.push('/dashboard');
    });
  };

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField name="cpfCnpj" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>CPF ou CNPJ</FormLabel>
              <FormControl><Input {...field} placeholder="Seu CPF ou CNPJ" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" {...field} placeholder="seu.email@exemplo.com" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="password" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl><Input type="password" {...field} placeholder="Sua senha" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button type="submit" className="w-full text-lg" size="lg" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Entrar
          </Button>

          <div className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{' '}
                <Link href="/cadastro" className="font-semibold text-primary hover:underline">
                    Cadastre-se
                </Link>
            </div>
        </form>
      </Form>
  );
}
