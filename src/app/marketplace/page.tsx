import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function MarketplacePage() {
  // This page is deprecated and the content has been moved to /credito-de-carbono
  // We redirect to avoid having duplicate pages.
  redirect('/credito-de-carbono');
  
  return null;
}
