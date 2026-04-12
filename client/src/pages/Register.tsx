import { useState } from "react";
import { useLocation } from "wouter";
import { StorefrontLayout } from "@/components/StorefrontLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ArrowRight } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name.trim() || !surname.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Preencha todos os campos para criar a conta.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(credential.user, {
        displayName: `${name.trim()} ${surname.trim()}`,
      });
      setLocation("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao criar conta.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              {errorMessage ? (
                <Alert variant="destructive">
                  <AlertTitle>Não foi possível criar a conta</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Sobrenome</Label>
                  <Input id="surname" placeholder="Seu sobrenome" value={surname} onChange={(e) => setSurname(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Senha</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleRegister} disabled={isSubmitting}>
                {isSubmitting ? "Criando conta..." : "Criar conta"}
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
