import { StorefrontLayout } from "@/components/StorefrontLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    description: "Checkout pronto para integração com Stripe e autenticação.",
  },
  {
    icon: Sparkles,
    title: "Produtos premium",
    description: "Templates, assets e recursos digitais organizados por categoria.",
  },
];

export default function Home() {
  return (
    <StorefrontLayout>
      <div className="bg-background text-foreground">
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
              Catálogo moderno, páginas de produto, carrinho e base preparada para
              Vercel, Firebase e Stripe.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                <Link href="/products">
                  Ver catálogo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                <Link href="/products">Explorar produtos</Link>
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
                Pronto para o próximo passo
              </div>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>• Catálogo com filtros e busca</li>
                <li>• Página individual de produto</li>
                <li>• Carrinho com persistência local</li>
                <li>• Backend preparado para serviços externos</li>
              </ul>
            </Card>
          </div>
        </section>
      </div>
    </StorefrontLayout>
  );
}
