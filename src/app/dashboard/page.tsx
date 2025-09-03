import { placeholderCredits } from '@/lib/placeholder-data';
import type { CarbonCredit } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MovementsChart } from './movements-chart';

const StatusBadge = ({ status }: { status: CarbonCredit['status'] }) => {
  const variant = {
    'Ativo': 'default',
    'Pausado': 'outline',
    'Vendido': 'secondary',
  }[status] as 'default' | 'outline' | 'secondary';
  
  const className = {
    'Ativo': 'bg-green-100 text-green-800 border-green-200',
    'Pausado': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Vendido': 'bg-gray-100 text-gray-800 border-gray-200',
}[status];

  return <Badge variant={variant} className={cn('capitalize', className)}>{status}</Badge>
};

function cn(...inputs: (string | undefined)[]) {
  return inputs.filter(Boolean).join(' ');
}


export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Gerenciamento</h1>
        
        <MovementsChart />

        <Tabs defaultValue="my-credits">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="my-credits">Meus Créditos Anunciados</TabsTrigger>
            <TabsTrigger value="negotiations">Minhas Negociações</TabsTrigger>
            <TabsTrigger value="history">Histórico de Vendas/Compras</TabsTrigger>
          </TabsList>
          <TabsContent value="my-credits">
            <Card>
              <CardHeader>
                <CardTitle>Créditos Anunciados</CardTitle>
                <CardDescription>Gerencie os créditos que você listou no marketplace.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden sm:table-cell">ID do Crédito</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Preço por Crédito</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>
                        <span className="sr-only">Ações</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {placeholderCredits.map((credit) => (
                      <TableRow key={credit.id}>
                        <TableCell className="hidden sm:table-cell font-medium">{credit.id}</TableCell>
                        <TableCell>{credit.creditType}</TableCell>
                        <TableCell className="text-right">{credit.quantity.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(credit.pricePerCredit)}</TableCell>
                        <TableCell className="text-center"><StatusBadge status={credit.status} /></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuItem>Pausar</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive">Remover</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="negotiations">
              <Card>
                  <CardHeader>
                      <CardTitle>Negociações em Andamento</CardTitle>
                      <CardDescription>Acompanhe as propostas e conversas com potenciais compradores.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground py-12">
                      <p>(Em breve)</p>
                  </CardContent>
              </Card>
          </TabsContent>
          <TabsContent value="history">
              <Card>
                  <CardHeader>
                      <CardTitle>Histórico de Transações</CardTitle>
                      <CardDescription>Visualize todas as suas compras e vendas concluídas.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground py-12">
                      <p>(Em breve)</p>
                  </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
