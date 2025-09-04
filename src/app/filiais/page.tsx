'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Building, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddBranchForm } from './add-branch-form';

// Placeholder data for existing branches
const branches = [
  { id: 'filial-01', name: 'Filial São Paulo', cnpj: '12.345.678/0002-01', address: 'Av. Paulista, 1000, São Paulo - SP' },
  { id: 'filial-02', name: 'Filial Rio de Janeiro', cnpj: '12.345.678/0003-02', address: 'Av. Rio Branco, 1, Rio de Janeiro - RJ' },
];

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
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Nova Filial
                    </Button>
                  </DialogTrigger>
              </div>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                  <div className="border rounded-lg">
                      {branches.map((branch, index) => (
                          <div key={branch.id} className={`p-4 ${index < branches.length - 1 ? 'border-b' : ''}`}>
                              <p className="font-semibold">{branch.name}</p>
                              <p className="text-sm text-muted-foreground">CNPJ: {branch.cnpj}</p>
                              <p className="text-sm text-muted-foreground">{branch.address}</p>
                          </div>
                      ))}
                  </div>
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
