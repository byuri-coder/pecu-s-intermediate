"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ShieldAlert } from "lucide-react"

// Senha para o protótipo. Em um app real, isso deve ser mais seguro.
const ADMIN_PASSWORD = "admin"

export default function AdminLoginPage() {
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [isPending, startTransition] = React.useTransition()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    startTransition(() => {
      if (password === ADMIN_PASSWORD) {
        toast({
          title: "Acesso autorizado!",
          description: "Bem-vindo à Área do Administrador.",
        })
        // Em um app real, um token JWT ou sessão segura seria usado.
        // Para prototipagem, sessionStorage é suficiente.
        sessionStorage.setItem("adminAuthenticated", "true")
        router.replace("/admin/dashboard")
      } else {
        setError("Senha incorreta. Tente novamente.")
      }
    })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                <ShieldAlert className="h-8 w-8" />
            </div>
          <CardTitle>Acesso Restrito</CardTitle>
          <CardDescription>
            Esta área é exclusiva para administradores. Por favor, insira a senha de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha de Administrador</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Verificando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
