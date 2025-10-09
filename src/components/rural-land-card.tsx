import Link from 'next/link';
import type { RuralLand } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, MountainIcon, Handshake, Sprout, Building, Pickaxe } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type RuralLandCardProps = {
  land: RuralLand;
};

const BusinessTypeIcon = ({ type }: { type: RuralLand['businessType'] }) => {
  const icons = {
    'Venda': Handshake,
    'Permuta': Building,
    'Mineração': Pickaxe,
    'Arrendamento': Sprout,
  };
  const Icon = icons[type];
  return <Icon className="h-4 w-4 text-primary" />;
}

const StatusBadge = ({ status }: { status: RuralLand['status'] }) => {
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

export function RuralLandCard({ land }: RuralLandCardProps) {
  
  const getPriceLabel = () => {
    switch (land.businessType) {
      case 'Venda':
        return 'Preço de Venda';
      case 'Arrendamento':
        return 'Preço / Ha / Ano';
      case 'Mineração':
        return 'Valor da Parceria/Venda';
      case 'Permuta':
        return 'Valor de Permuta';
      default:
        return 'Preço';
    }
  }

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
       <div className="relative w-full aspect-[16/9] overflow-hidden">
        <Image
          // Using a placeholder as the real images are just paths
          src={`https://picsum.photos/seed/${land.id}/400/225`}
          alt={`Imagem da propriedade ${land.title}`}
          fill
          className="object-cover"
          data-ai-hint="aerial farmland"
        />
        <div className="absolute top-2 right-2">
            <StatusBadge status={land.status} />
        </div>
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{land.title}</CardTitle>
        <CardDescription>por {land.owner}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <BusinessTypeIcon type={land.businessType} />
          <span>Tipo de Negócio: {land.businessType}</span>
        </div>
        <div className="flex items-center gap-2">
          <MountainIcon className="h-4 w-4 text-primary" />
          <span>Tamanho: {land.sizeHa.toLocaleString()} Ha</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span>Localização: {land.location}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 bg-secondary/30 p-4">
        {land.price && (
          <div>
            <p className="text-xs text-muted-foreground">{getPriceLabel()}</p>
            <p className="text-2xl font-bold text-primary">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(land.price)}
            </p>
          </div>
        )}
        {land.businessType === 'Permuta' && (
             <div>
                <p className="text-xs text-muted-foreground">Negócio</p>
                <p className="text-xl font-bold text-primary">Aberto a propostas</p>
            </div>
        )}
        <Button asChild className="w-full" disabled={land.status !== 'Disponível'}>
          <Link href={`/negociacao/${land.id}?type=rural-land`}>Ver Detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
