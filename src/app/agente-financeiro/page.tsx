
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { ChatInterface } from './chat-interface';

export default function FinancialAgentPage() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Card className="border-primary/20 bg-secondary/20">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                <Bot className="h-8 w-8" />
            </div>
          <CardTitle className="text-3xl font-bold font-headline">Agente Financeiro com IA</CardTitle>
          <CardDescription>
            Tire suas dúvidas sobre o mercado, tributos, investimentos e mais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChatInterface />
        </CardContent>
      </Card>
    </div>
  );
}
