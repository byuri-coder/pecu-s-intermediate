"use client"

import { File, ListFilter, MoreHorizontal, PlusCircle, UploadCloud } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "../../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "../../../components/ui/input"

const mockInvoices = [
  { id: "NF-001", user: "Empresa A", value: 150.00, date: "2024-05-01", status: "Emitida", xmlUrl: "#", pdfUrl: "#" },
  { id: "NF-002", user: "Empresa B", value: 50.00, date: "2024-05-02", status: "Pendente", xmlUrl: "#", pdfUrl: "#" },
  { id: "NF-003", user: "Empresa C", value: 1200.00, date: "2024-05-03", status: "Cancelada", xmlUrl: "#", pdfUrl: "#" },
]


export default function InvoicesPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Controle Fiscal (NF-e/NFS-e)</CardTitle>
                <CardDescription>
                Gerencie e armazene as notas fiscais da plataforma.
                </CardDescription>
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button size="sm" className="h-8 gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Adicionar Nota Fiscal
                        </span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adicionar Nota Fiscal Manualmente</DialogTitle>
                        <DialogDescription>
                            Faça o upload dos arquivos XML e PDF da nota fiscal.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input placeholder="CNPJ do Tomador" />
                        <Input type="number" placeholder="Valor da Nota" />
                         <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 text-center cursor-pointer hover:bg-secondary transition-colors">
                            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-sm text-muted-foreground">Arraste ou clique para fazer upload do XML e PDF</p>
                            <Input type="file" className="hidden" multiple />
                        </div>
                    </div>
                    <Button>Salvar Nota Fiscal</Button>
                </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Tomador</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">
                Valor
              </TableHead>
              <TableHead className="hidden md:table-cell">
                Data Emissão
              </TableHead>
              <TableHead>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockInvoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell>{invoice.user}</TableCell>
              <TableCell>
                <Badge variant={invoice.status === "Emitida" ? "default" : "secondary"}>
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.value)}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {invoice.date}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-haspopup="true"
                      size="icon"
                      variant="ghost"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem>Baixar PDF</DropdownMenuItem>
                    <DropdownMenuItem>Baixar XML</DropdownMenuItem>
                    <DropdownMenuItem>Cancelar Nota</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Mostrando <strong>1-10</strong> de <strong>15</strong> notas
        </div>
      </CardFooter>
    </Card>
  )
}
