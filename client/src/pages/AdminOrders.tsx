import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  completed: "Concluído",
  failed: "Falhou",
  refunded: "Reembolsado",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  completed: "default",
  failed: "destructive",
  refunded: "secondary",
};

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.orders.listAll.useQuery({
    page,
    limit: 20,
    status: statusFilter === "all" ? undefined : statusFilter as any,
  });

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      utils.orders.listAll.invalidate();
      if (selectedOrderId) {
        utils.orders.byId.invalidate({ id: selectedOrderId });
      }
      toast.success("Status do pedido atualizado");
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao atualizar status");
    },
  });

  const orders = data?.data ?? [];
  const pagination = data?.pagination;

  const {
    data: selectedOrder,
    isLoading: detailsLoading,
  } = trpc.orders.byId.useQuery(
    { id: selectedOrderId ?? 0 },
    { enabled: selectedOrderId !== null }
  );

  const closeDetails = () => setSelectedOrderId(null);

  const formatCurrency = (value: string | number) =>
    Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <DashboardLayout>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Pedidos</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {pagination ? `${pagination.total} pedidos encontrados` : "Carregando..."}
            </p>
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
              <SelectItem value="refunded">Reembolsado</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhum pedido encontrado</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{order.customerName || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{order.customerEmail || "—"}</TableCell>
                      <TableCell>
                        {Number(order.totalAmount).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[order.status] || "secondary"}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={order.status}
                            onValueChange={(newStatus) => {
                              updateStatusMutation.mutate({
                                id: order.id,
                                status: newStatus as any,
                              });
                            }}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="completed">Concluído</SelectItem>
                              <SelectItem value="failed">Falhou</SelectItem>
                              <SelectItem value="refunded">Reembolsado</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOrderId(order.id)}
                          >
                            Detalhes
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={selectedOrderId !== null} onOpenChange={(open) => !open && closeDetails()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Pedido {selectedOrder ? `#${selectedOrder.id}` : ""}
            </DialogTitle>
            <DialogDescription>
              Informações completas do pedido, cliente e itens comprados.
            </DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : !selectedOrder ? (
            <p className="text-sm text-muted-foreground">Pedido não encontrado.</p>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4 space-y-2">
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedOrder.customerName || "—"}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customerEmail || "—"}</p>
                </div>
                <div className="rounded-lg border p-4 space-y-2">
                  <p className="text-sm text-muted-foreground">Pagamento</p>
                  <p className="font-medium">{formatCurrency(selectedOrder.totalAmount)}</p>
                  <Badge variant={statusVariants[selectedOrder.status] || "secondary"}>
                    {statusLabels[selectedOrder.status] || selectedOrder.status}
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground mb-3">Itens</p>
                <div className="space-y-2">
                  {selectedOrder.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum item neste pedido.</p>
                  ) : (
                    selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                      >
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">{formatCurrency(item.productPrice)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Criado em {new Date(selectedOrder.createdAt).toLocaleString("pt-BR")}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
