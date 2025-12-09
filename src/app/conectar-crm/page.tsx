
"use client";

import * as React from "react";
import { useState, useRef } from "react";
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

const MAX_FILES = 5;

export default function ConectarCRMPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [crm, setCRM] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [accountId, setAccountId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      
      if (uploadedFiles.length + newFiles.length > MAX_FILES) {
        toast({ title: "Limite excedido", description: `Você pode enviar no máximo ${MAX_FILES} arquivos por vez.`, variant: "destructive" });
        return;
      }
      
      const validFiles = newFiles.filter(file => {
          if (file.size > 20 * 1024 * 1024) { // 20MB limit per file
            toast({ title: "Arquivo muito grande", description: `O arquivo ${file.name} excede o limite de 20MB.`, variant: "destructive" });
            return false;
          }
          return true;
      });

      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = async () => {
    if (!user) {
         toast({ title: "Erro de autenticação", description: "Por favor, faça login para continuar.", variant: "destructive" });
        return;
    }
    if (uploadedFiles.length === 0) {
         toast({ title: "Nenhum arquivo selecionado", description: "Por favor, selecione um ou mais arquivos para importar.", variant: "destructive" });
        return;
    }
    setIsUploading(true);
    
    const formData = new FormData();
    for (const file of uploadedFiles) {
        if (!(file instanceof Blob)) {
            console.warn("Item inválido ignorado:", file);
            continue;
        }
        formData.append('file', file);
    }
    formData.append('userId', user.uid);
    formData.append('integrationType', 'file-batch');

    try {
        const res = await fetch("/api/crm/conectar", {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Falha ao processar o lote de arquivos.`);
        
        toast({ title: "Sucesso!", description: `${data.registrosSalvos} registros importados de ${uploadedFiles.length} arquivo(s).` });
    } catch (error: any) {
        toast({ title: `Erro no Lote de Arquivos`, description: error.message, variant: "destructive" });
    }
    
    setUploadedFiles([]);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    setIsUploading(false);
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
                             <Label>Arquivos de Exportação</Label>
                             <CardDescription>Exporte seus dados em formato CSV, XLSX ou JSON do seu CRM e faça o upload aqui (máx. 5 arquivos).</CardDescription>
                             <div onClick={() => fileInputRef.current?.click()} className="mt-2 border-2 border-dashed p-12 text-center cursor-pointer hover:bg-secondary">
                                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="text-sm">Clique ou arraste para adicionar arquivos</p>
                                <Input 
                                  ref={fileInputRef} 
                                  id="file-input" 
                                  type="file"
                                  name="file"
                                  className="hidden" 
                                  accept=".csv,.xlsx,.json,.xml" 
                                  onChange={handleFileChange} 
                                  multiple 
                                />
                            </div>

                            {uploadedFiles.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    <Label>Arquivos selecionados:</Label>
                                    <div className="space-y-1">
                                    {uploadedFiles.map((file, index) => (
                                        <div key={index} className="flex justify-between items-center text-sm p-2 bg-muted rounded-md border">
                                            <div className='flex items-center gap-2 overflow-hidden'>
                                                <File className="h-5 w-5 flex-shrink-0"/>
                                                <span className="truncate">{file.name}</span>
                                            </div>
                                            <Button type="button" size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0" onClick={() => removeFile(index)}><Trash2 className="h-4 w-4"/></Button>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button onClick={handleFileUpload} className="w-full" disabled={isUploading || uploadedFiles.length === 0}>
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isUploading ? "Processando..." : `Importar ${uploadedFiles.length > 0 ? uploadedFiles.length : ''} Arquivo(s)`}
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
