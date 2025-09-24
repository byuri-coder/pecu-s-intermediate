import { RegistrationForm } from './registration-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { UserPlus } from 'lucide-react';

export default function RegistrationPage() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-5xl">
      <Card className="border-primary/20">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                <UserPlus className="h-8 w-8" />
            </div>
          <CardTitle className="text-3xl font-bold font-headline">Crie sua Conta</CardTitle>
          <CardDescription>
            Complete seu cadastro para começar a negociar na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegistrationForm />
        </CardContent>
      </Card>
    </div>
  );
}