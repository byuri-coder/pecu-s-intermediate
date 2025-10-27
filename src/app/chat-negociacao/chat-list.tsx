
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Leaf, Landmark, Mountain, Loader2, UserCircle } from 'lucide-react';
import type { Conversation, AssetType } from '@/lib/types';
import { useRouter } from 'next/navigation';

// Ícone de cada tipo de ativo
const AssetTypeIcon = ({ type }: { type: AssetType }) => {
  const iconMap = {
    'carbon-credit': Leaf,
    'tax-credit': Landmark,
    'rural-land': Mountain,
  } as const;

  const Icon = iconMap[type] ?? Leaf;
  return <Icon className="h-4 w-4 text-muted-foreground" />;
};

export function ChatList({
  conversations = [],
  activeChatId,
  isLoading,
}: {
  conversations?: Conversation[];
  activeChatId?: string | null;
  isLoading?: boolean;
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');

  // Se ainda estiver carregando
  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </Card>
    );
  }

  // Proteção extra: caso venha algo inesperado
  if (!Array.isArray(conversations)) {
    return (
      <Card className="h-full flex items-center justify-center text-sm text-muted-foreground">
        Erro ao carregar conversas. Tente novamente mais tarde.
      </Card>
    );
  }

  const handleSelectChat = (conversationId: string) => {
    if (!conversationId) return;
    router.push(`/chat-negociacao?id=${conversationId}`);
  };

  const filteredConversations = conversations.filter((c) => {
    const name = c?.name?.toLowerCase() || '';
    const asset = c?.assetName?.toLowerCase() || '';
    return name.includes(searchTerm.toLowerCase()) || asset.includes(searchTerm.toLowerCase());
  });

  return (
    <Card className="h-full flex flex-col">
      {/* 🔍 Barra de pesquisa */}
      <CardHeader className="p-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar negociação..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>

      {/* 💬 Lista de conversas */}
      <CardContent className="flex-1 p-2 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          <div className="space-y-1">
            {filteredConversations.map((convo) => (
              <button
                key={convo.id}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-all hover:bg-secondary',
                  activeChatId === convo.id && 'bg-secondary'
                )}
                onClick={() => handleSelectChat(convo.id)}
              >
                <UserCircle className="h-10 w-10 text-muted-foreground" />

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold truncate">{convo.name || 'Usuário'}</p>
                    <time className="text-xs text-muted-foreground">{convo.time || ''}</time>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {convo.lastMessage || 'Sem mensagens ainda'}
                    </p>
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
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground py-10">
            {conversations.length === 0
              ? 'Nenhuma negociação ativa. Inicie uma a partir da página de um ativo.'
              : 'Nenhuma negociação encontrada para sua busca.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
