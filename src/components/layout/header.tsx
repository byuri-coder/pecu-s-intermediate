import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, UserCircle, LogOut, LayoutDashboard, Calendar, FilePlus, Building, User } from 'lucide-react';
import { Logo } from '../icons/logo';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
    {children}
  </Link>
);

export function Header() {
  const navItems = [
    { href: '/tributos', label: 'Tributos' },
    { href: '/terras-rurais', label: 'Terras Rurais' },
    { href: '/credito-de-carbono', label: 'Crédito de Carbono' },
  ];

  // Placeholder for user authentication state
  const isLoggedIn = true;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/credito-de-carbono" className="mr-6 flex items-center space-x-2">
            <Logo className="h-8 w-8" />
            <span className="hidden font-bold sm:inline-block">
              PECU'S INTERMEDIATE
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink key={`${item.href}-${item.label}`} href={item.href}>
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
                <Logo className="h-8 w-8" />
                <span className="font-bold">PECU'S INTERMEDIATE</span>
            </Link>
            <div className="flex flex-col space-y-3 pt-6">
              {navItems.map((item) => (
                <Link key={`${item.href}-${item.label}-mobile`} href={item.href} className="text-sm font-medium text-foreground">
                  {item.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {isLoggedIn ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/avatars/01.png" alt="User Avatar" />
                    <AvatarFallback>
                        <UserCircle className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Usuário Logado</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      usuario@email.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/perfil"><User className="mr-2 h-4 w-4" /><span>Meu Perfil</span></Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /><span>Gerenciamento</span></Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/cadastrar-ativo"><FilePlus className="mr-2 h-4 w-4" /><span>Cadastrar Ativos</span></Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/calendario"><Calendar className="mr-2 h-4 w-4" /><span>Calendário</span></Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/filiais"><Building className="mr-2 h-4 w-4" /><span>Gerenciar Filiais</span></Link>
                  </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <nav className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/cadastro">Cadastre-se</Link>
              </Button>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
