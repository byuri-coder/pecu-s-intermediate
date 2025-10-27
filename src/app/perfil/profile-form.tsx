
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTransition, useState, useRef, useEffect } from 'react';
import { getAuth, onAuthStateChanged, updateProfile, type User, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
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
import { Loader2, UserCircle, Pencil, Landmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { states } from '@/lib/states';
import { app } from '@/lib/firebase';
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
  const [user, setUser] = useState<User | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      stateRegistration: '',
      registrationState: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      specialRegistration: '',
      bankName: '',
      agency: '',
      account: '',
      pixKey: ''
    },
  });

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
            // Use a timestamp to prevent browser caching of the avatar
            setPhotoPreview(currentUser.photoURL || `/api/avatar/${currentUser.uid}?t=${new Date().getTime()}`);
            try {
                const res = await fetch(`/api/usuarios/get/${currentUser.uid}`);
                const data = await res.json();

                if (data.ok) {
                    const fetchedUser = data.usuario;
                    form.reset({
                        fullName: currentUser.displayName || fetchedUser.nome || '',
                        email: currentUser.email || fetchedUser.email || '',
                        stateRegistration: fetchedUser.inscricaoEstadual || '',
                        registrationState: fetchedUser.estadoFiscal || '',
                        address: fetchedUser.endereco || '',
                        city: fetchedUser.cidade || '',
                        state: fetchedUser.estado || '',
                        zipCode: fetchedUser.cep || '',
                        specialRegistration: fetchedUser.autorizacoesEspeciais?.join(', ') || '',
                        bankName: fetchedUser.banco || '',
                        agency: fetchedUser.agencia,
                        account: fetchedUser.conta,
                        pixKey: fetchedUser.chavePix || '',
                    });
                } else {
                     form.reset({
                        fullName: currentUser.displayName || '',
                        email: currentUser.email || '',
                    });
                }
            } catch (e) {
                console.error("Failed to fetch user data from DB", e);
                 form.reset({
                    fullName: currentUser.displayName || '',
                    email: currentUser.email || '',
                });
            }
        }
    });
    return () => unsubscribe();
  }, [form]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    startTransition(async () => {
        if (!user) {
            toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
            return;
        }

        try {
            let newPhotoURL = user.photoURL;
            if (photoFile) {
                const formData = new FormData();
                formData.append('file', photoFile);

                const uploadResponse = await fetch(`/api/upload/avatar/${user.uid}`, {
                    method: 'POST',
                    body: formData,
                });
                const uploadData = await uploadResponse.json();
                if (!uploadData.success) throw new Error(uploadData.error || 'Falha no upload da foto.');
                newPhotoURL = uploadData.photoURL; // Get the permanent URL from backend
            }

            // Update Firebase Auth profile
            await updateProfile(user, { 
                displayName: data.fullName,
                photoURL: newPhotoURL 
            });
            
            // Update MongoDB
            const payload = {
                uidFirebase: user.uid,
                nome: data.fullName,
                email: data.email,
                fotoPerfilUrl: newPhotoURL, // Save the permanent URL
                banco: data.bankName,
                agencia: data.agency,
                conta: data.account,
                chavePix: data.pixKey,
                inscricaoEstadual: data.stateRegistration,
                estadoFiscal: data.registrationState,
                endereco: data.address,
                cidade: data.city,
                estado: data.state,
                cep: data.zipCode,
                autorizacoesEspeciais: data.specialRegistration?.split(',').map(s => s.trim()).filter(Boolean) || [],
            };

            const response = await fetch('/api/usuarios/salvar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Falha ao atualizar perfil no banco de dados.');
            }

            // Handle password change
            if (data.newPassword && data.currentPassword) {
                 const auth = getAuth(app);
                 if (user.email) {
                    const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
                    await reauthenticateWithCredential(user, credential);
                    await updatePassword(user, data.newPassword);
                 }
            }

            toast({
                title: "Perfil Atualizado!",
                description: "Suas informações foram salvas com sucesso.",
            });
            
             // Force a reload to ensure all components get the new user data
             window.location.reload();

        } catch (error: any) {
            console.error("Failed to update profile:", error);
            let description = error.message;
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                description = "A sua senha atual está incorreta. Não foi possível alterar a senha.";
            }

            toast({
                title: "Erro ao Atualizar",
                description: description,
                variant: "destructive",
            });
        }
    });
  };

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                        <AvatarImage src={photoPreview || ''} alt="Foto de perfil" />
                        <AvatarFallback>
                            <UserCircle className="h-full w-full text-muted-foreground"/>
                        </AvatarFallback>
                    </Avatar>
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="absolute bottom-1 right-1 h-8 w-8 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Pencil className="h-4 w-4"/>
                        <span className="sr-only">Alterar foto</span>
                    </Button>
                    <Input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/png, image/jpeg" 
                        onChange={handlePhotoChange}
                    />
                </div>
            </div>

          <section className="space-y-4 p-6 border rounded-lg">
            <h3 className="text-xl font-semibold border-b pb-2">Informações Pessoais e Acesso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 flex-1">
                <FormField name="fullName" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="email" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} readOnly disabled /></FormControl><FormMessage /></FormItem>
                )} />
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
                    <FormItem><FormLabel>Chave PIX</FormLabel><FormControl><Input {...field} placeholder="Email, CPF/CNPJ, Telefone ou Chave Aleatória" /></FormControl></FormItem>
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
                <Select onValueChange={field.onChange} value={field.value}>
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
                 <Select onValueChange={field.onChange} value={field.value}>
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

    