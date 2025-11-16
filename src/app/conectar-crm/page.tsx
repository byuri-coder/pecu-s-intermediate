
"use client";

import * as React from "react";
import { useState } from "react";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2, Share2 } from "lucide-react";

export default function ConectarCRMPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [crm, setCRM] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [accountId, setAccountId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  async function handleConnect() {
    if (!user) {
      toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" });
      return;
    }
    if (!crm || !apiKey) {
      toast({ title: "Campos obrigatórios", description: "Por favor, selecione um CRM e insira a API Key.", variant: "destructive" });
      return;
    }
    setIsConnecting(true);
    try {
      const res = await fetch("/api/crm/conectar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, crm, apiKey, accountId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao conectar com o CRM.");
      }
      toast({ title: "Sucesso!", description: data.message });
    } catch (error: any) {
      toast({ title: "Erro na Conexão", description: error.message, variant: "destructive" });
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Share2 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold font-headline">Conectar seu CRM</CardTitle>
              <CardDescription>
                Sincronize seus ativos e negociações automaticamente com seu CRM de preferência.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="crm-select">Selecione o CRM</Label>
            <Select value={crm} onValueChange={setCRM}>
              <SelectTrigger id="crm-select">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="externo">CRM Externo</SelectItem>
                <SelectItem value="interno">CRM Interno</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Cole sua chave de API aqui"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-id">ID da Conta / Empresa (Opcional)</Label>
            <Input
              id="account-id"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="ID da sua conta no CRM, se aplicável"
            />
          </div>

          <Button onClick={handleConnect} className="w-full" disabled={isConnecting}>
            {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isConnecting ? "Conectando..." : "Conectar CRM"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
