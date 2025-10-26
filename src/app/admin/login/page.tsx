
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ShieldAlert } from "lucide-react"
import { getAuth, signInWithEmailAndPassword, setPersistence, browserSessionPersistence } from "firebase/auth";
import { app } from "@/lib/firebase";

export default function AdminLoginPage() {
  const [email, setEmail] = React.useState("byuripaulo@gmail.com")
  const [password, setPassword] = React.useState("password")
  const [error, setError] = React.useState("")
  const [isPending, startTransition] = React.useTransition()
  const router = useRouter()
  const { toast } = useToast()
  const adminEmail = "byuripaulo@gmail.com";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    startTransition(async () => {
      const auth = getAuth(app);
      try {
        await setPersistence(auth, browserSessionPersistence)
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        if (userCredential.user.email === adminEmail) {
          
          // Sync with MongoDB
          const { user } = userCredential;
          await fetch("/api/usuarios/salvar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uidFirebase: user.uid,
              nome: user.displayName || "Admin",
              email: user.email,
              tipo: "administrador",
            }),
          });

          toast({
            title: "Acesso autorizado!",
            description: "Bem-vindo à Área do Administrador.",
          })
          router.replace("/admin/dashboard")
        } else {
          setError("Acesso negado. Este e-mail não tem permissão de administrador.")
          auth.signOut();
        }
      } catch (error: any) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
             setError("Email ou senha incorretos. Tente novamente.")
             break;
          default:
            setError("Ocorreu um erro inesperado. Tente novamente mais tarde.")
            console.error(error);
        }
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
            Esta área é exclusiva para administradores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
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
