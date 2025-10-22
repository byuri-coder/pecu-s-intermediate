
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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


const MessageBubble = ({ msg }: { msg: Message }) => {
    const isMe = msg.sender === 'me';
    
    const handleDownload = (url: string, filename: string) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    
    const renderContent = () => {
        switch(msg.type) {
            case 'text': {
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                if (urlRegex.test(msg.content)) {
                    return (
                        <a href={msg.content} target="_blank" rel="noopener noreferrer" className={cn("underline", isMe ? "hover:text-primary-foreground/80" : "text-primary hover:underline")}>
                            {msg.content}
                        </a>
                    )
                }
                return <p>{msg.content}</p>;
            }
            case 'pdf':
                return (
                    <a href={msg.content} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md border p-2 bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <FileText className="h-6 w-6 text-red-600"/>
                        <span className="font-medium text-sm truncate">{msg.content.split('/').pop()}</span>
                    </a>
                )
            case 'image':
                return (
                     <div className="w-full max-w-xs aspect-video rounded-md overflow-hidden relative group">
                        <Image src={msg.content} alt="Imagem enviada no chat" fill className="object-cover" data-ai-hint="farm field" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                                size="icon" 
                                variant="outline" 
                                className="bg-background/50 hover:bg-background/80"
                                onClick={() => handleDownload(msg.content, 'imagem_chat.png')}
                            >
                                <Download className="h-5 w-5" />
                                <span className="sr-only">Baixar Imagem</span>
                            </Button>
                        </div>
                     </div>
                )
             case 'location':
                return (
                    <div className="flex flex-col items-start gap-2">
                         <div className="flex items-center gap-2 text-sm font-medium">
                            <MapPin className="h-5 w-5"/>
                            Localização Compartilhada
                         </div>
                        <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href={msg.content} target="_blank" rel="noopener noreferrer">
                                Ver no Mapa
                            </Link>
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
         <div
            className={cn(
                'flex items-end gap-2 w-full',
                isMe ? 'justify-end' : 'justify-start'
            )}
            >
            {!isMe && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.avatar} />
                    <AvatarFallback>{'V'}</AvatarFallback>
                </Avatar>
            )}
            <div
                className={cn(
                'rounded-lg p-3 text-sm relative',
                 msg.type === 'image' ? 'w-full max-w-xs p-0' : 'max-w-md',
                isMe
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border'
                )}
            >
                {renderContent()}
                {msg.type !== 'image' && (
                    <p className={cn("text-xs mt-1", isMe ? "text-primary-foreground/70" : "text-muted-foreground/70", isMe ? 'text-right' : 'text-left')}>{msg.timestamp}</p>
                )}
            </div>
            {isMe && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.avatar} />
                    <AvatarFallback>{'Eu'}</AvatarFallback>
                </Avatar>
            )}
        </div>
    )
}


export function NegotiationChat({ messages, onSendMessage, isSending }: { messages: Message[], onSendMessage: (msg: Omit<Message, 'id'|'sender'|'timestamp'|'avatar'>) => void, isSending: boolean }) {
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

  const handleSendMessage = () => {
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
      // In a real app, upload the file to Firebase Storage here and get the URL
      // For this demo, we simulate it. For images, we create a temporary local URL to show a preview.
      // For PDFs, we just use the name as content, as there's no preview.
      const content = fileType === 'image' ? URL.createObjectURL(file) : file.name;
      onSendMessage({ content: content, type: fileType });
      
      // Reset file input
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
    // Opens Google Maps in a new tab for the user to pick a location and copy the URL
    window.open('https://maps.google.com', '_blank', 'noopener,noreferrer');
    toast({
        title: "Escolha e cole o link",
        description: "Escolha a localização no Google Maps, copie o link do navegador e cole na caixa de mensagem.",
    })
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };


  return (
    <>
        <ScrollArea className="flex-1 p-4 border rounded-lg bg-muted/20" ref={scrollAreaRef}>
            <div className="space-y-6">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg}/>
                ))}
                 {messages.length === 0 && (
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
            <Button id="send-message-button" onClick={handleSendMessage} disabled={isSending || newMessage.trim() === ''}>
              {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
        </div>
    </>
  );
}
