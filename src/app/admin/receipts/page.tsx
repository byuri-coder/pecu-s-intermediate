"use client"

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
import { CheckCircle, Eye, ThumbsDown, ThumbsUp } from "lucide-react"

const mockReceipts = [
  {
    id: "RCPT-001",
    userId: "user-123",
    userName: "Empresa Inovadora S.A.",
    invoiceId: "FAT-001",
    date: "2024-05-20",
    status: "Pendente",
    fileUrl: "#",
  },
  {
    id: "RCPT-002",
    userId: "user-456",
    userName: "Comércio Varejista Brasil",
    invoiceId: "FAT-002",
    date: "2024-05-21",
    status: "Pendente",
    fileUrl: "#",
  },
   {
    id: "RCPT-003",
    userId: "user-789",
    userName: "Soluções em TI",
    invoiceId: "FAT-003",
    date: "2024-05-19",
    status: "Aprovado",
    fileUrl: "#",
  },
]

export default function ReceiptsPage() {
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
              <TableHead>Data de Envio</TableHead>
              <TableHead>Comprovante</TableHead>
              <TableHead className="w-[30%]">Descrição / Justificativa</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockReceipts.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell>
                  <div className="font-medium">{receipt.userName}</div>
                  <div className="text-sm text-muted-foreground">{receipt.userId}</div>
                </TableCell>
                <TableCell>{receipt.invoiceId}</TableCell>
                <TableCell>{receipt.date}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <a href={receipt.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </a>
                  </Button>
                </TableCell>
                <TableCell>
                    {receipt.status === 'Pendente' ? (
                        <Textarea placeholder="Adicione uma justificativa para a recusa aqui..." />
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-500"/>
                            <span>Pagamento confirmado.</span>
                        </div>
                    )}
                </TableCell>
                <TableCell className="text-right">
                  {receipt.status === "Pendente" ? (
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800">
                        <ThumbsUp className="mr-2 h-4 w-4" /> Aceitar
                      </Button>
                      <Button variant="destructive" size="sm">
                        <ThumbsDown className="mr-2 h-4 w-4" /> Negar
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Aprovado</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
