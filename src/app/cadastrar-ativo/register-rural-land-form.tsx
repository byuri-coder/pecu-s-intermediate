'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTransition, useRef, useState } from 'react';
import Image from 'next/image';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';


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
import { UploadCloud, Loader2, Trash2, Film } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { RuralLand } from '@/lib/types';


const registerRuralLandSchema = z.object({
  title: z.string().min(5, 'O título é muito curto'),
  owner: z.string().min(3, 'Nome do proprietário é obrigatório'),
  registration: z.string().min(1, 'A matrícula/inscrição é obrigatória'),
  location: z.string().min(3, 'A localização é obrigatória'),
  sizeHa: z.coerce.number().min(1, 'A área deve ser maior que 0'),
  businessType: z.string({ required_error: 'O tipo de negócio é obrigatório' }),
  price: z.coerce.number().optional(),
  description: z.string().min(20, 'Forneça uma descrição mais detalhada'),
});

type RegisterRuralLandFormValues = z.infer<typeof registerRuralLandSchema>;

type MediaFile = {
    file: File;
    preview: string;
    type: 'image' | 'video';
}

export function RegisterRuralLandForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  const form = useForm<RegisterRuralLandFormValues>({
    resolver: zodResolver(registerRuralLandSchema),
    defaultValues: {
      businessType: 'Venda',
    },
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
        const newFiles = Array.from(files);
        if (mediaFiles.length + newFiles.length > 10) {
            toast({
                title: "Limite de arquivos excedido",
                description: "Você pode adicionar no máximo 10 fotos e vídeos.",
                variant: "destructive",
            });
            return;
        }

        const newMediaFiles: MediaFile[] = newFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith('video') ? 'video' : 'image',
        }));
        
        setMediaFiles(prev => [...prev, ...newMediaFiles]);
    }
  };

  const removeMedia = (index: number) => {
    const fileToRemove = mediaFiles[index];
    URL.revokeObjectURL(fileToRemove.preview);
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };


  const onSubmit = (data: RegisterRuralLandFormValues) => {
    startTransition(async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            toast({ title: "Erro de Autenticação", description: "Você precisa estar logado para cadastrar um ativo.", variant: "destructive" });
            return;
        }

        try {
            // SIMULATE UPLOAD: Replace local blob URLs with public placeholder URLs
            const uploadedMedia = mediaFiles.map((mf, index) => {
                // In a real app, this is where you'd upload mf.file to cloud storage
                // and get a permanent URL. For this demo, we'll use a public placeholder.
                const publicUrl = `https://picsum.photos/seed/${user.uid.substring(0, 8)}${index}/800/600`;
                return {
                    url: publicUrl, // Use the public URL
                    type: mf.type,
                    alt: data.title
                };
            });

            const payload = {
              uidFirebase: user.uid,
              titulo: data.title,
              descricao: data.description,
              tipo: 'rural-land',
              price: data.price,
              imagens: uploadedMedia,
              metadados: {
                owner: data.owner,
                registration: data.registration,
                location: data.location,
                sizeHa: data.sizeHa,
                businessType: data.businessType,
              },
            };

            const response = await fetch('/api/anuncios/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });

            if (!response.ok) {
              const result = await response.json();
              throw new Error(result.error || "Falha ao criar anúncio de terra rural.");
            }

            toast({
                title: "Sucesso!",
                description: "Terra Rural cadastrada com sucesso e disponível no marketplace!",
            });
            form.reset();
            mediaFiles.forEach(mf => URL.revokeObjectURL(mf.preview));
            setMediaFiles([]);
        } catch (error: any) {
            console.error("Failed to save rural land:", error);
            toast({
                title: "Erro",
                description: error.message || "Ocorreu um erro ao salvar a terra rural no banco de dados.",
                variant: "destructive",
            });
        }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <section>
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Informações da Propriedade</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="title" control={form.control} render={({ field }) => (
              <FormItem className="md:col-span-2"><FormLabel>Título do Anúncio</FormLabel><FormControl><Input {...field} placeholder="Ex: Fazenda Vale Verde" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="owner" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Nome do Proprietário</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="registration" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Matrícula ou Inscrição</FormLabel><FormControl><Input {...field} placeholder="Ex: CRI 12.345-6" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="location" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Localização</FormLabel><FormControl><Input {...field} placeholder="Município, Estado" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="sizeHa" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Área (Hectares)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="businessType" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Tipo de Negócio</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Venda">Venda</SelectItem>
                    <SelectItem value="Arrendamento">Arrendamento</SelectItem>
                    <SelectItem value="Permuta">Permuta</SelectItem>
                    <SelectItem value="Mineração">Mineração</SelectItem>
                  </SelectContent>
                </Select>
              <FormMessage /></FormItem>
            )} />
             <FormField name="price" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>Preço (BRL)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormDescription>Deixe em branco se for aberto a propostas. Para arrendamento, use o valor/ha/ano.</FormDescription>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField name="description" control={form.control} render={({ field }) => (
              <FormItem className="md:col-span-2"><FormLabel>Descrição Detalhada</FormLabel><FormControl><Textarea {...field} rows={5} placeholder="Descreva a propriedade, sua infraestrutura, aptidão (gado, soja, etc.), recursos hídricos e outros detalhes relevantes." /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Fotos e Vídeos ({mediaFiles.length}/10)</h3>
           <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 text-center cursor-pointer hover:bg-secondary transition-colors"
                onClick={() => fileInputRef.current?.click()}>
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">Clique para fazer o upload ou arraste e solte os arquivos</p>
                <p className="text-xs text-muted-foreground/70">Imagens (JPG, PNG) e Vídeos (MP4, MOV). Máx 10 arquivos.</p>
                <Input 
                    ref={fileInputRef} 
                    type="file" 
                    className="hidden" 
                    multiple 
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,video/mp4,video/quicktime"
                />
              </div>
              {mediaFiles.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Mídias Selecionadas:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mediaFiles.map((mf, index) => (
                      <div key={index} className="relative aspect-video rounded-md overflow-hidden group bg-secondary">
                        {mf.type === 'image' ? (
                            <Image src={mf.preview} alt={`Preview ${index}`} fill className="object-cover" />
                        ) : (
                            <video src={mf.preview} className="w-full h-full object-cover" muted loop playsInline />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {mf.type === 'video' && <Film className="h-6 w-6 text-white absolute top-2 left-2" />}
                            <Button 
                                variant="destructive" 
                                size="icon"
                                onClick={() => removeMedia(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-sm text-muted-foreground">Envie fotos da propriedade, mapa georreferenciado, CAR, vídeos aéreos e outros documentos relevantes para agilizar a análise.</p>
           </div>
        </section>

        <Button type="submit" className="w-full text-lg" size="lg" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          Cadastrar Terra Rural
        </Button>
      </form>
    </Form>
  );
}
