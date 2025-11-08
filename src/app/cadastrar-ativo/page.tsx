import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegisterCreditForm } from '../register-credit/register-credit-form';
import { Leaf, Mountain, Landmark, Wheat } from 'lucide-react';
import { RegisterRuralLandForm } from './register-rural-land-form';
import { RegisterTaxCreditForm } from './register-tax-credit-form';
import { RegisterGrainForm } from './register-grain-form';

export default function RegisterAssetPage() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline">Cadastrar Ativos</CardTitle>
          <CardDescription>
            Selecione o tipo de ativo que deseja cadastrar e preencha as informações para publicá-lo no marketplace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="carbon-credit">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 mb-6">
              <TabsTrigger value="carbon-credit">
                <Leaf className="mr-2 h-4 w-4" />
                Crédito de Carbono
              </TabsTrigger>
              <TabsTrigger value="rural-land">
                <Mountain className="mr-2 h-4 w-4" />
                Terra Rural
              </TabsTrigger>
              <TabsTrigger value="tax-credit">
                <Landmark className="mr-2 h-4 w-4" />
                Crédito Tributário
              </TabsTrigger>
               <TabsTrigger value="grain">
                <Wheat className="mr-2 h-4 w-4" />
                Grãos
              </TabsTrigger>
            </TabsList>
            <TabsContent value="carbon-credit">
              <Card className="border-primary/20">
                <CardHeader>
                    <CardTitle>Formulário de Crédito de Carbono</CardTitle>
                    <CardDescription>Preencha os detalhes abaixo. Após a análise, você poderá publicar no marketplace.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RegisterCreditForm />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="rural-land">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Formulário de Terra Rural</CardTitle>
                  <CardDescription>Preencha os detalhes abaixo. Após a análise, você poderá publicar no marketplace.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RegisterRuralLandForm />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tax-credit">
              <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle>Formulário de Crédito Tributário</CardTitle>
                    <CardDescription>Preencha os detalhes abaixo. Após a análise, você poderá publicar no marketplace.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <RegisterTaxCreditForm />
                  </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="grain">
              <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle>Formulário de Grãos</CardTitle>
                    <CardDescription>Selecione a categoria e preencha os detalhes para anunciar seus grãos.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <RegisterGrainForm />
                  </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
