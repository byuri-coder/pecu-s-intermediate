import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FilePlus } from 'lucide-react';

export default function RegisterAssetPage() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-5xl">
      <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <FilePlus className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle className="text-3xl font-bold font-headline">Cadastrar Ativos</CardTitle>
                    <CardDescription>
                        Cadastre créditos de carbono, terras rurais ou tributos para negociar.
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Em breve: formulário unificado para cadastro de ativos com botão para publicar no marketplace correspondente.</p>
        </CardContent>
      </Card>
    </div>
  );
}
