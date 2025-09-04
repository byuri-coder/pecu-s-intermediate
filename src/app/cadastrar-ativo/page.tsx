import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegisterCreditForm } from '../register-credit/register-credit-form';
import { Leaf, Mountain, Landmark } from 'lucide-react';

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
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
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
              <Card>
                <CardHeader>
                  <CardTitle>Cadastro de Terra Rural</CardTitle>
                  <CardDescription>Esta funcionalidade estará disponível em breve.</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-12">
                  <p>(Em breve: formulário para cadastrar terras para venda, arrendamento, etc.)</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tax-credit">
              <Card>
                  <CardHeader>
                    <CardTitle>Cadastro de Crédito Tributário</CardTitle>
                    <CardDescription>Esta funcionalidade estará disponível em breve.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground py-12">
                      <p>(Em breve: formulário para cadastrar saldos credores de ICMS, PIS/COFINS, etc.)</p>
                  </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
