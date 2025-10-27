
"use client"

import * as React from 'react';
import Link from 'next/link';
import { getAuth, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { app } from '@/lib/firebase';

import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, UserCircle, LogOut, LayoutDashboard, FilePlus, Building, User, Calculator, MessageSquare, FileSignature, Shield, TrendingUp, Receipt, FileText, Calendar } from 'lucide-react';
import { Logo } from '../icons/logo';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
    {children}
  </Link>
);

const NotificationDot = () => (
    <span className="relative flex h-2 w-2 ml-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
    </span>
);

export function Header() {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [hasNewInvoices, setHasNewInvoices] = React.useState(false);
  const [hasNewDuplicates, setHasNewDuplicates] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);


  const navItems = [
    { href: '/tributos', label: 'Tributos' },
    { href: '/terras-rurais', label: 'Terras Rurais' },
    { href: '/credito-de-carbono', label: 'Crédito de Carbono' },
    { href: '/agente-de-assistencia', label: 'Calculadora e Simuladores', icon: Calculator },
  ];

  React.useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // A photoURL do Firebase Auth é atualizada no login/upload.
        // O ?t=... é para quebrar o cache do navegador.
        setAvatarUrl(`${firebaseUser.photoURL}?t=${new Date().getTime()}`);
        setIsAdmin(firebaseUser.email === 'byuripaulo@gmail.com');
      } else {
        setUser(null);
        setAvatarUrl(null);
        setIsAdmin(false);
      }
    });

    const checkNotifications = () => {
        if (typeof window !== 'undefined') {
            setHasNewInvoices(localStorage.getItem('newInvoicesAvailable') === 'true');
            setHasNewDuplicates(localStorage.getItem('newDuplicatesAvailable') === 'true');
        }
    };

    checkNotifications();

    window.addEventListener('storage', checkNotifications);

    return () => {
        unsubscribe();
        window.removeEventListener('storage', checkNotifications);
    };
  }, []);

  const isLoggedIn = !!user;

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
              <Link key={`${item.href}-${item.label}`} href={item.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center">
                 {item.icon ? <item.icon className="mr-2 h-4 w-4" /> : null}
                {item.label}
              </Link>
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
                <Link key={`${item.href}-${item.label}-mobile`} href={item.href} className="text-sm font-medium text-foreground flex items-center">
                  {item.icon ? <item.icon className="mr-2 h-4 w-4" /> : null}
                  {item.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-end space-x-2">
            <ThemeToggle />
          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/chat-negociacao" title="Chat de Negociação">
                  <MessageSquare className="h-5 w-5" />
                  <span className="sr-only">Negociações</span>
                </Link>
              </Button>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={avatarUrl || undefined} alt={user.displayName || 'User Avatar'} />
                    <AvatarFallback>
                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'Usuário'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
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
                    <Link href="/faturas" className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Receipt className="mr-2 h-4 w-4" />
                            <span>Faturas</span>
                        </div>
                        {hasNewInvoices && <NotificationDot />}
                    </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                     <Link href="/duplicatas" className="flex items-center justify-between">
                        <div className="flex items-center">
                             <FileText className="mr-2 h-4 w-4" />
                             <span>Duplicatas de Compra/Venda</span>
                        </div>
                         {hasNewDuplicates && <NotificationDot />}
                    </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/calendario"><Calendar className="mr-2 h-4 w-4" /><span>Calendário de Operações</span></Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/cadastrar-ativo"><FilePlus className="mr-2 h-4 w-4" /><span>Cadastrar Ativos</span></Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/filiais"><Building className="mr-2 h-4 w-4" /><span>Gerenciar Filiais</span></Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/peticoes"><FileSignature className="mr-2 h-4 w-4" /><span>Minhas Petições</span></Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin"><Shield className="mr-2 h-4 w-4" /><span>Área do Admin</span></Link>
                    </DropdownMenuItem>
                  )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => getAuth(app).signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
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
