import { useState } from "react";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ArrowRight,
  BookOpen,
  LayoutDashboard,
  Menu,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  UserCircle2,
  X,
} from "lucide-react";
import { Link } from "wouter";

const publicLinks = [
  { href: "/products", label: "Produtos", icon: ShoppingBag },
  { href: "/cart", label: "Carrinho", icon: ShoppingCart },
  { href: "/orders", label: "Pedidos", icon: BookOpen },
  { href: "/downloads", label: "Downloads", icon: Sparkles },
];

const adminLinks = [
  { href: "/dashboard", label: "Admin", icon: LayoutDashboard },
];

export function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const { totalItems } = useCart();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = user?.role === "admin"
    ? [...publicLinks, ...adminLinks]
    : publicLinks;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
              <ShoppingBag className="h-4 w-4" />
            </span>
            <span>Digital Store</span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navLinks.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-2">
            {totalItems > 0 && (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {totalItems} {totalItems === 1 ? "item" : "itens"}
              </Badge>
            )}

            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/cart">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Carrinho
                {totalItems > 0 && (
                  <Badge variant="default" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Link>
            </Button>

            {user ? (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile" aria-label="Perfil">
                  <UserCircle2 className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Digital Store
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  {navLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                  <div className="my-3 h-px bg-border" />
                  {user ? (
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      <UserCircle2 className="h-4 w-4" />
                      Perfil
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Entrar
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <p className="text-lg font-semibold">Digital Store</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              Produtos digitais premium com entrega imediata, checkout seguro e painel administrativo completo.
            </p>
          </div>
          <div>
            <p className="font-medium">Navegação</p>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              {publicLinks.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="font-medium">Sobre</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Entrega digital imediata</li>
              <li>• Pagamentos seguros</li>
              <li>• Garantia de 7 dias</li>
              <li>• Suporte dedicado</li>
            </ul>
          </div>
        </div>
        <div className="border-t">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} Digital Store. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
