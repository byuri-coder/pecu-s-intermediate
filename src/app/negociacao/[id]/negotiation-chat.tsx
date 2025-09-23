
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: string;
  sender: 'me' | 'other';
  content: string;
  type: 'text' | 'image' | 'pdf';
  timestamp: string;
  avatar: string;
}

// Placeholder data for the chat
const messages: Message[] = [
  { id: '1', sender: 'other', content: 'Olá! Vi que você tem interesse no meu crédito de carbono. Qual a sua proposta inicial?', type: 'text', timestamp: '10:30', avatar: 'https://picsum.photos/seed/avatar2/40/40' },
  { id: '2', sender: 'me', content: 'Olá! Gostaria de oferecer R$ 14,50 por crédito, para um lote de 2.000 unidades.', type: 'text', timestamp: '10:32', avatar: 'https://picsum.photos/seed/avatar1/40/40' },
  { id: '3', sender: 'other', content: 'Agradeço a proposta. Podemos fechar em R$ 15,00? Anexei a documentação de validação do projeto para sua análise.', type: 'text', timestamp: '10:35', avatar: 'https://picsum.photos/seed/avatar2/40/40' },
  { id: '4', sender: 'other', content: 'validacao-verra-proj-amazon.pdf', type: 'pdf', timestamp: '10:35', avatar: 'https://picsum.photos/seed/avatar2/40/40' },
  { id: '5', sender: 'me', content: 'Entendido. Vou analisar a documentação. Acredito que R$15,00 seja um valor justo. Segue uma imagem da nossa fazenda para referência de outro projeto nosso.', type: 'text', timestamp: '10:40', avatar: 'https://picsum.photos/seed/avatar1/40/40' },
  { id: '6', sender: 'me', content: 'https://picsum.photos/seed/farm-pic/400/300', type: 'image', timestamp: '10:41', avatar: 'https://picsum.photos/seed/avatar1/40/40' },
];

const MessageBubble = ({ msg }: { msg: Message }) => {
    const isMe = msg.sender === 'me';
    
    const renderContent = () => {
        switch(msg.type) {
            case 'text':
                return <p>{msg.content}</p>;
            case 'pdf':
                return (
                    <a href="#" className="flex items-center gap-2 rounded-md border p-2 bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <FileText className="h-6 w-6 text-red-600"/>
                        <span className="font-medium text-sm truncate">{msg.content}</span>
                    </a>
                )
            case 'image':
                return (
                     <div className="w-full aspect-video rounded-md overflow-hidden relative">
                        <Image src={msg.content} alt="Imagem enviada no chat" fill className="object-cover" data-ai-hint="farm field" />
                     </div>
                )
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
                    <AvatarFallback>{msg.sender.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            )}
            <div
                className={cn(
                'max-w-md rounded-lg p-3 text-sm relative',
                isMe
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border'
                )}
            >
                {renderContent()}
                <p className={cn("text-xs mt-1", isMe ? "text-primary-foreground/70" : "text-muted-foreground/70", isMe ? 'text-right' : 'text-left')}>{msg.timestamp}</p>
            </div>
            {isMe && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.avatar} />
                    <AvatarFallback>{msg.sender.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            )}
        </div>
    )
}


export function NegotiationChat() {

  return (
    <ScrollArea className="flex-1 p-4 border rounded-lg bg-muted/20">
        <div className="space-y-6">
            {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg}/>
            ))}
        </div>
    </ScrollArea>
  );
}
