import Link from 'next/link';
import { Logo } from '../icons/logo';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Logo className="h-8 w-8" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} PECU'S INTERMEDIATE. All rights reserved.
          </p>
        </div>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link href="/termos-de-servico" className="text-sm text-muted-foreground hover:text-foreground">
            Termos de Serviço
          </Link>
          <Link href="/politica-de-privacidade" className="text-sm text-muted-foreground hover:text-foreground">
            Política de Privacidade
          </Link>
          <Link href="mailto:negotiation.pecus@gmail.com" className="text-sm text-muted-foreground hover:text-foreground">
            Contato
          </Link>
        </nav>
      </div>
    </footer>
  );
}
