
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export interface Message {
  id: string;
  sender: 'me' | 'other';
  content: string;
  type: 'text' | 'image' | 'pdf';
  timestamp: string;
  avatar: string;
}

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
                'rounded-lg p-3 text-sm relative',
                 msg.type === 'image' ? 'max-w-xl' : 'max-w-md',
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


export function NegotiationChat({ messages }: { messages: Message[] }) {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom
  React.useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
             setTimeout(() => viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' }), 100);
        }
    }
  }, [messages.length]);

  return (
    <>
        <ScrollArea className="flex-1 p-4 border rounded-lg bg-muted/20" ref={scrollAreaRef}>
            <div className="space-y-6">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg}/>
                ))}
            </div>
        </ScrollArea>
    </>
  );
}
