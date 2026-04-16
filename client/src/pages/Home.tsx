import { StorefrontLayout } from "@/components/StorefrontLayout";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  ArrowRight,
  Download,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

const highlights = [
  {
    icon: Download,
    title: "Entrega digital imediata",
    description: "Acesso ao conteúdo logo após a confirmação do pagamento.",
  },
  {
    icon: ShieldCheck,
    title: "Compra segura",
    description: "Checkout com autenticação e pagamento protegido.",
  },
  {
    icon: Sparkles,
    title: "Produtos premium",
    description: "Templates, assets e recursos digitais organizados por categoria.",
  },
];

export default function Home() {
  // Fetch featured products dynamically
  const { data: featuredProducts, isLoading: featuredLoading } = trpc.products.featured.useQuery({
    limit: 4,
  });

  // Fetch categories
  const { data: categories } = trpc.products.categories.useQuery();

  return (
    <StorefrontLayout>
      <div className="bg-background text-foreground">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
          <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.18),transparent_28%)]" />
          <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center px-6 py-24 lg:px-8">
            <Badge className="mb-6 w-fit bg-white/10 text-white hover:bg-white/15">
              Loja digital com foco em conversão
            </Badge>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
              Produtos digitais com visual forte e fluxo de compra simples.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Catálogo moderno, páginas de produto, carrinho e checkout
              completo para a sua loja digital.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                <Link href="/products">
                  Ver catálogo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                <Link href="/register">Criar conta grátis</Link>
              </Button>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} className="border-white/10 bg-white/5 p-5 text-white backdrop-blur">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <Badge variant="outline" className="mb-4 w-fit">Destaques</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Produtos em destaque
              </h2>
              <p className="mt-2 text-muted-foreground">
                Os produtos mais populares e recomendados da nossa loja.
              </p>
            </div>
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/products">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  rating={product.rating ?? undefined}
                  reviewCount={product.reviewCount ?? 0}
                  featured={product.featured ?? false}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed p-12 text-center">
              <p className="text-muted-foreground">Nenhum produto em destaque no momento.</p>
              <Button asChild className="mt-4">
                <Link href="/products">Explorar catálogo</Link>
              </Button>
            </Card>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Button asChild variant="outline">
              <Link href="/products">
                Ver todos os produtos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Categories Section */}
        {categories && categories.length > 0 && (
          <section className="bg-muted/30 py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <h2 className="text-2xl font-bold tracking-tight mb-8">Categorias</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/products?category=${cat.id}`}>
                    <Card className="p-6 text-center hover:shadow-md transition-shadow cursor-pointer group">
                      {cat.imageUrl && (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          loading="lazy"
                          className="h-16 w-16 mx-auto mb-3 rounded-lg object-cover"
                        />
                      )}
                      <h3 className="font-semibold group-hover:text-blue-600 transition-colors">
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <Badge variant="outline" className="mb-4 w-fit">
                Feito para vender melhor
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Interface pronta para evoluir sem parecer protótipo.
              </h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                A base já inclui catálogo, produto individual, carrinho local e
                integração com backend, então você pode seguir para checkout,
                login e painel admin sem refazer a estrutura.
              </p>
            </div>

            <Card className="border-muted/60 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Star className="h-4 w-4 fill-current text-amber-500" />
                Funcionalidades incluídas
              </div>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>• Catálogo com filtros, busca e paginação</li>
                <li>• Página individual de produto com reviews</li>
                <li>• Carrinho com persistência local</li>
                <li>• Checkout com criação de pedido</li>
                <li>• Painel admin com dashboard e CRUD</li>
                <li>• Autenticação com Firebase</li>
              </ul>
            </Card>
          </div>
        </section>
      </div>
    </StorefrontLayout>
  );
}
