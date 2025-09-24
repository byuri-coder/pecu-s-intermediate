import Link from 'next/link';
import type { TaxCredit } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Landmark, BadgePercent } from 'lucide-react';
import { cn } from '@/lib/utils';

type TaxCreditCardProps = {
  credit: TaxCredit;
};

const StatusBadge = ({ status }: { status: TaxCredit['status'] }) => {
  const variant = {
    'Disponível': 'default',
    'Negociando': 'outline',
    'Vendido': 'secondary',
  }[status] as 'default' | 'outline' | 'secondary';

  const className = {
    'Disponível': 'bg-green-100 text-green-800 border-green-200',
    'Negociando': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Vendido': 'bg-gray-100 text-gray-800 border-gray-200',
  }[status];

  return <Badge variant={variant} className={cn('capitalize', className)}>{status}</Badge>;
};

export function TaxCreditCard({ credit }: TaxCreditCardProps) {
  const discount = ((credit.amount - credit.price) / credit.amount) * 100;

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{credit.taxType}</CardTitle>
          <StatusBadge status={credit.status} />
        </div>
        <CardDescription>Vendido por {credit.sellerName}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-primary" />
          <span>Valor do Crédito: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(credit.amount)}</span>
        </div>
        <div className="flex items-center gap-2">
          <BadgePercent className="h-4 w-4 text-primary" />
          <span>Deságio: {discount.toFixed(2)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span>Localização: {credit.location}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 bg-secondary/30 p-4">
        <div>
          <p className="text-xs text-muted-foreground">Preço de Venda</p>
          <p className="text-2xl font-bold text-primary">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(credit.price)}
          </p>
        </div>
        <Button asChild className="w-full" disabled={credit.status !== 'Disponível'}>
          <Link href={`/negociacao/${credit.id}?type=tax-credit`}>Negociar</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
