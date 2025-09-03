import { RegisterCreditForm } from './register-credit-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function RegisterCreditPage() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline">Cadastrar Crédito de Carbono</CardTitle>
          <CardDescription>
            Preencha o formulário abaixo para listar seus créditos de carbono.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterCreditForm />
        </CardContent>
      </Card>
    </div>
  );
}
