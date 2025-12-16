
"use client"

import * as React from 'react';
import Link from 'next/link';
import { getAuth, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { app } from '@/lib/firebase';
import Image from 'next/image';

import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, UserCircle, LogOut, LayoutDashboard, FilePlus, Building, User, Calculator, MessageSquare, FileSignature, Shield, TrendingUp, Receipt, FileText, Calendar, Wheat, ChevronDown, Share2 } from 'lucide-react';
import { Logo } from '../icons/logo';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"


const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"


const NotificationDot = () => (
    <span className="relative flex h-2 w-2 ml-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
    </span>
);

const marketplaceComponents: { title: string; href: string; description: string }[] = [
  {
    title: "Crédito de Carbono",
    href: "/credito-de-carbono",
    description: "Invista em projetos sustentáveis e neutralize sua pegada de carbono.",
  },
  {
    title: "Terras Rurais",
    href: "/terras-rurais",
    description: "Encontre propriedades para agronegócio, mineração ou arrendamento.",
  },
  {
    title: "Créditos Tributários",
    href: "/tributos",
    description: "Otimize sua carga fiscal com saldos credores de ICMS e outros tributos.",
  },
  {
    title: "Grãos",
    href: "/graos",
    description: "Negocie insumos, grãos físicos e contratos futuros com segurança.",
  },
]


export function Header() {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [hasNewInvoices, setHasNewInvoices] = React.useState(false);
  const [hasNewDuplicates, setHasNewDuplicates] = React.useState(false);

  React.useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAdmin(firebaseUser.email === 'byuripaulo@gmail.com');
      } else {
        setUser(null);
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
            <span className="hidden font-semibold sm:inline-block text-sm">
              PECU'S INTERMEDIATE
            </span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Marketplace</NavigationMenuTrigger>
                    <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                        {marketplaceComponents.map((component) => (
                        <ListItem
                            key={component.title}
                            title={component.title}
                            href={component.href}
                        >
                            {component.description}
                        </ListItem>
                        ))}
                    </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/agente-de-assistencia" passHref>
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                          Calculadora e Simuladores
                      </NavigationMenuLink>
                    </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
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
              {marketplaceComponents.map((item) => (
                <Link key={`${item.href}-mobile`} href={item.href} className="text-sm font-medium text-foreground">
                  {item.title}
                </Link>
              ))}
                <Link href="/agente-de-assistencia" className="text-sm font-medium text-foreground flex items-center">
                  <Calculator className="mr-2 h-4 w-4" /> Calculadora e Simuladores
                </Link>
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
                <Button variant="secondary" size="icon" className="rounded-full">
                   <Avatar className="h-8 w-8">
                     <AvatarImage src={`/api/avatar/${user.uid}?t=${new Date().getTime()}`} alt={user.displayName || 'Avatar do usuário'} />
                     <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                   </Avatar>
                  <span className="sr-only">Toggle user menu</span>
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
                    <Link href="/conectar-crm"><Share2 className="mr-2 h-4 w-4" /><span>Conectar CRM</span></Link>
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
