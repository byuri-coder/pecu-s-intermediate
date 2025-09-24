"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "../../components/ui/button";
import { MoreHorizontal, FileText, Download, DollarSign, Receipt, Copy, Banknote, Landmark, UploadCloud, Info } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { placeholderInvoices } from "@/lib/placeholder-data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import * as React from "react";
import { Input } from "../../components/ui/input";

export default function InvoicesPage() {
    const { toast } = useToast();
    const [invoices, setInvoices] = React.useState(placeholderInvoices);
    const [isPaymentDialog, setPaymentDialog] = React.useState(false);
    const [isUploadDialog, setUploadDialog] = React.useState(false);
    const [selectedInvoice, setSelectedInvoice] = React.useState<typeof invoices[0] | null>(null);


    const handleUploadConfirmation = () => {
        if (!selectedInvoice) return;
        
        // In a real app, you would upload the file and send data to the backend.
        setInvoices(invoices.map(inv => 
            inv.id === selectedInvoice.id ? { ...inv, status: 'Em Análise' } : inv
        ));

        toast({
            title: "Comprovante Enviado!",
            description: `O comprovante da fatura ${selectedInvoice.id} foi enviado para análise.`,
        });
        
        setUploadDialog(false);
        setSelectedInvoice(null);
    };

    const copyToClipboard = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${fieldName} copiado!`,
            description: `O valor foi copiado para a área de transferência.`
        });
    }

    const platformPaymentInfo = {
        bank: "PECU'S Bank S.A.",
        agency: "0001",
        account: "98765-4",
        pixKey: "financeiro@pecus.com.br",
        holder: "PECU'S INTERMEDIATE LTDA",
        cnpj: "12.345.678/0001-99"
    };
    
    const getBadgeClass = (status: "Paga" | "Pendente" | "Em Análise") => {
        switch(status) {
            case "Paga": return "bg-green-100 text-green-800";
            case "Pendente": return "bg-yellow-100 text-yellow-800";
            case "Em Análise": return "bg-blue-100 text-blue-800";
            default: return "";
        }
    }

    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-5xl">
            <Dialog open={isPaymentDialog} onOpenChange={setPaymentDialog}>
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
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">{invoice.id}</TableCell>
                                        <TableCell className="text-muted-foreground">{invoice.description}</TableCell>
                                        <TableCell>{invoice.dueDate}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={invoice.status === "Paga" ? "secondary" : "default"}
                                                className={cn(getBadgeClass(invoice.status))}
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
                                                        <>
                                                            <DialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={() => setPaymentDialog(true)}>
                                                                     <Banknote className="mr-2 h-4 w-4" />
                                                                    Métodos de Pagamento
                                                                </DropdownMenuItem>
                                                            </DialogTrigger>
                                                        </>
                                                    )}
                                                     <DropdownMenuItem asChild>
                                                        <Link href={`/negociacao/${invoice.transactionId}/ajuste?view=archive`}>
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            <span>Contrato</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Baixar PDF da Fatura
                                                    </DropdownMenuItem>
                                                    {invoice.status !== 'Paga' && (
                                                        <>
                                                        <DropdownMenuSeparator/>
                                                        <DropdownMenuItem onSelect={() => { setSelectedInvoice(invoice); setUploadDialog(true); }}>
                                                            <DollarSign className="mr-2 h-4 w-4" />
                                                            Confirmar Pagamento
                                                        </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground">
                        Mostrando {invoices.length} faturas.
                    </CardFooter>
                </Card>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Métodos de Pagamento</DialogTitle>
                        <DialogDescription>
                            Realize a transferência para os dados abaixo para pagar sua fatura.
                        </DialogDescription>
                    </DialogHeader>
                     <Card className="mt-4 bg-white/70">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><Landmark className="h-5 w-5"/> {platformPaymentInfo.holder}</CardTitle>
                            <CardDescription>CNPJ: {platformPaymentInfo.cnpj}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between items-center"><span><strong>Banco:</strong> {platformPaymentInfo.bank}</span></div>
                            <div className="flex justify-between items-center"><span><strong>Agência:</strong> {platformPaymentInfo.agency}</span></div>
                            <div className="flex justify-between items-center"><span><strong>Conta:</strong> {platformPaymentInfo.account}</span></div>
                            <div className="flex justify-between items-center">
                                <span><strong>Chave PIX:</strong> {platformPaymentInfo.pixKey}</span>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyToClipboard(platformPaymentInfo.pixKey, 'Chave PIX')}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                     <Alert variant="destructive" className="bg-blue-50 border-blue-200 text-blue-900 [&>svg]:text-blue-900">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Próximo Passo</AlertTitle>
                        <AlertDescription>
                            Após o pagamento, clique em "Confirmar Pagamento" no menu da fatura e anexe o comprovante para análise.
                        </AlertDescription>
                    </Alert>
                </DialogContent>
            </Dialog>

            <Dialog open={isUploadDialog} onOpenChange={setUploadDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Anexar Comprovante</DialogTitle>
                        <DialogDescription>
                            Faça o upload do comprovante de pagamento para a fatura {selectedInvoice?.id}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                         <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 text-center cursor-pointer hover:bg-secondary transition-colors">
                            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-sm text-muted-foreground">Arraste ou clique para fazer upload do comprovante</p>
                            <Input type="file" className="hidden" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button onClick={handleUploadConfirmation}>Enviar para Análise</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
