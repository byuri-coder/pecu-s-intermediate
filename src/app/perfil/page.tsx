import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-5xl">
      <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <User className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle className="text-3xl font-bold font-headline">Meu Perfil</CardTitle>
                    <CardDescription>
                        Gerencie suas informações pessoais, de acesso e filiais.
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Em breve: formulário para editar foto de perfil, email, autorizações especiais, endereço, nome, senha e inscrição estadual.</p>
        </CardContent>
      </Card>
    </div>
  );
}
