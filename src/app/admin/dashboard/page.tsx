
"use client"

import * as React from "react"
import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Users,
  LineChart,
  ShieldAlert,
  X,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Anuncio, Usuario } from "@/models"


const transactionsData: { month: string; total: number }[] = []

const revenueData: { name: string; receita: number; taxas: number }[] = []


export default function Dashboard() {
  const [showAlert, setShowAlert] = React.useState(false);
  const [stats, setStats] = React.useState<any>(null);
  const [recentTransactions, setRecentTransactions] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function fetchData() {
        try {
            const response = await fetch('/api/admin/stats');
            const data = await response.json();
            if(data.ok) {
                setStats(data.stats);
                setRecentTransactions(data.recentTransactions);
            }
        } catch (error) {
            console.error("Failed to fetch admin stats", error);
        }
    }
    fetchData();
  }, []);
  
  return (
    <>
       {showAlert && (
        <Alert variant="destructive" className="mb-4 relative pr-12">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Alerta 001: Auditoria de Contratos</AlertTitle>
            <AlertDescription>
            Existem novos contratos finalizados pendentes de verificação de integridade. 
            <Link href="/admin/audit" className="font-bold underline ml-2">Verificar Agora</Link>
            </AlertDescription>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => setShowAlert(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar alerta</span>
            </Button>
        </Alert>
       )}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              +0.0% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats?.userCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              +0.0% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats?.transactionsCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              +0% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos em Negociação</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats?.negotiatingCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              +0 desde a última hora
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Últimas Transações</CardTitle>
              <CardDescription>
                Transações recentes na plataforma.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/admin/reports">
                Ver Todas
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Tipo
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Status
                  </TableHead>
                  <TableHead className="hidden md:table-cell lg:hidden xl:table-cell">
                    Data
                  </TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {recentTransactions.length > 0 ? recentTransactions.map(tx => (
                    <TableRow key={tx._id}>
                        <TableCell>
                            <div className="font-medium">{tx.buyer?.nome || 'N/A'}</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                                {tx.buyer?.email || 'N/A'}
                            </div>
                        </TableCell>
                         <TableCell className="hidden xl:table-cell">{tx.anuncio?.tipo || 'N/A'}</TableCell>
                         <TableCell className="hidden xl:table-cell">
                            <Badge className="text-xs" variant="outline">
                                {tx.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell lg:hidden xl:table-cell">
                            {new Date(tx.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.price || 0)}</TableCell>
                    </TableRow>
                 )) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">Nenhuma transação recente.</TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usuários Mais Ativos</CardTitle>
            <CardDescription>
              Usuários com mais transações concluídas.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8">
            <div className="text-center text-muted-foreground py-8">
                Nenhum usuário ativo.
            </div>
          </CardContent>
        </Card>
      </div>
       <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Evolução das Transações</CardTitle>
                    <CardDescription>Volume de transações mensais.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={transactionsData}>
                            <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`}/>
                            <Tooltip />
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Receita Mensal</CardTitle>
                    <CardDescription>Receita de taxas e assinaturas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`}/>
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="taxas" stackId="a" fill="hsl(var(--primary) / 0.5)" name="Taxas"/>
                            <Bar dataKey="receita" stackId="a" fill="hsl(var(--primary))" name="Receita Total" radius={[4, 4, 0, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    </>
  )
}
