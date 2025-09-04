import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { AgentChat } from './agent-chat';

export default function AgentPage() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-4xl">
      <Card className="border-primary/20">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                <Bot className="h-8 w-8" />
            </div>
          <CardTitle className="text-3xl font-bold font-headline">Agente de Assistência</CardTitle>
          <CardDescription>
            Seu assistente IA para cálculos e análises tributárias e financeiras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgentChat />
        </CardContent>
      </Card>
    </div>
  );
}
