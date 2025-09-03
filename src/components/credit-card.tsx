import Link from 'next/link';
import type { CarbonCredit } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Leaf, Layers } from 'lucide-react';

type CreditCardProps = {
  credit: CarbonCredit;
};

export function CreditCard({ credit }: CreditCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardDescription>Vendido por</CardDescription>
                <CardTitle className="text-lg">{credit.sellerName}</CardTitle>
            </div>
            <Badge variant="secondary">{credit.creditType}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-primary" />
          <span>Tipo: {credit.creditType}</span>
        </div>
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span>Quantidade: {credit.quantity.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span>Localização: {credit.location}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 bg-secondary/30 p-4">
        <div>
          <p className="text-xs text-muted-foreground">Preço por crédito</p>
          <p className="text-2xl font-bold text-primary">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(credit.pricePerCredit)}
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href={`/credito-de-carbono/${credit.id}`}>Negociar</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
