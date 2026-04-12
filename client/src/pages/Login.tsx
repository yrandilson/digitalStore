import { useState } from "react";
import { useLocation } from "wouter";
import { StorefrontLayout } from "@/components/StorefrontLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ArrowRight, Github, Mail } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const params = new URLSearchParams(window.location.search);
  const missingOAuthConfig = params.get("auth") === "missing";

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Preencha email e senha para entrar.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setLocation("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao entrar.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              {missingOAuthConfig ? (
                <Alert variant="destructive">
                  <AlertTitle>Login OAuth não configurado</AlertTitle>
                  <AlertDescription>
                    Defina no Vercel as variáveis VITE_OAUTH_PORTAL_URL e VITE_APP_ID, depois faça redeploy.
                  </AlertDescription>
                </Alert>
              ) : null}

              {errorMessage ? (
                <Alert variant="destructive">
                  <AlertTitle>Não foi possível entrar</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleLogin} disabled={isSubmitting}>
                {isSubmitting ? "Entrando..." : "Entrar"}
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
