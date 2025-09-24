"use client"

import { File, ListFilter } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Input } from "@/components/ui/input"

const mockAuditLogs = [
  { id: "LOG-001", user: "admin@example.com", ip: "187.55.123.10", action: "Acesso ao painel", timestamp: "2024-05-21 10:00:15" },
  { id: "LOG-002", user: "admin@example.com", ip: "187.55.123.10", action: "Exportou relatório de transações", timestamp: "2024-05-21 10:05:22" },
  { id: "LOG-003", user: "user1@test.com", ip: "200.10.20.30", action: "Alterou senha", timestamp: "2024-05-21 11:30:00" },
  { id: "LOG-004", user: "admin@example.com", ip: "187.55.123.10", action: "Visualizou log de auditoria", timestamp: "2024-05-21 11:35:00" },
]

export default function AuditPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Auditoria e Compliance</CardTitle>
        <CardDescription>
          Logs de acesso e registro de alterações na plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
            <Input placeholder="Filtrar por usuário ou ação..." className="max-w-sm"/>
            <Button variant="outline">Filtrar</Button>
            <Button size="sm" variant="outline" className="h-10 gap-1 ml-auto">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Exportar Log
                </span>
            </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação Realizada</TableHead>
              <TableHead className="hidden md:table-cell">Endereço IP</TableHead>
              <TableHead className="hidden md:table-cell">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAuditLogs.map((log) => (
                <TableRow key={log.id}>
                <TableCell className="font-medium">{log.user}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell className="hidden md:table-cell">{log.ip}</TableCell>
                <TableCell className="hidden md:table-cell">{log.timestamp}</TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Mostrando <strong>1-10</strong> de <strong>1.254</strong> logs
        </div>
      </CardFooter>
    </Card>
  )
}
