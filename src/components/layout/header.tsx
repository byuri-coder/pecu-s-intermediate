import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Mountain } from 'lucide-react';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
    {children}
  </Link>
);

export function Header() {
  const navItems = [
    { href: '/dashboard', label: 'Gerenciamento' },
    { href: '/register-credit', label: 'Cadastrar Crédito' },
    { href: '/tributos', label: 'Tributos' },
    { href: '#', label: 'Terras Rurais' },
    { href: '/credito-de-carbono', label: 'Crédito de Carbono' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/credito-de-carbono" className="mr-6 flex items-center space-x-2">
            <Mountain className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              CarbonLink
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink key={item.label} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link href="/" className="mr-6 flex items-center space-x-2">
                <Mountain className="h-6 w-6 text-primary" />
                <span className="font-bold">CarbonLink</span>
            </Link>
            <div className="flex flex-col space-y-3 pt-6">
              {navItems.map((item) => (
                <Link key={`${item.label}-mobile`} href={item.href} className="text-sm font-medium text-foreground">
                  {item.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Can add search bar here if needed */}
          </div>
          <nav className="flex items-center">
            <Button>Login</Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
