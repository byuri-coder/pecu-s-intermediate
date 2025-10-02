"use client"

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Eye, ThumbsDown, ThumbsUp, XCircle } from "lucide-react"
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


const initialReceipts: {
    id: string;
    invoiceId: string;
    userId: string;
    userName: string;
    date: string;
    status: "Pendente" | "Aprovado" | "Negado";
    fileUrl: string;
    rejectionReason: string;
}[] = [
  // Dados de teste removidos
]

type Receipt = typeof initialReceipts[0];

export default function ReceiptsPage() {
  const [receipts, setReceipts] = React.useState(initialReceipts);
  const { toast } = useToast();

  const handleUpdateStatus = (receiptId: string, newStatus: Receipt['status'], reason = "") => {
    setReceipts(prevReceipts => 
      prevReceipts.map(receipt => 
        receipt.id === receiptId 
          ? { ...receipt, status: newStatus, rejectionReason: reason } 
          : receipt
      )
    );
    toast({
      title: `Comprovante ${newStatus.toLowerCase()}`,
      description: `O status do comprovante ${receiptId} foi atualizado.`,
    });
  };

  const getStatusInfo = (status: Receipt['status']) => {
    switch (status) {
      case 'Aprovado':
        return {
          badge: <Badge variant="secondary" className="bg-green-100 text-green-800">Aprovado</Badge>,
          action: (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Pagamento confirmado.</span>
            </div>
          ),
        };
      case 'Negado':
         return {
          badge: <Badge variant="destructive">Negado</Badge>,
          action: (
             <div className="flex items-center gap-2 text-sm text-destructive">
                <XCircle className="h-4 w-4" />
                <span>Pagamento recusado.</span>
            </div>
          ),
        };
      default: // Pendente
        return {
          badge: <Badge variant="outline">Pendente</Badge>,
          action: null
        }
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Comprovantes</CardTitle>
        <CardDescription>
          Analise e aprove ou negue os comprovantes de pagamento das taxas de
          serviço.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Fatura Ref.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Comprovante</TableHead>
              <TableHead className="w-[30%]">Descrição / Justificativa</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.length > 0 ? receipts.map((receipt) => {
                const { badge, action } = getStatusInfo(receipt.status);
                const isPending = receipt.status === 'Pendente';

                return (
                  <TableRow key={receipt.id}>
                    <TableCell>
                      <div className="font-medium">{receipt.userName}</div>
                      <div className="text-sm text-muted-foreground">{receipt.userId}</div>
                    </TableCell>
                    <TableCell>{receipt.invoiceId}</TableCell>
                    <TableCell>{badge}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <a href={receipt.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </a>
                      </Button>
                    </TableCell>
                    <TableCell>
                        {isPending ? (
                            <Textarea 
                                id={`reason-${receipt.id}`}
                                placeholder="Adicione uma justificativa para a recusa aqui..." 
                                disabled={!isPending}
                            />
                        ) : (
                           action
                        )}
                        {receipt.status === 'Negado' && receipt.rejectionReason && (
                             <p className="text-xs text-muted-foreground mt-1 italic">
                                <strong>Justificativa:</strong> {receipt.rejectionReason}
                            </p>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isPending ? (
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                            onClick={() => handleUpdateStatus(receipt.id, 'Aprovado')}
                          >
                            <ThumbsUp className="mr-2 h-4 w-4" /> Aceitar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                                const reasonInput = document.getElementById(`reason-${receipt.id}`) as HTMLTextAreaElement;
                                if (!reasonInput.value) {
                                    toast({
                                        title: 'Justificativa necessária',
                                        description: 'Por favor, forneça uma justificativa para negar o comprovante.',
                                        variant: 'destructive',
                                    });
                                    return;
                                }
                                handleUpdateStatus(receipt.id, 'Negado', reasonInput.value);
                            }}
                          >
                            <ThumbsDown className="mr-2 h-4 w-4" /> Negar
                          </Button>
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-sm">
                            Processado
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
            }) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">Nenhum comprovante pendente.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
