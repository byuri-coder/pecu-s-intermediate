'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import React, { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAuth, signInWithEmailAndPassword, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { app } from '@/lib/firebase';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = React.useState('');
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setError('');
    startTransition(async () => {
      const auth = getAuth(app);
      try {
        await setPersistence(auth, browserSessionPersistence);
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        
        // Sync with MongoDB
        const { user } = userCredential;
        await fetch("/api/usuarios/salvar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uidFirebase: user.uid,
            nome: user.displayName || "Usuário",
            email: user.email,
            tipo: "comprador", // Default type on login
          }),
        });

        toast({
          title: "Login bem-sucedido!",
          description: "Você será redirecionado para o painel.",
        });
        
        router.push('/dashboard');

      } catch (error: any) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
             setError("Email ou senha incorretos. Tente novamente.")
             break;
          default:
            setError("Ocorreu um erro inesperado. Tente novamente mais tarde.")
            console.error(error);
        }
      }
    });
  };

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
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
