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
import { MoreHorizontal, FileText, Download, DollarSign, Receipt, Copy, Banknote, UploadCloud, Info, AlertCircle } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type InvoiceStatus = "Paga" | "Pendente" | "Em Análise" | "Negado";

type Invoice = {
  id: string;
  transactionId: string;
  description: string;
  dueDate: string;
  value: number;
  status: InvoiceStatus;
};


const initialInvoices: Invoice[] = [
    // Data is now dynamically calculated
];


type InvoiceWithOptionalCharges = Invoice & {
    displayValue?: number;
    penalty?: number;
    interest?: number;
    rejectionReason?: string;
};


export default function InvoicesPage() {
    const { toast } = useToast();
    const [invoices, setInvoices] = React.useState<InvoiceWithOptionalCharges[]>([]);
    const [isPaymentDialog, setPaymentDialog] = React.useState(false);
    const [isUploadDialog, setUploadDialog] = React.useState(false);
    const [selectedInvoice, setSelectedInvoice] = React.useState<InvoiceWithOptionalCharges | null>(null);

    React.useEffect(() => {
        // This would in reality be a fetch from a database.
        // We simulate it being created by the server-side action.
        const fetchedInvoices: Invoice[] = [
             { 
                id: 'FAT-001', 
                transactionId: 'proj-cerrado-conservation',
                description: 'Taxa de serviço - Venda Crédito Carbono',
                dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'), // 30 days ago
                value: 594, 
                status: 'Pendente'
            },
            { 
                id: 'FAT-002', 
                transactionId: 'op-002',
                description: 'Taxa de serviço - Compra Crédito Tributário',
                dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'), // yesterday
                value: 1455, 
                status: 'Pendente'
            },
            { 
                id: 'FAT-003', 
                transactionId: 'op-004',
                description: 'Taxa de serviço - Venda Crédito Carbono',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'), // in 30 days
                value: 1100, 
                status: 'Pendente'
            }
        ]

        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        const updatedInvoices = fetchedInvoices.map(inv => {
            const currentStatus = (inv.status || 'Pendente') as InvoiceStatus;
            
            if (currentStatus !== 'Pendente') {
                return { ...inv, displayValue: inv.value, status: currentStatus };
            }

            const [day, month, year] = inv.dueDate.split('/').map(Number);
            const dueDate = new Date(year, month - 1, day);
            dueDate.setHours(0, 0, 0, 0); 

            if (today <= dueDate) {
                return { ...inv, displayValue: inv.value, status: currentStatus };
            }

            const timeDiff = today.getTime() - dueDate.getTime();
            const daysOverdue = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            const penalty = inv.value * 0.02; // 2% fixed penalty
            const interest = inv.value * (0.01 / 30) * daysOverdue; // 1% per month, daily
            const displayValue = inv.value + penalty + interest;

            return { ...inv, displayValue, penalty, interest, status: currentStatus };
        });

        setInvoices(updatedInvoices);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleUploadConfirmation = () => {
        if (!selectedInvoice) return;
        
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
        bank: "Nu Pagamentos S.A. - Instituição de Pagamento",
        agency: "0001",
        account: "527075729-7",
        pixKey: "e8e04450-cba4-4cfd-9f37-92359def4af0",
        holder: "YURI BARBOSA PAULO",
        cnpj: ""
    };
    
    const getBadgeClass = (status: InvoiceStatus) => {
        switch(status) {
            case "Paga": return "bg-green-100 text-green-800";
            case "Pendente": return "bg-yellow-100 text-yellow-800";
            case "Em Análise": return "bg-blue-100 text-blue-800";
            case "Negado": return "bg-red-100 text-red-800";
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
                        {invoices.length > 0 ? (
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
                                            <TableCell>
                                                <p className="text-muted-foreground">{invoice.description}</p>
                                                {invoice.status === 'Negado' && invoice.rejectionReason && (
                                                    <div className="text-xs text-destructive italic mt-1 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" />
                                                        Justificativa: {invoice.rejectionReason}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>{invoice.dueDate}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={"outline"}
                                                    className={cn("border", getBadgeClass(invoice.status))}
                                                >
                                                    {invoice.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {new Intl.NumberFormat("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL",
                                                }).format(invoice.displayValue || invoice.value)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {(invoice.status === "Pendente" || invoice.status === "Negado") && (
                                                            <>
                                                                <DialogTrigger asChild>
                                                                    <DropdownMenuItem onSelect={() => setPaymentDialog(true)}>
                                                                        <Banknote className="mr-2 h-4 w-4" />
                                                                        Pagar Plataforma
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
                                                                Anexar Comprovante
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
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground">Nenhuma fatura encontrada.</p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground flex justify-center text-center">
                        <p className="max-w-prose">
                         Atenção: Faturas não pagas até o vencimento estão sujeitas a multa de 2% e juros de mora de 1% a.m. (pro rata die). O status "Negado" indica que o comprovante anterior foi recusado. Por favor, realize um novo pagamento e anexe o comprovante correto.
                        </p>
                    </CardFooter>
                </Card>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Pagar Plataforma</DialogTitle>
                        <DialogDescription>
                            Realize a transferência para os dados abaixo para pagar sua fatura.
                        </DialogDescription>
                    </DialogHeader>
                     <Card className="mt-4 bg-white/70">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><Banknote className="h-5 w-5"/> <b>{platformPaymentInfo.holder}</b></CardTitle>
                            {platformPaymentInfo.cnpj && <CardDescription>{platformPaymentInfo.cnpj}</CardDescription>}
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between items-center"><span><strong>Banco:</strong> {platformPaymentInfo.bank}</span></div>
                            <div className="flex justify-between items-center"><span><strong>Agência:</strong> {platformPaymentInfo.agency}</span></div>
                            <div className="flex justify-between items-center"><span><strong>Conta:</strong> {platformPaymentInfo.account}</span></div>
                            <Separator />
                            <div className="font-semibold pt-2">Opção PIX</div>
                            <div className="flex justify-between items-center">
                                <span><strong>Chave PIX (Aleatória):</strong> {platformPaymentInfo.pixKey}</span>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyToClipboard(platformPaymentInfo.pixKey || '', 'Chave PIX')}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="text-center p-4 border rounded-md bg-muted/50">
                                <p className="text-muted-foreground">QR Code aparecerá aqui</p>
                            </div>
                        </CardContent>
                    </Card>
                     <Alert variant="destructive" className="bg-blue-50 border-blue-200 text-blue-900 [&>svg]:text-blue-900">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Próximo Passo</AlertTitle>
                        <AlertDescription>
                            Após o pagamento, clique em "Anexar Comprovante" no menu da fatura e envie o documento para análise.
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

    