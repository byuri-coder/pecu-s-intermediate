
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Leaf, Landmark, Mountain } from 'lucide-react';
import type { Conversation, AssetType } from '@/lib/types';
import { useRouter, useSearchParams } from 'next/navigation';

const AssetTypeIcon = ({ type }: { type: AssetType }) => {
    const iconMap = {
        'carbon-credit': Leaf,
        'tax-credit': Landmark,
        'rural-land': Mountain,
    };
    const Icon = iconMap[type];
    return <Icon className="h-4 w-4 text-muted-foreground" />;
};


export function ChatList({ conversations, activeChatId }: { conversations: Conversation[], activeChatId: string | null }) {
  const router = useRouter();

  const handleSelectChat = (conversation: Conversation) => {
    router.push(`/negociacao?id=${conversation.id}&type=${conversation.type}`);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar negociação..." className="pl-8" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-1">
          {conversations.length > 0 ? conversations.map((convo) => (
            <button
              key={convo.id}
              className={cn(
                'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-all hover:bg-secondary',
                activeChatId === convo.id && 'bg-secondary'
              )}
              onClick={() => handleSelectChat(convo)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={convo.avatar} />
                <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="font-semibold truncate">{convo.name}</p>
                  <time className="text-xs text-muted-foreground">{convo.time}</time>
                </div>
                <div className="flex items-center justify-between">
                   <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                   <div className="flex items-center gap-1.5">
                    <AssetTypeIcon type={convo.type} />
                    {convo.unread > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                            {convo.unread}
                        </span>
                    )}
                   </div>
                </div>
              </div>
            </button>
          )) : (
            <div className="text-center text-sm text-muted-foreground py-10">
                Nenhuma negociação ativa. Inicie uma a partir da página de um ativo.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
