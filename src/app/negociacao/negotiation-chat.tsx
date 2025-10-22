
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download, MapPin } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Message } from '@/lib/types';
import { usePersistentState } from './use-persistent-state';

export function NegotiationChat({ chatId }: { chatId: string }) {
  const [messages, setMessages] = usePersistentState<Message[]>(`chat-${chatId}`, []);
  const [input, setInput] = React.useState('');
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  // Fetch initial messages
  React.useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?chatId=${chatId}`);
        if (response.ok) {
          const data = await response.json();
          // To avoid duplicates with persistent state, we can merge them
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newMessages = data.filter((m: Message) => !existingIds.has(m.id));
            return [...prev, ...newMessages];
          });
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };
    fetchMessages();
  }, [chatId, setMessages]);
  
  // Auto-scroll to bottom
  React.useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
             setTimeout(() => viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' }), 100);
        }
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessage: Message = { 
        id: `msg-${Date.now()}`,
        sender: 'me', 
        content: input, 
        type: 'text',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'})
    };
    setMessages(prev => [...prev, newMessage]);
    setInput('');

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message: newMessage }),
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };


  return (
    <div className="flex flex-col h-full">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={cn(
                            'flex items-end gap-2 w-full',
                            msg.sender === 'me' ? 'justify-end' : 'justify-start'
                        )}
                        >
                        {msg.sender !== 'me' && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{'V'}</AvatarFallback>
                            </Avatar>
                        )}
                        <div
                            className={cn(
                            'rounded-lg p-3 text-sm max-w-md',
                            msg.sender === 'me'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-background border'
                            )}
                        >
                            <p>{msg.content}</p>
                            <p className={cn("text-xs mt-1", msg.sender === 'me' ? "text-primary-foreground/70" : "text-muted-foreground/70", msg.sender === 'me' ? 'text-right' : 'text-left')}>{msg.timestamp}</p>
                        </div>
                        {msg.sender === 'me' && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{'Eu'}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>Nenhuma mensagem ainda. Envie a primeira!</p>
                    </div>
                )}
            </div>
        </ScrollArea>
         <div className="flex items-center p-4 border-t">
            <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="flex-1 border rounded-md px-3 py-2 mr-2"
            />
            <Button
            onClick={handleSend}
            >
            Enviar
            </Button>
        </div>
    </div>
  );
}
