import { useState } from "react";
import { useLocation } from "wouter";
import { StorefrontLayout } from "@/components/StorefrontLayout";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (order) => {
      clearCart();
      setOrderId(order.id);
      setIsComplete(true);
      toast.success("Pedido realizado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Falha ao criar pedido");
    },
  });

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      errors.name = "Nome deve ter pelo menos 2 caracteres";
    }

    if (!email.trim()) {
      errors.email = "Email é obrigatório";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = "Email inválido";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFinishPurchase = async () => {
    if (!validate()) return;

    createOrderMutation.mutate({
      items: items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productPrice: item.product.price,
        quantity: item.quantity,
      })),
      customerEmail: email.trim(),
      customerName: name.trim(),
    });
  };

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="outline" className="mb-3">Checkout</Badge>
            <h1 className="text-3xl font-bold tracking-tight">Finalizar compra</h1>
            <p className="mt-2 text-muted-foreground">
              Confirme seus dados para concluir o pedido digital.
            </p>
          </div>
          <Badge>{totalItems} {totalItems === 1 ? "item" : "itens"}</Badge>
        </div>

        {isComplete ? (
          <Card className="mx-auto max-w-2xl border-green-200 bg-green-50/40">
            <CardContent className="space-y-4 py-10 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
              <h2 className="text-2xl font-semibold">Pedido confirmado!</h2>
              <p className="text-sm text-muted-foreground">
                Seu pedido <strong>#{orderId}</strong> foi registrado com sucesso.
                Seus downloads estarão disponíveis em breve.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={() => setLocation("/downloads")}>Ir para downloads</Button>
                <Button variant="outline" onClick={() => setLocation("/products")}>Continuar comprando</Button>
              </div>
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card className="mx-auto max-w-2xl border-dashed">
            <CardContent className="space-y-4 py-10 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Seu carrinho está vazio</h2>
              <p className="text-sm text-muted-foreground">
                Adicione produtos antes de finalizar a compra.
              </p>
              <Button onClick={() => setLocation("/products")}>Ver produtos</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Dados do comprador</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (validationErrors.name) {
                        setValidationErrors((prev) => ({ ...prev, name: "" }));
                      }
                    }}
                    className={validationErrors.name ? "border-red-500" : ""}
                  />
                  {validationErrors.name && (
                    <p className="text-xs text-red-500">{validationErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationErrors.email) {
                        setValidationErrors((prev) => ({ ...prev, email: "" }));
                      }
                    }}
                    className={validationErrors.email ? "border-red-500" : ""}
                  />
                  {validationErrors.email && (
                    <p className="text-xs text-red-500">{validationErrors.email}</p>
                  )}
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Pagamento</p>
                  <p className="mt-1">
                    Integração Stripe será conectada no próximo passo. O pedido será registrado no sistema.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-muted-foreground">Qtd: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">
                        {(Number(item.product.price) * item.quantity).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span>Subtotal</span>
                  <span>
                    {totalPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Entrega</span>
                  <span>Digital imediata</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>
                    {totalPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
                <Button
                  className="w-full"
                  onClick={handleFinishPurchase}
                  disabled={createOrderMutation.isPending}
                >
                  <LockKeyhole className="mr-2 h-4 w-4" />
                  {createOrderMutation.isPending ? "Processando..." : "Confirmar pedido"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
