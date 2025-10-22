
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download, MapPin, Send, Paperclip, LocateFixed, Map, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input';
import type { Message } from '@/lib/types';
import { MessageBubble } from './message-bubble';


export function NegotiationChat({ messages, onSendMessage, isSending, isLoading }: { messages: Message[], onSendMessage: (msg: Omit<Message, 'id'|'sender'|'timestamp'|'avatar'>) => void, isSending: boolean, isLoading: boolean }) {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [newMessage, setNewMessage] = React.useState('');
  
  // Auto-scroll to bottom
  React.useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
             setTimeout(() => viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' }), 100);
        }
    }
  }, [messages.length]);

  const handleTextSend = () => {
    const messageContent = newMessage.trim();
    if (messageContent === '' || isSending) return;

    const isGoogleMapsUrl = /^(https?:\/\/)?(www\.)?(google\.com\/maps|maps\.app\.goo\.gl)\/.+/.test(messageContent);
    const messageType = isGoogleMapsUrl ? 'location' : 'text';

    onSendMessage({ content: messageContent, type: messageType });
    setNewMessage('');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      
      if (file.size > 10 * 1024 * 1024) { // 10 MB limit
          toast({
              title: "Arquivo muito grande",
              description: "Por favor, selecione um arquivo com menos de 10MB.",
              variant: "destructive"
          });
          return;
      }
      
      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
      const content = URL.createObjectURL(file); // In a real app, upload file to storage and get URL
      onSendMessage({ content: content, type: fileType });
      
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSendCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocalização não suportada",
        description: "Seu navegador não permite o compartilhamento de localização.",
        variant: "destructive"
      });
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        onSendMessage({ content: url, type: 'location' });
      },
      (error) => {
        toast({
            title: "Erro ao obter localização",
            description: "Não foi possível obter sua localização. Verifique as permissões do seu navegador.",
            variant: "destructive"
        });
      }
    );
  };
  
  const handleChooseOnMap = () => {
    window.open('https://maps.google.com', '_blank', 'noopener,noreferrer');
    toast({
        title: "Escolha e cole o link",
        description: "Escolha a localização no Google Maps, copie o link do navegador e cole na caixa de mensagem.",
    })
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleTextSend();
    }
  };


  return (
    <>
        <ScrollArea className="flex-1 p-4 border rounded-lg bg-muted/20" ref={scrollAreaRef}>
            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : messages.length > 0 ? (
                    messages.map((msg) => (
                        <MessageBubble key={msg.id} msg={msg}/>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>Nenhuma mensagem ainda. Envie a primeira!</p>
                    </div>
                )}
            </div>
        </ScrollArea>
        <div className="mt-4 flex items-center gap-2">
            <Input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,application/pdf"
            />
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isSending}>
                        <Paperclip className="h-5 w-5" />
                        <span className="sr-only">Anexar arquivo</span>
                    </Button>
                </DropdownMenuTrigger>
                 <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                        <Paperclip className="mr-2 h-4 w-4"/>
                        Imagem ou Documento (PDF)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSendCurrentLocation}>
                        <LocateFixed className="mr-2 h-4 w-4"/>
                        Minha Localização Atual
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleChooseOnMap}>
                        <Map className="mr-2 h-4 w-4"/>
                        Escolher no Mapa e Colar Link
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Input 
                placeholder="Digite sua mensagem..." 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
             />
            <Button id="send-message-button" onClick={handleTextSend} disabled={isSending || newMessage.trim() === ''}>
              {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
        </div>
    </>
  );
}
