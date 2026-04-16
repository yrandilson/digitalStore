import { useState } from "react";
import { StorefrontLayout } from "@/components/StorefrontLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Package, ShoppingBag } from "lucide-react";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  completed: "Concluído",
  failed: "Falhou",
  refunded: "Reembolsado",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function Orders() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.orders.listMine.useQuery({
    page,
    limit: 10,
  });

  const orders = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Badge variant="outline" className="mb-3">Meus Pedidos</Badge>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de pedidos</h1>
          <p className="mt-2 text-muted-foreground">
            Acompanhe o status de todas as suas compras.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum pedido ainda</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Seus pedidos aparecerão aqui após finalizar uma compra.
              </p>
              <Button asChild>
                <a href="/products">Explorar produtos</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Pedido #{order.id}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || "bg-gray-100"}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {Number(order.totalAmount).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
                  Anterior
                </Button>
                <span className="flex items-center text-sm text-muted-foreground px-3">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages}>
                  Próximo
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
