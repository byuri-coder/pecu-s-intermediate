'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AcceptanceErrorPage() {
    return (
        <div className="container mx-auto flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                     <div className="mx-auto bg-red-100 text-red-700 p-4 rounded-full w-fit mb-4">
                        <XCircle className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Ocorreu um Problema</CardTitle>
                    <CardDescription>
                        O link de validação que você usou é inválido, expirou ou já foi utilizado. Por favor, tente solicitar um novo e-mail de verificação a partir da página de negociação.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/dashboard">Voltar ao Início</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
