
'use client';

import * as React from 'react';
import type { User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Paperclip, LocateFixed, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './message-bubble';
import type { Message } from '@/lib/types';

interface ChatRoomProps {
    chatId: string;
    currentUser: User;
    receiverId: string;
}

// In a real application, you would upload to a service like Firebase Storage
// and get a URL back. For this simulation, we'll convert the file to a base64 Data URL.
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});


export function ChatRoom({ chatId, currentUser, receiverId }: ChatRoomProps) {
    const { toast } = useToast();
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [newMessage, setNewMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSending, setIsSending] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = React.useState(true);


    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const target = event.currentTarget;
        const atBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50; 
        setAutoScroll(atBottom);
    };

    React.useEffect(() => {
        if (autoScroll && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, autoScroll]);

    React.useEffect(() => {
        let isMounted = true;
        let intervalId: NodeJS.Timeout;

        const fetchMessages = async () => {
            if (!isMounted) return;
            try {
                const response = await fetch(`/api/messages?chatId=${chatId}`);
                if (!response.ok) throw new Error('Failed to fetch messages');
                
                const data = await response.json();

                if (isMounted && data.ok) {
                    const newMessages: Message[] = data.messages.map((msg: any) => ({
                        id: msg._id,
                        senderId: msg.senderId,
                        content: msg.text || msg.fileUrl || (msg.location ? `https://www.google.com/maps?q=${msg.location.latitude},${msg.location.longitude}` : 'Conteúdo inválido'),
                        type: msg.type,
                        timestamp: new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                        user: msg.user || { name: 'Desconhecido' }
                    }));
                    setMessages(newMessages);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
                if (isMounted) toast({ title: "Erro ao carregar mensagens.", variant: "destructive" });
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchMessages();
        intervalId = setInterval(fetchMessages, 3000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [chatId, currentUser.uid, toast]);


    const handleSendMessage = async (msg: Omit<Message, 'id' | 'timestamp' | 'senderId' | 'user'> & { type: Message['type'], content: string}) => {
        if (!receiverId) {
            toast({ title: "Erro", description: "Não foi possível identificar o destinatário.", variant: "destructive" });
            return;
        }
        setIsSending(true);

        const payload: any = {
            chatId: chatId,
            senderId: currentUser.uid,
            receiverId: receiverId,
            type: msg.type,
        };
        
        if (msg.type === 'text') payload.text = msg.content;
        else if (msg.type === 'image' || msg.type === 'pdf') {
            payload.fileUrl = msg.content; // The content is the base64 URL
            payload.fileName = msg.content.split('/').pop();
            payload.fileType = msg.type;
        } else if (msg.type === 'location') {
            const [lat, lng] = msg.content.split('?q=')[1].split(',');
            payload.location = { latitude: parseFloat(lat), longitude: parseFloat(lng) };
        }

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const sentMessage = await response.json();
            if(!response.ok) throw new Error(sentMessage.error || "Failed to send message");

            setAutoScroll(true);

            // The API now returns the fully populated message object
            const optimisticMessage: Message = {
                id: sentMessage.message._id,
                senderId: sentMessage.message.senderId,
                content: sentMessage.message.text || sentMessage.message.fileUrl,
                type: sentMessage.message.type,
                timestamp: new Date(sentMessage.message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                user: sentMessage.message.user
            };
            
            setMessages(prev => [...prev, optimisticMessage]);
            setNewMessage('');
        } catch(error: any) {
            console.error("Error sending message:", error);
            toast({ title: "Erro ao Enviar", description: error.message || "Não foi possível enviar a sua mensagem.", variant: "destructive" });
        } finally {
            setIsSending(false);
        }
    };
    
    const handleTextSend = () => {
        const messageContent = newMessage.trim();
        if (messageContent === '' || isSending) return;

        const isGoogleMapsUrl = /^(https?:\/\/)?(www\.)?(google\.com\/maps|maps\.app\.goo\.gl)\/.+/.test(messageContent);
        const messageType = isGoogleMapsUrl ? 'location' : 'text';

        handleSendMessage({ content: messageContent, type: messageType });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            if (file.size > 10 * 1024 * 1024) { // 10 MB limit
                toast({ title: "Arquivo muito grande", description: "Por favor, selecione um arquivo com menos de 10MB.", variant: "destructive" });
                return;
            }
            try {
                const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
                const base64Content = await toBase64(file);
                handleSendMessage({ content: base64Content, type: fileType });
            } catch (error) {
                toast({ title: "Erro ao processar arquivo", description: "Não foi possível ler o arquivo selecionado.", variant: "destructive" });
            }
            
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSendCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast({ title: "Geolocalização não suportada", variant: "destructive" });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
                handleSendMessage({ content: url, type: 'location' });
            },
            () => toast({ title: "Erro ao obter localização", variant: "destructive" })
        );
    };

    const handleChooseOnMap = () => {
        window.open('https://maps.google.com', '_blank', 'noopener,noreferrer');
        toast({ title: "Escolha e cole o link", description: "Copie o link do mapa e cole na caixa de mensagem." });
    };

    return (
        <>
            <ScrollArea className="flex-1 p-4 border rounded-lg bg-muted/20" onScroll={handleScroll} ref={scrollAreaRef}>
                <div className="space-y-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : messages.length > 0 ? (
                        messages.map((msg) => <MessageBubble key={msg.id} msg={msg} currentUserId={currentUser.uid} />)
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>Nenhuma mensagem ainda. Envie a primeira!</p>
                        </div>
                    )}
                </div>
                <div ref={messagesEndRef} />
            </ScrollArea>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleTextSend();
                }}
                className="mt-4 flex items-center gap-2"
            >
                <Input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/jpeg,image/png,application/pdf" />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" disabled={isSending}>
                            <Paperclip className="h-5 w-5" />
                            <span className="sr-only">Anexar</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                            <Paperclip className="mr-2 h-4 w-4"/> Imagem ou Documento (PDF)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSendCurrentLocation}>
                            <LocateFixed className="mr-2 h-4 w-4"/> Minha Localização Atual
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleChooseOnMap}>
                            <Map className="mr-2 h-4 w-4"/> Escolher no Mapa e Colar Link
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Input 
                    placeholder="Digite sua mensagem..." 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)}
                    onFocus={(e) => e.stopPropagation()} 
                    disabled={isSending}
                />
                <Button type="submit" id="send-message-button" disabled={isSending || newMessage.trim() === ''}>
                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
            </form>
        </>
    );
}
