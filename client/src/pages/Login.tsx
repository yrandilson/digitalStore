import { StorefrontLayout } from "@/components/StorefrontLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { ArrowRight, Github, Mail } from "lucide-react";

export default function Login() {
  return (
    <StorefrontLayout>
      <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="hidden rounded-3xl bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Acesso</p>
              <h1 className="mt-4 max-w-xl text-4xl font-bold leading-tight">
                Entre para acompanhar pedidos, downloads e área admin.
              </h1>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>• Histórico de pedidos</li>
              <li>• Arquivos comprados</li>
              <li>• Painel administrativo</li>
            </ul>
          </div>

          <Card className="border-muted/60 shadow-xl">
            <CardHeader>
              <CardTitle>Entrar na conta</CardTitle>
              <CardDescription>Use seu provedor de autenticação ou login por email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="voce@exemplo.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
              <Button className="w-full">
                Entrar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="grid gap-3 pt-2">
                <Button variant="outline" className="w-full" onClick={() => (window.location.href = getLoginUrl())}>
                  <Mail className="mr-2 h-4 w-4" />
                  Entrar com OAuth
                </Button>
                <Button variant="outline" className="w-full">
                  <Github className="mr-2 h-4 w-4" />
                  Entrar com GitHub
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StorefrontLayout>
  );
}
