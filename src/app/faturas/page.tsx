"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText, Download, DollarSign, Receipt } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { placeholderInvoices } from "@/lib/placeholder-data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function InvoicesPage() {
    const { toast } = useToast();

    const handlePay = (invoiceId: string) => {
        toast({
            title: "Pagamento Simulado",
            description: `O pagamento da fatura ${invoiceId} foi processado.`,
        });
        // In a real app, you would update the invoice status here.
    };

    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-5xl">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Receipt className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle className="text-3xl font-bold font-headline">Minhas Faturas</CardTitle>
                            <CardDescription>
                                Gerencie as faturas de taxas de serviço da plataforma.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Fatura</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Vencimento</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead>
                                <span className="sr-only">Ações</span>
                            </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {placeholderInvoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.id}</TableCell>
                                    <TableCell className="text-muted-foreground">{invoice.description}</TableCell>
                                    <TableCell>{invoice.dueDate}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={invoice.status === "Paga" ? "secondary" : "default"}
                                            className={cn(invoice.status === "Paga" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800")}
                                        >
                                            {invoice.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(invoice.value)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {invoice.status === "Pendente" && (
                                                    <DropdownMenuItem onClick={() => handlePay(invoice.id)}>
                                                        <DollarSign className="mr-2 h-4 w-4" />
                                                        Pagar Fatura
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Baixar PDF
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter className="text-sm text-muted-foreground">
                    Mostrando {placeholderInvoices.length} faturas.
                </CardFooter>
            </Card>
        </div>
    );
}
