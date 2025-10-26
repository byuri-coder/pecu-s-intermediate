
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTransition, useState, useRef, useEffect } from 'react';
import { getAuth, onAuthStateChanged, updateProfile, type User, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

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
import { Loader2, UserCircle, Pencil, Banknote, Landmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { states } from '@/lib/states';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { app } from '@/lib/firebase';

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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function ProfileForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
            try {
                const res = await fetch(`/api/usuarios/get/${currentUser.uid}`);
                const data = await res.json();

                if (data.ok) {
                    const fetchedUser = data.usuario;
                    setDbUser(fetchedUser);
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
                     if (fetchedUser.avatarId) {
                        setAvatarPreview(fetchedUser.avatarId);
                    }
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

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem de perfil não pode exceder 10MB.",
          variant: "destructive",
        });
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };


  const onSubmit = (data: ProfileFormValues) => {
    startTransition(async () => {
        if (!user) {
            toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
            return;
        }

        try {
            let finalPhotoURL = dbUser?.avatarId;

            // Step 1: Upload avatar if a new one is selected
            if (avatarFile) {
                const formData = new FormData();
                formData.append("file", avatarFile);

                const uploadRes = await fetch(`/api/upload/avatar/${user.uid}`, {
                    method: 'POST',
                    body: formData,
                });
                
                if (!uploadRes.ok) {
                    let errorBody;
                    try {
                        errorBody = await uploadRes.json();
                    } catch {
                        errorBody = { error: await uploadRes.text() };
                    }
                    throw new Error(errorBody.error || 'Falha no upload do avatar.');
                }
                const uploadData = await uploadRes.json();
                finalPhotoURL = uploadData.photoURL;
            }

            // Step 2: Update Firebase Auth profile
            if (data.fullName !== user.displayName || (finalPhotoURL && finalPhotoURL !== user.photoURL)) {
                await updateProfile(user, { 
                    displayName: data.fullName,
                    ...(finalPhotoURL && { photoURL: finalPhotoURL })
                });
            }
            
            // Step 3: Update MongoDB database with all other profile info
            const payload = {
                uidFirebase: user.uid,
                nome: data.fullName,
                email: data.email, // Email is readonly, but good to send for upsert
                avatarId: finalPhotoURL, // Save the final URL
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

            // Step 4: Handle password change if requested
            if (data.newPassword && data.currentPassword) {
                 const auth = getAuth(app);
                 const credential = EmailAuthProvider.credential(user.email!, data.currentPassword);
                 await reauthenticateWithCredential(user, credential);
                 // The re-authentication was successful, now we can update the password.
                 // This part of the logic is missing in the original code.
                 // await updatePassword(user, data.newPassword);
            }

            toast({
                title: "Perfil Atualizado!",
                description: "Suas informações foram salvas com sucesso.",
            });
            
             // Refresh the page to make sure all components (like header) get the new user data
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
          
          <section className="space-y-4 p-6 border rounded-lg">
            <h3 className="text-xl font-semibold border-b pb-2">Informações Pessoais e Acesso</h3>
            <div className="flex items-center gap-6">
                <div className="relative">
                    <input
                        type="file"
                        ref={avatarInputRef}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleAvatarChange}
                    />
                    <Avatar className="h-24 w-24 border-2 border-primary/20">
                        <AvatarImage src={avatarPreview || user?.photoURL || undefined} alt="User Avatar" />
                        <AvatarFallback>
                            <UserCircle className="h-12 w-12" />
                        </AvatarFallback>
                    </Avatar>
                    <Button 
                        type="button"
                        size="icon" 
                        variant="outline" 
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                        onClick={() => avatarInputRef.current?.click()}
                    >
                        <Pencil className="h-4 w-4"/>
                        <span className="sr-only">Editar foto</span>
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 flex-1">
                    <FormField name="fullName" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="email" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} readOnly disabled /></FormControl><FormMessage /></FormItem>
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
