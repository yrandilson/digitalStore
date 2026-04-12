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
  ArrowRight,
  BookOpen,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  UserCircle2,
} from "lucide-react";
import { Link } from "wouter";

const publicLinks = [
  { href: "/products", label: "Produtos", icon: ShoppingBag },
  { href: "/cart", label: "Carrinho", icon: ShoppingCart },
  { href: "/orders", label: "Pedidos", icon: BookOpen },
  { href: "/downloads", label: "Downloads", icon: Sparkles },
  { href: "/dashboard", label: "Admin", icon: LayoutDashboard },
];

export function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const { totalItems } = useCart();
  const { user } = useAuth();

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

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {publicLinks.map((item) => (
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
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {totalItems} itens no carrinho
            </Badge>

            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/cart">
                Ver carrinho
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            {user ? (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile" aria-label="Perfil">
                  <UserCircle2 className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button size="sm" onClick={() => (window.location.href = getLoginUrl())}>
                Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <p className="text-lg font-semibold">Digital Store</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              Estrutura pronta para produtos digitais, checkout, dashboard e integrações com Vercel e Firebase.
            </p>
          </div>
          <div>
            <p className="font-medium">Navegação</p>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              {publicLinks.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="font-medium">Próximos passos</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Carrinho completo</li>
              <li>• Checkout com Stripe</li>
              <li>• Dashboard administrativo</li>
              <li>• Login e perfil de usuário</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
