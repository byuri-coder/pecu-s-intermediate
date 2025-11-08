
import Link from 'next/link';
import type { GrainInsumo, GrainPosColheita, GrainFuturo } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Sprout, Package, Forward, DollarSign, Calendar, Shield, Wheat } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type GrainAsset = GrainInsumo | GrainPosColheita | GrainFuturo;

type GrainCardProps = {
  grain: GrainAsset;
};

const TypeInfo = ({ grain }: { grain: GrainAsset }) => {
  let Icon, text, price, priceLabel;

  switch (grain.tipo) {
    case 'grain-insumo':
      Icon = Sprout;
      text = `Sementes de ${grain.grain}`;
      price = grain.precoPorSaca;
      priceLabel = 'Preço / saca';
      break;
    case 'grain-pos-colheita':
      Icon = Package;
      text = `Grãos de ${grain.grain} (Safra ${grain.safra})`;
      price = grain.precoPorSaca;
      priceLabel = 'Preço / saca';
      break;
    case 'grain-futuro':
      Icon = Forward;
      text = `Venda Futura de ${grain.grain} (Safra ${grain.safra})`;
      price = grain.precoFuturo;
      priceLabel = 'Preço Futuro / saca';
      break;
    default:
      Icon = Wheat;
      text = 'Grão';
  }

  return (
    <>
      <div className="flex justify-between items-start">
        <CardDescription>{text}</CardDescription>
        <Badge variant="secondary" className="flex items-center gap-1"><Icon className="h-3 w-3"/> {grain.tipo.split('-')[1]}</Badge>
      </div>
      <CardTitle className="text-lg pt-1">
        {grain.tipo === 'grain-insumo' ? grain.cultivar : grain.grain}
      </CardTitle>
       <div className="flex-grow space-y-3 text-sm text-muted-foreground pt-4">
        {grain.tipo === 'grain-pos-colheita' && (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span>{grain.quantidadeDisponivel.toLocaleString()} sacas disponíveis</span>
          </div>
        )}
         {grain.tipo === 'grain-insumo' && (
          <div className="flex items-center gap-2">
            <Sprout className="h-4 w-4 text-primary" />
            <span>{grain.quantidadeDisponivel.toLocaleString()} sacas de sementes</span>
          </div>
        )}
         {grain.tipo === 'grain-futuro' && (
            <>
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Entrega: {new Date(grain.dataEntrega).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Garantias: {grain.garantias?.seguroRural ? 'Seguro' : ''}{grain.garantias?.seguroRural && grain.garantias?.alienacaoFiduciaria ? ' + ' : ''}{grain.garantias?.alienacaoFiduciaria ? 'Alienação' : ''}</span>
            </div>
            </>
        )}
      </div>

       <CardFooter className="flex flex-col items-start gap-4 bg-secondary/30 p-4 -mx-6 -mb-6 mt-4">
        {price && (
            <div>
            <p className="text-xs text-muted-foreground">{priceLabel}</p>
            <p className="text-2xl font-bold text-primary">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
            </p>
            </div>
        )}
        <Button asChild className="w-full" disabled={grain.status !== 'Disponível'}>
          <Link href={`/graos/${grain.id}`}>Ver Detalhes</Link>
        </Button>
      </CardFooter>
    </>
  );
};


export function GrainCard({ grain }: GrainCardProps) {
  const imageUrl = grain.imagens && grain.imagens.length > 0 ? grain.imagens[0].url : null;
  const grainType = grain.tipo as GrainAsset['tipo'];

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-secondary">
        {imageUrl ? (
          <Image src={imageUrl} alt={`Imagem de ${grain.grain}`} fill className="object-cover" loading="lazy" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Wheat className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={grain.status === 'Disponível' ? 'default' : 'secondary'} className={grain.status === 'Disponível' ? 'bg-green-100 text-green-800' : ''}>
            {grain.status}
          </Badge>
        </div>
      </div>
      <CardHeader className="flex-1 flex flex-col">
        <TypeInfo grain={grain} />
      </CardHeader>
    </Card>
  );
}

