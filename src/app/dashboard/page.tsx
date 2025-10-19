'use client';

import * as React from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Play, Pause, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MovementsChart } from './movements-chart';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Asset = {
    id: string;
    titulo: string;
    price?: number;
    assetType: 'carbon-credit' | 'tax-credit' | 'rural-land';
    status: 'Disponível' | 'Negociando' | 'Vendido' | 'Pausado' | 'Ativo';
};

const StatusBadge = ({ status }: { status: Asset['status'] }) => {
  const variant = {
    'Ativo': 'default',
    'Disponível': 'default',
    'Pausado': 'outline',
    'Vendido': 'secondary',
    'Negociando': 'outline',
  }[status] as 'default' | 'outline' | 'secondary';
  
  const className = {
    'Ativo': 'bg-green-100 text-green-800 border-green-200',
    'Disponível': 'bg-green-100 text-green-800 border-green-200',
    'Pausado': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Vendido': 'bg-gray-100 text-gray-800 border-gray-200',
    'Negociando': 'bg-blue-100 text-blue-800 border-blue-200',
  }[status];

  return <Badge variant={variant} className={cn('capitalize', className)}>{status}</Badge>;
};

const AssetTypeBadge = ({ type }: { type: Asset['assetType']}) => {
    const typeMap = {
        'carbon-credit': { label: 'Carbono', className: 'bg-green-600/10 text-green-800' },
        'tax-credit': { label: 'Tributário', className: 'bg-blue-600/10 text-blue-800' },
        'rural-land': { label: 'Terra Rural', className: 'bg-orange-600/10 text-orange-800' },
    }
    const { label, className } = typeMap[type] || { label: 'Outro', className: 'bg-gray-600/10 text-gray-800' };
    return <Badge variant="secondary" className={cn('capitalize', className)}>{label}</Badge>
}

export default function DashboardPage({
  searchParams,
}: {
  searchParams?: {
    tab?: string;
  };
}) {
  const currentTab = searchParams?.tab || 'my-assets';
  const { toast } } from useToast();
  const [allAssets, setAllAssets] = React.useState<Asset[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAlertOpen, setAlertOpen] = React.useState(false);
  const [assetToDelete, setAssetToDelete] = React.useState<Asset | null>(null);

  const fetchAssets = React.useCallback(async (userId: string) => {
    setLoading(true);
    try {
        const response = await fetch(`/api/anuncios/list?uidFirebase=${userId}`);
        if (!response.ok) {
            throw new Error('Falha ao buscar anúncios do usuário.');
        }
        const data = await response.json();
        
        const formattedAssets = data.anuncios.map((anuncio: any) => ({
            ...anuncio,
            id: anuncio._id,
            assetType: anuncio.tipo,
        }));
        
        setAllAssets(formattedAssets);

    } catch (error) {
        console.error("Error fetching assets: ", error);
        toast({ title: "Erro ao buscar ativos", description: "Não foi possível carregar seus ativos do banco de dados.", variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            fetchAssets(user.uid);
        } else {
            setLoading(false);
            setAllAssets([]);
        }
    });

    return () => unsubscribe();
  }, [fetchAssets]);

  const updateAssetStatus = async (asset: Asset, newStatus: Asset['status']) => {
    // A API de update ainda precisa ser criada.
    toast({ title: "Funcionalidade em desenvolvimento", description: "A atualização de status será implementada em breve."});
  };
  
  const handleTogglePause = (asset: Asset) => {
    const newStatus: Asset['status'] = (asset.status === 'Ativo' || asset.status === 'Disponível') ? 'Pausado' : 'Disponível';
    updateAssetStatus(asset, newStatus);
  };
  
  const confirmDelete = (asset: Asset) => {
    setAssetToDelete(asset);
    setAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!assetToDelete) return;
    // A API de delete ainda precisa ser criada.
     toast({ title: "Funcionalidade em desenvolvimento", description: "A exclusão de ativos será implementada em breve."});
    setAlertOpen(false);
    setAssetToDelete(null);
  };

  const getAssetDetails = (asset: Asset) => {
    return {
        name: asset.titulo,
        value: asset.price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asset.price) : 'A negociar'
    };
  }


  return (
    <>
    <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso irá apagar permanentemente o ativo <span className="font-semibold">{assetToDelete ? getAssetDetails(assetToDelete).name : ''}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setAssetToDelete(null)}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Gerenciamento</h1>
        
        <MovementsChart />

        <Tabs defaultValue={currentTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="my-assets">Meus Ativos Anunciados</TabsTrigger>
            <TabsTrigger value="negotiations">Minhas Negociações</TabsTrigger>
            <TabsTrigger value="history">Histórico de Vendas/Compras</TabsTrigger>
          </TabsList>
          <TabsContent value="my-assets">
            <Card>
              <CardHeader>
                <CardTitle>Ativos Anunciados</CardTitle>
                <CardDescription>Gerencie os ativos que você listou.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ativo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor / Detalhes</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>
                        <span className="sr-only">Ações</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                            </TableCell>
                        </TableRow>
                    ) : allAssets.length > 0 ? allAssets.map((asset) => {
                      const { name, value } = getAssetDetails(asset);
                      return (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell><AssetTypeBadge type={asset.assetType}/></TableCell>
                        <TableCell>{value}</TableCell>
                        <TableCell className="text-center">
                            <StatusBadge status={asset.status} />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              {asset.status === 'Vendido' ? (
                                <DropdownMenuItem asChild>
                                  <Link href={`/negociacao/${asset.id}/ajuste?type=${asset.assetType}&view=archive`}>Dados da Negociação</Link>
                                </DropdownMenuItem>
                              ) : (
                                <>
                                  <DropdownMenuItem asChild>
                                      <Link href={`/editar-ativo/${asset.id}?type=${asset.assetType}`}>
                                        <Edit className="mr-2 h-4 w-4"/> Editar
                                      </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleTogglePause(asset)}>
                                      {(asset.status === 'Ativo' || asset.status === 'Disponível') ? (
                                          <><Pause className="mr-2 h-4 w-4"/> Pausar</>
                                      ) : (
                                          <><Play className="mr-2 h-4 w-4"/> Ativar</>
                                      )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive" 
                                    onClick={() => confirmDelete(asset)}
                                    onSelect={(e) => e.preventDefault()}
                                    >
                                    <Trash2 className="mr-2 h-4 w-4"/> Remover
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )}) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                Nenhum ativo anunciado. <Link href="/cadastrar-ativo" className="text-primary underline">Cadastre um ativo</Link> para começar.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="negotiations">
              <Card>
                  <CardHeader>
                      <CardTitle>Negociações em Andamento</CardTitle>
                      <CardDescription>Acompanhe as propostas e conversas com potenciais compradores.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground py-12">
                      <p>(Em breve)</p>
                  </CardContent>
              </Card>
          </TabsContent>
          <TabsContent value="history">
              <Card>
                  <CardHeader>
                      <CardTitle>Histórico de Transações</CardTitle>
                      <CardDescription>Visualize todas as suas compras e vendas concluídas.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground py-12">
                      <p>(Em breve)</p>
                  </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}

    