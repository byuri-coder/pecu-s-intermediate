
"use client";

import * as React from "react";
import { useState } from "react";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Share2, UploadCloud, File, Trash2, KeyRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";

const crmOptions = [
  { value: "externo", label: "CRM Externo" },
  { value: "interno", label: "CRM Interno" },
];

export default function ConectarCRMPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [crm, setCRM] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [accountId, setAccountId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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
        body: JSON.stringify({ userId: user.uid, crm, apiKey, accountId, integrationType: 'api' }),
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
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        toast({ title: "Arquivo muito grande", description: "O arquivo não pode exceder 20MB.", variant: "destructive" });
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadedFile || !user) {
         toast({ title: "Nenhum arquivo selecionado", description: "Por favor, selecione um arquivo para importar.", variant: "destructive" });
        return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('userId', user.uid);
    formData.append('integrationType', 'file');

    try {
        const res = await fetch("/api/crm/conectar", {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Falha ao processar o arquivo.");
        
        toast({ title: "Sucesso!", description: data.message });
        setUploadedFile(null);
    } catch (error: any) {
        toast({ title: "Erro na Importação", description: error.message, variant: "destructive" });
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Share2 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold font-headline">Conectar CRM</CardTitle>
              <CardDescription>
                Sincronize seus ativos e negociações com sua plataforma de CRM.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="api">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="api"><KeyRound className="mr-2 h-4 w-4"/>Via Chave de API</TabsTrigger>
                    <TabsTrigger value="file"><UploadCloud className="mr-2 h-4 w-4"/>Via Exportação de Arquivo</TabsTrigger>
                </TabsList>
                <TabsContent value="api" className="pt-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="crm-select">Selecione o CRM</Label>
                            <Combobox
                              options={crmOptions}
                              value={crm}
                              onSelect={setCRM}
                              placeholder="Selecione um CRM..."
                              searchPlaceholder="Pesquisar CRM..."
                              notFoundMessage="Nenhum CRM encontrado."
                            />
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
                            {isConnecting ? "Conectando..." : "Conectar via API"}
                        </Button>
                    </div>
                </TabsContent>
                <TabsContent value="file" className="pt-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                             <Label>Arquivo de Exportação</Label>
                             <CardDescription>Exporte seus dados em formato CSV, XLSX ou JSON do seu CRM e faça o upload aqui.</CardDescription>
                             {!uploadedFile ? (
                                <div onClick={() => document.getElementById('file-input')?.click()} className="mt-2 border-2 border-dashed p-12 text-center cursor-pointer hover:bg-secondary">
                                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <p className="text-sm">Clique ou arraste para adicionar o arquivo</p>
                                    <Input id="file-input" type="file" className="hidden" accept=".csv,.xlsx,.json,.xml" onChange={handleFileChange} />
                                </div>
                            ) : (
                                <div className="mt-2 flex justify-between items-center text-sm p-3 bg-muted rounded-md border">
                                    <div className='flex items-center gap-2'>
                                        <File className="h-5 w-5"/>
                                        <span>{uploadedFile.name}</span>
                                    </div>
                                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => setUploadedFile(null)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            )}
                        </div>

                        <Button onClick={handleFileUpload} className="w-full" disabled={isUploading || !uploadedFile}>
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isUploading ? "Processando..." : "Importar Arquivo"}
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
