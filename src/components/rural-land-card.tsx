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
  const Icon = icons[type] || Handshake; // Fallback icon
  return <Icon className="h-4 w-4 text-primary" />;
}

const StatusBadge = ({ status }: { status: RuralLand['status'] }) => {
    const variant = {
      'Disponível': 'default',
      'Negociando': 'outline',
      'Vendido': 'secondary',
    }[status] as 'default' | 'outline' | 'secondary' || 'secondary';
  
    const className = {
      'Disponível': 'bg-green-100 text-green-800 border-green-200',
      'Negociando': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Vendido': 'bg-gray-100 text-gray-800 border-gray-200',
    }[status] || 'bg-gray-100 text-gray-800';
  
    return <Badge variant={variant} className={cn('capitalize', className)}>{status || 'Indefinido'}</Badge>;
  };

export function RuralLandCard({ land }: RuralLandCardProps) {
  
  if (!land) {
    return null; // Don't render anything if the land object is invalid
  }

  const getPriceLabel = () => {
    switch (land.businessType) {
      case 'Venda':
        return 'Preço de Venda';
      case 'Arrendamento':
        return 'Preço / Ha / Ano';
      case 'Mineração':
        return 'Valor da Parceria/Venda';
      case 'Permuta':
        return 'Valor de Referência';
      default:
        return 'Preço';
    }
  }

  const imageUrl = land.images && land.images.length > 0 ? (typeof land.images[0] === 'string' ? land.images[0] : land.images[0].url) : null;

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
       <div className="relative w-full aspect-[16/9] overflow-hidden bg-secondary">
        {imageUrl ? (
            <Image
                src={imageUrl}
                alt={`Imagem da propriedade ${String(land.title || "Sem título")}`}
                fill
                className="object-cover"
                loading="lazy"
            />
        ) : (
            <div className="flex items-center justify-center h-full">
                <MountainIcon className="h-16 w-16 text-muted-foreground/30"/>
            </div>
        )}
        <div className="absolute top-2 right-2">
            <StatusBadge status={land.status || 'Disponível'} />
        </div>
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{String(land.title || "Sem título")}</CardTitle>
        <CardDescription>por {String(land.owner || 'Vendedor não informado')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <BusinessTypeIcon type={land.businessType || 'Venda'} />
          <span>Tipo de Negócio: {land.businessType || 'Não definido'}</span>
        </div>
        <div className="flex items-center gap-2">
          <MountainIcon className="h-4 w-4 text-primary" />
          <span>Tamanho: {typeof land.sizeHa === 'number' ? land.sizeHa.toLocaleString() : 'N/A'} Ha</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span>Localização: {land.location || 'Não informada'}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 bg-secondary/30 p-4">
        {(typeof land.price === 'number' && land.price > 0) ? (
          <div>
            <p className="text-xs text-muted-foreground">{getPriceLabel()}</p>
            <p className="text-2xl font-bold text-primary">
              {land.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        ) : (
          <div>
              <p className="text-xs text-muted-foreground">Negócio</p>
              <p className="text-xl font-bold text-primary">Aberto a propostas</p>
          </div>
        )}
        <Button asChild className="w-full" disabled={land.status !== 'Disponível'}>
          <Link href={`/terras-rurais/${land.id}`}>Ver Detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
