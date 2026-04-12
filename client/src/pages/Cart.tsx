import { StorefrontLayout } from "@/components/StorefrontLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { Link } from "wouter";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

export default function Cart() {
  const { items, totalItems, totalPrice, updateItemQuantity, removeItem, clearCart } = useCart();

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="outline" className="mb-3">Carrinho</Badge>
            <h1 className="text-3xl font-bold tracking-tight">Resumo da compra</h1>
            <p className="mt-2 text-muted-foreground">Revise os produtos antes de seguir para o checkout.</p>
          </div>
          <Badge>{totalItems} itens</Badge>
        </div>

        {items.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="mb-4 h-10 w-10 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Seu carrinho está vazio</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Explore o catálogo e adicione produtos digitais para montar seu pedido.
              </p>
              <Button asChild className="mt-6">
                <Link href="/products">Ver produtos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="h-24 w-24 overflow-hidden rounded-xl bg-muted">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">{item.product.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.product.description}</p>
                          </div>
                          <span className="font-semibold">
                            R$ {Number(item.product.price).toFixed(2)}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => updateItemQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Badge variant="secondary">{item.quantity}</Badge>
                          <Button variant="outline" size="icon" onClick={() => updateItemQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" className="ml-auto text-destructive hover:text-destructive" onClick={() => removeItem(item.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Resumo do pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Entrega</span>
                  <span>Digital imediata</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
                <Button className="w-full" asChild>
                  <Link href="/checkout">Ir para checkout</Link>
                </Button>
                <Button variant="outline" className="w-full" onClick={clearCart}>
                  Limpar carrinho
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
