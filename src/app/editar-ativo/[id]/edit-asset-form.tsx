'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { CarbonCredit, RuralLand, TaxCredit } from '@/lib/types';
import { ArrowLeft, Edit, UploadCloud, Film, Trash2 } from 'lucide-react';


type AssetType = 'carbon-credit' | 'tax-credit' | 'rural-land';
type Asset = CarbonCredit | TaxCredit | RuralLand;

// Mock user, in a real app this would come from an auth context.
const LOGGED_IN_USER_NAME = "Comprador Interessado";

export function EditAssetForm({ asset, assetType }: { asset: Asset, assetType: AssetType }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [editableAsset, setEditableAsset] = React.useState(asset);
  const [mediaFiles, setMediaFiles] = React.useState<(File|string)[]>(('images' in asset && asset.images) ? asset.images : []);

  const handleAssetFieldChange = (field: keyof Asset, value: any) => {
    setEditableAsset(prev => ({...prev, [field]: value }));
  };
  
  const handleMediaFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setMediaFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const removeMedia = (index: number) => {
    const file = mediaFiles[index];
    if (typeof file === 'string' && file.startsWith('blob:')) {
        URL.revokeObjectURL(file);
    }
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSaveAssetChanges = () => {
    try {
        const imageURLs = mediaFiles.map(file => {
            if(typeof file === 'string') return file; // Already a URL
            return URL.createObjectURL(file); // Create blob URL for new files
        });

        const updatedAsset = { ...editableAsset, images: imageURLs };
        
        const storageKey = `${assetType.replace('-', '_')}s`;
        const assetsFromStorage: Asset[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const updatedAssets = assetsFromStorage.map(a => a.id === asset.id ? updatedAsset : a);
        
        // If the asset wasn't in local storage (was a placeholder), add it.
        if (!assetsFromStorage.some(a => a.id === asset.id)) {
            updatedAssets.push(updatedAsset);
        }

        localStorage.setItem(storageKey, JSON.stringify(updatedAssets));
        window.dispatchEvent(new Event('storage'));
        
        toast({
            title: "Sucesso!",
            description: "As alterações no ativo foram salvas.",
        });

        router.push('/dashboard');

    } catch(e) {
        toast({ title: "Erro", description: "Não foi possível salvar as alterações.", variant: 'destructive'});
        console.error(e);
    }
  }

  // A simple check to see if the current user "owns" the asset.
  const isOwner = ('owner' in asset && asset.owner === LOGGED_IN_USER_NAME) || 
                  ('sellerName' in asset && asset.sellerName === LOGGED_IN_USER_NAME) || 
                  // If no owner/seller, assume current user can edit (for new items)
                  !('owner' in asset) && !('sellerName' in asset);


    if (!isOwner) {
        return (
            <div className="container mx-auto py-12">
                <Card>
                    <CardHeader>
                        <CardTitle>Acesso Negado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Você não tem permissão para editar este ativo.</p>
                         <Button asChild className="mt-4">
                            <Link href="/dashboard">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Voltar ao Dashboard
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }


  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Gerenciamento
          </Link>
        </Button>
      </div>
      <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-bold font-headline flex items-center gap-3">
                <Edit className="h-8 w-8" />
                Editar Ativo
                </CardTitle>
                <CardDescription>
                Modifique as informações e mídias do seu ativo. Clique em salvar para atualizar.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 {/* Generic Fields for all asset types */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {('title' in editableAsset) && (
                        <div className="space-y-1 md:col-span-2">
                            <Label>Título do Anúncio</Label>
                            <Input value={editableAsset.title} onChange={(e) => handleAssetFieldChange('title', e.target.value)} />
                        </div>
                    )}
                    {('price' in editableAsset) && (
                        <div className="space-y-1">
                            <Label>Preço (BRL)</Label>
                            <Input type="number" value={editableAsset.price} onChange={(e) => handleAssetFieldChange('price', parseFloat(e.target.value) || 0)} />
                        </div>
                    )}
                     {('pricePerCredit' in editableAsset) && (
                        <div className="space-y-1">
                            <Label>Preço por Crédito (BRL)</Label>
                            <Input type="number" value={editableAsset.pricePerCredit} onChange={(e) => handleAssetFieldChange('pricePerCredit', parseFloat(e.target.value) || 0)} />
                        </div>
                    )}
                     {('description' in editableAsset) && (
                        <div className="md:col-span-2 space-y-1">
                            <Label>Descrição</Label>
                            <Textarea value={editableAsset.description} onChange={(e) => handleAssetFieldChange('description', e.target.value)} rows={4} />
                        </div>
                    )}
                     {('projectOverview' in editableAsset) && (
                        <div className="md:col-span-2 space-y-1">
                            <Label>Visão Geral do Projeto</Label>
                            <Textarea value={editableAsset.projectOverview} onChange={(e) => handleAssetFieldChange('projectOverview', e.target.value)} rows={4} />
                        </div>
                    )}
                </div>

                {/* Media upload section, only for RuralLand */}
                {assetType === 'rural-land' && (
                    <div className="space-y-4 pt-4 border-t">
                        <Label>Mídia da Propriedade (Fotos e Vídeos)</Label>
                        <div 
                            className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 text-center cursor-pointer hover:bg-secondary transition-colors"
                            onClick={() => document.getElementById('media-upload-input')?.click()}>
                            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-sm text-muted-foreground">Clique para adicionar fotos ou vídeos</p>
                            <p className="text-xs text-muted-foreground/70">JPG, PNG, MP4 (máx. 30MB)</p>
                            <Input 
                                id="media-upload-input"
                                type="file" 
                                className="hidden" 
                                multiple 
                                onChange={handleMediaFileChange}
                                accept="image/jpeg,image/png,video/mp4"
                            />
                        </div>
                        {mediaFiles.length > 0 && (
                            <div>
                            <h4 className="font-medium mb-2">Mídias Atuais:</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {mediaFiles.map((file, index) => {
                                    const isVideo = (typeof file === 'string' && file.includes('video')) || (typeof file !== 'string' && file.type.startsWith('video'));
                                    const src = typeof file === 'string' ? file : URL.createObjectURL(file);
                                    return (
                                        <div key={index} className="relative aspect-video rounded-md overflow-hidden group bg-secondary">
                                            {isVideo ? (
                                                <video src={src} className="w-full h-full object-cover" muted loop playsInline />
                                            ) : (
                                                <Image src={src} alt={`Preview ${index}`} fill className="object-cover" />
                                            )}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                {isVideo && <Film className="h-6 w-6 text-white absolute top-2 left-2" />}
                                                <Button variant="destructive" size="icon" onClick={() => removeMedia(index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            </div>
                        )}
                    </div>
                )}
                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={handleSaveAssetChanges} size="lg">Salvar Alterações</Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
