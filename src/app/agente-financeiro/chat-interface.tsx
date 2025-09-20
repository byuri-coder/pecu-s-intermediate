'use client';

import { useState, useRef, useTransition, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { getFinancialAnalysis } from './actions';
import Markdown from 'react-markdown';
import { Card } from '@/components/ui/card';

type Message = {
    sender: 'user' | 'bot';
    text: string;
};

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isPending, startTransition] = useTransition();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    };
    
    useEffect(() => {
       scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isPending) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        
        startTransition(async () => {
            setMessages((prev) => [...prev, { sender: 'bot', text: '...' }]); // Placeholder for bot response
            const result = await getFinancialAnalysis(input);
            setMessages((prev) => {
                const newMessages = [...prev];
                const botMessageIndex = newMessages.findIndex(m => m.text === '...');
                if (botMessageIndex !== -1) {
                    newMessages[botMessageIndex].text = result.success ? result.analysis : result.error || 'Ocorreu um erro.';
                }
                return newMessages;
            });
        });
    };

    return (
        <Card className="flex flex-col h-[70vh] w-full max-w-4xl mx-auto">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-6">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex items-start gap-4 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                            {message.sender === 'bot' && (
                                <Avatar className="h-9 w-9 border-2 border-primary/50">
                                    <AvatarFallback><Bot /></AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`rounded-lg p-3 max-w-lg ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                {message.sender === 'bot' && message.text === '...' ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin"/>
                                        <span>Analisando...</span>
                                    </div>
                                ) : (
                                    <div className="prose prose-sm max-w-none">
                                        <Markdown>{message.text}</Markdown>
                                    </div>
                                )}
                            </div>
                             {message.sender === 'user' && (
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback><User /></AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Pergunte sobre créditos tributários, investimentos, impostos..."
                        disabled={isPending}
                    />
                    <Button type="submit" disabled={!input.trim() || isPending}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span className="sr-only">Enviar</span>
                    </Button>
                </form>
                 <p className="text-xs text-muted-foreground mt-2 text-center">
                    O Agente Financeiro pode cometer erros. Verifique as informações importantes.
                </p>
            </div>
        </Card>
    );
}
