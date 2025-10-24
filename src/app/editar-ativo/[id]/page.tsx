
'use client';

import { notFound, useSearchParams, useParams, useRouter } from 'next/navigation';
import type { CarbonCredit, RuralLand, TaxCredit } from '@/lib/types';
import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, UploadCloud, Film, Trash2, Loader2, ShieldCheck } from 'lucide-react';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Anuncio } from '@/models';

type AssetType = 'carbon-credit' | 'tax-credit' | 'rural-land';
// The asset from the DB will be a full Anuncio object
type Asset = any;

function EditAssetForm({ asset, assetType }: { asset: Asset, assetType: AssetType }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [editableAsset, setEditableAsset] = React.useState(asset);
  // Ensure mediaFiles is initialized correctly from asset.imagens
  const [mediaFiles, setMediaFiles] = React.useState<(File|{url: string, type: string})[]>(
    (asset.imagens && Array.isArray(asset.imagens)) ? asset.imagens : []
  );
  const [isSaving, setIsSaving] = React.useState(false);


  const handleAssetChange = (field: keyof Asset, value: any) => {
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
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSaveAssetChanges = async () => {
    setIsSaving(true);
    try {
        const uploadedMediaUrls = await Promise.all(mediaFiles.map(async (fileOrObject) => {
            if (typeof fileOrObject === 'object' && 'url' in fileOrObject) {
                 return fileOrObject; // It's already an object with a URL
            }
            const file = fileOrObject as File;
            // In a real app, upload `file` and return the URL. For now, we simulate.
            return {
                url: `https://picsum.photos/seed/${editableAsset._id}-${file.name}/800/600`,
                type: file.type.startsWith('video') ? 'video' : 'image'
            };
        }));
        
        const payload = {
            ...editableAsset,
            imagens: uploadedMediaUrls,
        };
        
        const response = await fetch(`/api/anuncios/${asset._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Falha ao salvar as alterações.');
        }

        toast({
            title: "Sucesso!",
            description: "As alterações no ativo foram salvas.",
        });

        router.push('/dashboard');
        router.refresh();

    } catch(e: any) {
        toast({ title: "Erro", description: e.message || "Não foi possível salvar as alterações.", variant: 'destructive'});
        console.error(e);
    } finally {
        setIsSaving(false);
    }
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 md:col-span-2">
                        <Label>Título do Anúncio</Label>
                        <Input value={editableAsset.titulo} onChange={(e) => handleAssetChange('titulo', e.target.value)} />
                    </div>
                    {editableAsset.price !== undefined && (
                        <div className="space-y-1">
                            <Label>Preço (BRL)</Label>
                            <Input type="number" value={editableAsset.price} onChange={(e) => handleAssetChange('price', parseFloat(e.target.value) || 0)} />
                        </div>
                    )}
                    <div className="md:col-span-2 space-y-1">
                        <Label>Descrição</Label>
                        <Textarea value={editableAsset.descricao} onChange={(e) => handleAssetChange('descricao', e.target.value)} rows={4} />
                    </div>
                </div>

                {assetType === 'rural-land' && (
                    <div className="space-y-4 pt-4 border-t">
                        <Label>Mídia da Propriedade (Fotos e Vídeos)</Label>
                        <div 
                            className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 text-center cursor-pointer hover:bg-secondary transition-colors"
                            onClick={() => document.getElementById('media-upload-input')?.click()}>
                            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-sm text-muted-foreground">Clique para adicionar fotos ou vídeos</p>
                            <p className="text-xs text-muted-foreground/70">JPG, PNG, MP4</p>
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
                                {mediaFiles.map((fileOrObject, index) => {
                                    const isFile = fileOrObject instanceof File;
                                    const src = isFile ? URL.createObjectURL(fileOrObject as File) : (fileOrObject as {url: string}).url;
                                    const type = isFile ? (fileOrObject as File).type : (fileOrObject as {type: 'image' | 'video'}).type;
                                    const isVideo = type.startsWith('video');

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
                    <Button onClick={handleSaveAssetChanges} size="lg" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Salvar Alterações
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function EditAssetPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? '';
  const assetType = (searchParams?.get('type') as AssetType);
  
  const [asset, setAsset] = React.useState<Asset | null | 'loading'>('loading');
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [authError, setAuthError] = React.useState('');
  const [isAuthPending, setIsAuthPending] = React.useState(false);


  React.useEffect(() => {
    async function fetchAsset() {
        if (id && assetType) {
            try {
                const res = await fetch(`/api/anuncios/${id}`);
                const data = await res.json();
                if(data.ok) {
                     setAsset(data.anuncio);
                } else {
                    setAsset(null);
                }
            } catch(e) {
                console.error("Failed to fetch asset", e);
                setAsset(null);
            }
        }
    }
    fetchAsset();
  }, [id, assetType]);

  const handleReauthenticate = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError('');
      setIsAuthPending(true);
      const auth = getAuth(app);
      const user = auth.currentUser;

      if (user && user.email) {
          try {
              const credential = EmailAuthProvider.credential(user.email, password);
              await reauthenticateWithCredential(user, credential);
              setIsAuthenticated(true);
          } catch(error: any) {
              if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                setAuthError("Senha inválida. Tente novamente.");
              } else {
                setAuthError("Ocorreu um erro ao verificar sua identidade.");
                console.error(error);
              }
          }
      } else {
          setAuthError("Não foi possível encontrar um usuário logado.");
      }
      setIsAuthPending(false);
  }

  if (asset === 'loading') {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin"/></div>;
  }

  if (!asset) {
    notFound();
  }

  if (!isAuthenticated) {
    const auth = getAuth(app);
    const user = auth.currentUser;
    return (
        <div className="container mx-auto max-w-md py-8 px-4 sm:px-6 lg:px-8">
             <div className="mb-6">
                <Button variant="outline" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para o Gerenciamento
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold font-headline flex items-center gap-3">
                        <ShieldCheck className="h-7 w-7" />
                        Confirme sua Identidade
                    </CardTitle>
                    <CardDescription>
                        Para sua segurança, por favor, confirme sua senha para continuar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleReauthenticate} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="auth-email">Email</Label>
                            <Input id="auth-email" type="email" value={user?.email || ''} required readOnly disabled className="bg-muted"/>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="auth-password">Senha</Label>
                            <Input id="auth-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" autoFocus/>
                        </div>
                        {authError && <p className="text-sm font-medium text-destructive">{authError}</p>}
                        <Button type="submit" className="w-full" disabled={isAuthPending}>
                            {isAuthPending ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Confirmar e Editar'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
  }

  return <EditAssetForm asset={asset} assetType={assetType} />;
}
