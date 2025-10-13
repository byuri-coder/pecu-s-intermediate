'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTransition, useRef, useState } from 'react';
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
import { UploadCloud, Loader2, Trash2 } from 'lucide-react';
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

export function RegisterRuralLandForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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
      const newImagePreviews = newFiles.map(file => URL.createObjectURL(file));
      setImageFiles(prev => [...prev, ...newFiles]);
      setImagePreviews(prev => [...prev, ...newImagePreviews]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };


  const onSubmit = (data: RegisterRuralLandFormValues) => {
    startTransition(() => {
        try {
            const newLand: RuralLand = {
                id: `land-${Date.now()}`,
                title: data.title,
                description: data.description,
                owner: data.owner,
                sizeHa: data.sizeHa,
                businessType: data.businessType as RuralLand['businessType'],
                location: data.location,
                images: imagePreviews, // Use local blob URLs for now
                documentation: 'Em análise',
                registration: data.registration,
                price: data.price,
                status: 'Disponível',
            };

            const existingLands: RuralLand[] = JSON.parse(localStorage.getItem('rural_lands') || '[]');
            localStorage.setItem('rural_lands', JSON.stringify([newLand, ...existingLands]));

            toast({
                title: "Sucesso!",
                description: "Terra Rural cadastrada com sucesso e disponível no marketplace!",
            });
            form.reset();
            setImageFiles([]);
            setImagePreviews([]);
        } catch (error) {
            console.error("Failed to save rural land:", error);
            toast({
                title: "Erro",
                description: "Ocorreu um erro ao salvar a terra rural no seu navegador.",
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
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Fotos e Documentos</h3>
           <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 text-center cursor-pointer hover:bg-secondary transition-colors"
                onClick={() => fileInputRef.current?.click()}>
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">Clique para fazer o upload ou arraste e solte os arquivos</p>
                <p className="text-xs text-muted-foreground/70">Imagens (JPG, PNG), Documentos (PDF)</p>
                <Input 
                    ref={fileInputRef} 
                    type="file" 
                    className="hidden" 
                    multiple 
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,application/pdf"
                />
              </div>
              {imagePreviews.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Imagens Selecionadas:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((src, index) => (
                      <div key={index} className="relative aspect-video rounded-md overflow-hidden group">
                        <Image src={src} alt={`Preview ${index}`} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button 
                            variant="destructive" 
                            size="icon"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-sm text-muted-foreground">Envie fotos da propriedade, mapa georreferenciado, CAR, e outros documentos relevantes para agilizar a análise.</p>
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
