
"use client"

import * as React from "react"
import { File } from "lucide-react"

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

export default function AuditPage() {
    const [logs, setLogs] = React.useState<any[]>([]);

    React.useEffect(() => {
        async function fetchAuditLogs() {
            try {
                const response = await fetch('/api/admin/audit');
                const data = await response.json();
                if (data.ok) {
                    setLogs(data.logs);
                }
            } catch (error) {
                console.error("Failed to fetch audit logs", error);
            }
        }
        fetchAuditLogs();
    }, []);

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
            {logs.length > 0 ? logs.map((log) => (
                <TableRow key={log._id}>
                <TableCell className="font-medium">{log.user?.nome || log.userId}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell className="hidden md:table-cell">{log.ipAddress}</TableCell>
                <TableCell className="hidden md:table-cell">{new Date(log.createdAt).toLocaleString()}</TableCell>
                </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">Nenhum log encontrado.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Mostrando <strong>{logs.length}</strong> de <strong>{logs.length}</strong> logs
        </div>
      </CardFooter>
    </Card>
  )
}
