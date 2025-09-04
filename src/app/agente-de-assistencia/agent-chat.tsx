'use client';

import * as React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, Loader2, Send, User, Sparkles, FileText, DollarSign, Bookmark, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { askFinancialAgent } from './actions';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const chatSchema = z.object({
  message: z.string().min(1, 'A mensagem não pode estar vazia.'),
});

type ChatFormValues = z.infer<typeof chatSchema>;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AgentChat() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatSchema),
    defaultValues: { message: '' },
  });

  const onSubmit: SubmitHandler<ChatFormValues> = (data) => {
    const userMessage: Message = { role: 'user', content: data.message };
    setMessages((prev) => [...prev, userMessage]);
    form.reset();

    startTransition(async () => {
      const result = await askFinancialAgent(data.message);
      if (result.answer) {
        const assistantMessage: Message = { role: 'assistant', content: result.answer };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Desculpe, não consegui processar sua solicitação. Tente novamente.',
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    });
  };

  return (
    <TooltipProvider>
        <div className="flex flex-col h-[60vh] space-y-4">
            <ScrollArea className="flex-1 p-4 border rounded-lg bg-muted/20">
                <div className="space-y-6">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground pt-10">
                        <Sparkles className="mx-auto h-12 w-12 text-primary/50" />
                        <p className="mt-4 font-semibold">Como posso te ajudar hoje?</p>
                        <p className="text-xs">Ex: "Qual o montante de juros compostos para um principal de R$1000 a 1% ao mês por 12 meses?"</p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={cn(
                            'flex items-start gap-3 group',
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        {msg.role === 'assistant' && (
                            <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground"><Sparkles className="h-5 w-5" /></AvatarFallback>
                            </Avatar>
                        )}
                        <div
                            className={cn(
                            'max-w-xs md:max-w-md lg:max-w-xl rounded-lg p-3 text-sm whitespace-pre-wrap relative',
                            msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-background border'
                            )}
                        >
                            {msg.content}
                             {msg.role === 'assistant' && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                         <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Bookmark className="h-4 w-4" />
                                         </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Salvar conversa</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                        {msg.role === 'user' && (
                            <Avatar className="h-8 w-8">
                            <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
                {isPending && (
                    <div className="flex items-start gap-3 justify-start">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground"><Sparkles className="h-5 w-5" /></AvatarFallback>
                        </Avatar>
                        <div className="bg-background border rounded-lg p-3 flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Pensando...</span>
                        </div>
                    </div>
                )}
                </div>
            </ScrollArea>
            <div className="p-2 border rounded-lg focus-within:ring-2 focus-within:ring-ring">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" disabled={isPending}>
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Ver conversas salvas</p></TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" disabled={isPending}>
                                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Modelos de Economia</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" disabled={isPending}>
                                    <Landmark className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Modelos Tributários</p></TooltipContent>
                        </Tooltip>
                        
                        <FormField
                            name="message"
                            control={form.control}
                            render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Digite sua pergunta financeira ou tributária aqui..."
                                    autoComplete="off"
                                    disabled={isPending}
                                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                                </FormControl>
                                <FormMessage className="pl-2"/>
                            </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isPending} size="icon">
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Enviar</span>
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    </TooltipProvider>
  );
}
