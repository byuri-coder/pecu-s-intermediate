import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Building, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Placeholder data for existing branches
const branches = [
  { id: 'filial-01', name: 'Filial São Paulo', cnpj: '12.345.678/0002-01', address: 'Av. Paulista, 1000, São Paulo - SP' },
  { id: 'filial-02', name: 'Filial Rio de Janeiro', cnpj: '12.345.678/0003-02', address: 'Av. Rio Branco, 1, Rio de Janeiro - RJ' },
];

export default function BranchesPage() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-5xl">
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
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Nova Filial
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <p className="text-muted-foreground">Em breve: formulário para adicionar e listar filiais com CNPJ, inscrição estadual, endereço e autorizações.</p>
                {/* 
                This section is a placeholder for the future branch list.
                <div className="border rounded-lg">
                    {branches.map((branch, index) => (
                        <div key={branch.id} className={`p-4 ${index < branches.length - 1 ? 'border-b' : ''}`}>
                            <p className="font-semibold">{branch.name}</p>
                            <p className="text-sm text-muted-foreground">CNPJ: {branch.cnpj}</p>
                            <p className="text-sm text-muted-foreground">{branch.address}</p>
                        </div>
                    ))}
                </div> 
                */}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
