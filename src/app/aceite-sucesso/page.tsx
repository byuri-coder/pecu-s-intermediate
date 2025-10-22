'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AcceptanceSuccessPage() {
    return (
        <div className="container mx-auto flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto bg-green-100 text-green-700 p-4 rounded-full w-fit mb-4">
                        <CheckCircle className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Aceite Confirmado!</CardTitle>
                    <CardDescription>
                        Sua validação foi registrada com sucesso. Você pode retornar à página de negociação para continuar o processo.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/dashboard">Voltar ao Painel</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
