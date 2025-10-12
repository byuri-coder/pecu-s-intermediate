
'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { FileSignature, PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import type { Petition } from '@/lib/types';
import { PetitionForm } from './petition-form';


export default function PetitionsPage() {
  const [isFormOpen, setFormOpen] = React.useState(false);
  const [selectedPetition, setSelectedPetition] = React.useState<Petition | null>(null);
  const [petitions, setPetitions] = React.useState<Petition[]>([]);


  const handleEdit = (petition: Petition) => {
    setSelectedPetition(petition);
    setFormOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedPetition(null);
    setFormOpen(true);
  }

  const handleFormSuccess = () => {
    setFormOpen(false);
    setSelectedPetition(null);
    // Here you would typically refetch the petitions data
  };

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-5xl">
      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <FileSignature className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-3xl font-bold font-headline">
                    Minhas Petições
                  </CardTitle>
                  <CardDescription>
                    Crie, gerencie e exporte suas petições.
                  </CardDescription>
                </div>
              </div>
              <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Nova Petição
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {petitions.length > 0 ? (
                <div className="border rounded-lg">
                  {petitions.map((petition, index) => (
                    <div
                      key={petition.id}
                      className={`flex items-center justify-between p-4 ${
                        index < petitions.length - 1 ? 'border-b' : ''
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{petition.title}</p>
                        <div className="flex items-center gap-2">
                           <Badge variant={petition.status === 'finalizado' ? 'default' : 'outline'}>
                            {petition.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                           </Badge>
                           <p className="text-sm text-muted-foreground">
                            Atualizado em: {new Date(petition.updatedAt).toLocaleDateString('pt-BR')}
                           </p>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(petition)}>
                                <Edit className="mr-2 h-4 w-4" /> Editar / Ver
                            </DropdownMenuItem>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                     onSelect={(e) => e.preventDefault()}
                                     className="text-destructive focus:text-destructive"
                                    >
                                     <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Isso irá apagar permanentemente a petição <span className="font-semibold">{petition.title}</span>.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                                        Excluir
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Nenhuma petição encontrada.</p>
                    <Button variant="link" onClick={handleAddNew}>Crie sua primeira petição</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedPetition ? 'Editar Petição' : 'Criar Nova Petição'}</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo. Você pode salvar como rascunho ou finalizar.
            </DialogDescription>
          </DialogHeader>
          <PetitionForm
            petition={selectedPetition}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
