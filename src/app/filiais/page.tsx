import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Building } from 'lucide-react';

export default function BranchesPage() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-5xl">
      <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <Building className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle className="text-3xl font-bold font-headline">Gerenciar Filiais</CardTitle>
                    <CardDescription>
                        Adicione e gerencie as informações de suas filiais.
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Em breve: formulário para adicionar e listar filiais com CNPJ, inscrição estadual, endereço e autorizações.</p>
        </CardContent>
      </Card>
    </div>
  );
}
