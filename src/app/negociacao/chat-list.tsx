
'use client';

import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePersistentState } from './use-persistent-state';

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  type: string;
}

export function ChatList({ conversations }: { conversations: Conversation[] }) {
  const pathname = usePathname();

  if (conversations.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Nenhuma conversa encontrada.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <ScrollArea className="h-full">
        <div className="flex flex-col">
          {conversations.map((convo) => {
            const isActive = pathname?.includes(convo.id) ?? false;
            return (
              <Link key={convo.id} href={`/negociacao/${convo.id}?type=${convo.type}`} className="block">
                <div
                  className={cn(
                    'flex items-center gap-4 p-4 cursor-pointer border-b',
                    isActive ? 'bg-primary/10' : 'hover:bg-secondary/50'
                  )}
                >
                  <Avatar className={cn("h-12 w-12 border-2", isActive ? 'border-primary' : 'border-transparent')}>
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
