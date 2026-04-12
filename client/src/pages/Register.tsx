import { StorefrontLayout } from "@/components/StorefrontLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";

export default function Register() {
  return (
    <StorefrontLayout>
      <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-5xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1fr]">
          <Card className="border-muted/60 shadow-xl">
            <CardHeader>
              <CardTitle>Criar conta</CardTitle>
              <CardDescription>
                Estrutura visual pronta para registro de clientes e admins.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" placeholder="Seu nome" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Sobrenome</Label>
                  <Input id="surname" placeholder="Seu sobrenome" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input id="register-email" type="email" placeholder="voce@exemplo.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Senha</Label>
                <Input id="register-password" type="password" placeholder="••••••••" />
              </div>
              <Button className="w-full">
                Criar conta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <div className="hidden rounded-3xl border bg-gradient-to-br from-cyan-500 to-blue-600 p-10 text-white lg:flex lg:flex-col lg:justify-end">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-100">Cadastro</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Registre clientes para liberar carrinho, downloads e histórico.
            </h1>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
