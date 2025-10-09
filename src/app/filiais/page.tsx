'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Building, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog"
import { AddBranchForm } from './add-branch-form';

// Placeholder data for existing branches
const branches: { id: string; name: string; cnpj: string; address: string }[] = [];

export default function BranchesPage() {
  const [isDialogOpen, setDialogOpen] = React.useState(false);

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-5xl">
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <Card>
          <CardHeader>
              <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                      <Building className="h-8 w-8 text-primary" />
                      <div>
                          <CardTitle className="text-3xl font-bold font-headline">Gerenciar Filiais</CardTitle>
                          <CardDescription>
                              Adicione e gerencie as informações de suas filiais.
                          </CardDescription>
                      </div>
                  </div>
                  <DialogTrigger asChild>
                    <Button onClick={() => setDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Nova Filial
                    </Button>
                  </DialogTrigger>
              </div>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                  {branches.length > 0 ? (
                    <div className="border rounded-lg">
                        {branches.map((branch, index) => (
                            <div key={branch.id} className={`flex items-center justify-between p-4 ${index < branches.length - 1 ? 'border-b' : ''}`}>
                                <div>
                                <p className="font-semibold">{branch.name}</p>
                                <p className="text-sm text-muted-foreground">CNPJ: {branch.cnpj}</p>
                                <p className="text-sm text-muted-foreground">{branch.address}</p>
                                </div>
                                <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Excluir Filial</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Essa ação não pode ser desfeita. Isso irá apagar permanentemente a filial <span className="font-semibold">{branch.name}</span> dos nossos servidores.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive hover:bg-destructive/90"
                                        onClick={() => console.log('delete branch', branch.id)}
                                    >
                                        Excluir
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                    </div>
                   ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Nenhuma filial encontrada.</p>
                    </div>
                   )}
              </div>
          </CardContent>
        </Card>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Nova Filial</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para adicionar uma nova filial à sua conta.
            </DialogDescription>
          </DialogHeader>
          <AddBranchForm onSuccess={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
