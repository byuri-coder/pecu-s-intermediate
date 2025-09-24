
'use client';

import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

// Placeholder data for chat conversations
const conversations = [
  {
    id: 'proj-amazon-reforestation',
    type: 'carbon-credit',
    avatar: 'https://picsum.photos/seed/avatar2/40/40',
    name: 'Florestas Renovadas Ltda.',
    lastMessage: 'Agradeço a proposta. Podemos fechar em R$ 15,00?',
    time: '10:35',
    unread: 1,
  },
  {
    id: 'tax-icms-01',
    type: 'tax-credit',
    avatar: 'https://picsum.photos/seed/avatar3/40/40',
    name: 'Varejista Paulista S.A.',
    lastMessage: 'Perfeito, vou preparar a minuta do contrato.',
    time: 'Ontem',
    unread: 0,
  },
   {
    id: 'land-004',
    type: 'rural-land',
    avatar: 'https://picsum.photos/seed/avatar4/40/40',
    name: 'Carlos Pereira Investimentos',
    lastMessage: 'Recebi a documentação dos seus imóveis, estou analisando.',
    time: 'Terça-feira',
    unread: 2,
  },
   {
    id: 'tax-ipi-03',
    type: 'tax-credit',
    avatar: 'https://picsum.photos/seed/avatar5/40/40',
    name: 'Importadora Geral Ltda.',
    lastMessage: 'Ok, aguardo seu retorno.',
    time: '29/04/24',
    unread: 0,
  },
];

function getAssetTypeQueryParam(type: string) {
    switch(type) {
        case 'carbon-credit': return 'carbon-credit';
        case 'tax-credit': return 'tax-credit';
        case 'rural-land': return 'rural-land';
        default: return 'carbon-credit';
    }
}


export function ChatList() {
  const pathname = usePathname();

  return (
    <Card className="h-full">
      <ScrollArea className="h-full">
        <div className="flex flex-col">
          {conversations.map((convo) => {
            const isActive = pathname.includes(convo.id);
            return (
              <Link key={convo.id} href={`/negociacao/${convo.id}?type=${getAssetTypeQueryParam(convo.type)}`} className="block">
                <div
                  className={cn(
                    'flex items-center gap-4 p-4 cursor-pointer border-b',
                    isActive ? 'bg-primary/10' : 'hover:bg-secondary/50'
                  )}
                >
                  <Avatar className="h-12 w-12 border-2', isActive ? 'border-primary' : 'border-transparent'">
                    <AvatarImage src={convo.avatar} />
                    <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center gap-2">
                        <p className="font-semibold truncate flex-1">{convo.name}</p>
                        <p className={cn("text-xs flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground")}>{convo.time}</p>
                    </div>
                     <div className="flex justify-between items-start mt-1 gap-2">
                        <p className="text-sm text-muted-foreground truncate flex-1">{convo.lastMessage}</p>
                        {convo.unread > 0 && (
                            <span className="flex items-center justify-center bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex-shrink-0">
                                {convo.unread}
                            </span>
                        )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
