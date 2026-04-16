import { useState } from "react";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Compass,
  Download,
  House,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  UserCircle2,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useDebounce } from "@/hooks/useDebounce";

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
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSideMenuOpen, setDesktopSideMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [topSearchValue, setTopSearchValue] = useState("");
  const [topSearchFocused, setTopSearchFocused] = useState(false);
  const debouncedTopSearch = useDebounce(topSearchValue, 250);

  const navLinks = user?.role === "admin"
    ? [...publicLinks, ...adminLinks]
    : publicLinks;

  const sideMenuLinks = [
    { href: "/", label: "Início", icon: House },
    ...navLinks,
    { href: user ? "/profile" : "/login", label: user ? "Perfil" : "Entrar", icon: UserCircle2 },
  ];

  const { data: topSearchResults, isLoading: topSearchLoading } = trpc.products.search.useQuery(
    { query: debouncedTopSearch, limit: 6 },
    { enabled: debouncedTopSearch.trim().length > 1 }
  );

  const showTopSuggestions = topSearchFocused && topSearchValue.trim().length > 1;

  const handleTopSearchSubmit = () => {
    const query = topSearchValue.trim();
    if (!query) {
      setLocation("/products");
      return;
    }
    setTopSearchFocused(false);
    setLocation("/products");
  };

  const handleLogout = async () => {
    await logout();
    setProfileMenuOpen(false);
    setLocation("/");
  };

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

          {/* Desktop top utility strip (replaces old menu area) */}
          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="relative flex w-full max-w-xl items-center gap-2 rounded-xl border bg-background/80 p-1 shadow-sm">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={topSearchValue}
                  onChange={(e) => setTopSearchValue(e.target.value)}
                  onFocus={() => setTopSearchFocused(true)}
                  onBlur={() => setTimeout(() => setTopSearchFocused(false), 160)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleTopSearchSubmit();
                    }
                  }}
                  placeholder="Buscar produtos..."
                  className="h-9 border-0 bg-transparent pl-9 pr-2 text-sm shadow-none focus-visible:ring-0"
                />
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-1 rounded-lg bg-slate-950 px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                <Compass className="h-3.5 w-3.5" />
                Explorar
              </Link>
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-2 text-[11px] font-semibold text-amber-900">
                <Sparkles className="h-3.5 w-3.5" />
                Entrega imediata
              </span>

              {showTopSuggestions ? (
                <div className="absolute left-1 top-[calc(100%+0.45rem)] z-50 w-[calc(100%-8.8rem)] rounded-xl border bg-background p-2 shadow-xl">
                  {topSearchLoading ? (
                    <p className="px-2 py-2 text-xs text-muted-foreground">Buscando...</p>
                  ) : topSearchResults && topSearchResults.length > 0 ? (
                    <div className="space-y-1">
                      {topSearchResults.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          className="flex items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent"
                        >
                          <span className="truncate pr-2">{product.name}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {Number(product.price).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="px-2 py-2 text-xs text-muted-foreground">Nenhum produto encontrado.</p>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalItems > 0 && (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {totalItems} {totalItems === 1 ? "item" : "itens"}
              </Badge>
            )}

            {user ? (
              <DropdownMenu open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
                <div
                  className="hidden md:block"
                  onMouseEnter={() => setProfileMenuOpen(true)}
                  onMouseLeave={() => setProfileMenuOpen(false)}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Perfil">
                      <UserCircle2 className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <p className="truncate text-sm font-medium">{user.name || "Minha conta"}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email || "Conta ativa"}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <UserCircle2 className="h-4 w-4" />
                        Meu perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="cursor-pointer">
                        <Package className="h-4 w-4" />
                        Meus pedidos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/downloads" className="cursor-pointer">
                        <Download className="h-4 w-4" />
                        Meus downloads
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/products" className="cursor-pointer">
                        <ShoppingBag className="h-4 w-4" />
                        Meus produtos
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "admin" ? (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <LayoutDashboard className="h-4 w-4" />
                          Painel admin
                        </Link>
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={(e) => {
                        e.preventDefault();
                        void handleLogout();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </div>
              </DropdownMenu>
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

      {/* Desktop Right Side Menu */}
      <aside
        className={cn(
          "fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 transition-transform duration-300 lg:block",
          desktopSideMenuOpen ? "translate-x-0" : "translate-x-[calc(100%-3.5rem)]"
        )}
        onMouseEnter={() => setDesktopSideMenuOpen(true)}
        onMouseLeave={() => setDesktopSideMenuOpen(false)}
      >
        <div className="w-56 rounded-l-2xl border border-white/50 bg-gradient-to-b from-background/95 via-background/90 to-muted/90 p-2 shadow-2xl backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between px-2 py-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Navegar</p>
            <span className="inline-flex h-6 items-center rounded-md bg-muted px-2 text-[10px] font-medium text-muted-foreground">
              hover
            </span>
          </div>

          <nav className="space-y-1">
            {sideMenuLinks.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));

              return (
                <Link
                  key={`side-${item.href}`}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200",
                    isActive
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-muted-foreground")} />
                  <span
                    className={cn(
                      "whitespace-nowrap transition-all duration-200",
                      desktopSideMenuOpen ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

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
