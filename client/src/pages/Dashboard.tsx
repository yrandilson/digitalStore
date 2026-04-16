import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { ArrowUpRight, DollarSign, Package2, ReceiptText, Users } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: orderStats, isLoading: ordersLoading } = trpc.orders.stats.useQuery();
  const { data: productStats, isLoading: productsLoading } = trpc.products.stats.useQuery();
  const { data: userStats, isLoading: usersLoading } = trpc.users.stats.useQuery();

  const isLoading = ordersLoading || productsLoading || usersLoading;

  const stats = [
    {
      label: "Receita",
      value: orderStats
        ? Number(orderStats.totalRevenue).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : "—",
      icon: DollarSign,
      detail: orderStats ? `${orderStats.completedOrders} concluídos` : "",
    },
    {
      label: "Pedidos",
      value: orderStats ? String(orderStats.totalOrders) : "—",
      icon: ReceiptText,
      detail: orderStats ? `${orderStats.pendingOrders} pendentes` : "",
    },
    {
      label: "Produtos",
      value: productStats ? String(productStats.totalProducts) : "—",
      icon: Package2,
      detail: productStats ? `${productStats.activeProducts} ativos` : "",
    },
    {
      label: "Usuários",
      value: userStats ? String(userStats.totalUsers) : "—",
      icon: Users,
      detail: "",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <Badge className="mb-3">Dashboard</Badge>
          <h1 className="text-3xl font-bold tracking-tight">Visão geral da operação</h1>
          <p className="mt-2 text-muted-foreground">Indicadores principais da loja digital e atalhos rápidos.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    {stat.detail && (
                      <p className="text-xs text-muted-foreground mt-1">{stat.detail}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Ações rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/products">
                <div className="rounded-xl border p-4 hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Gerenciar produtos</p>
                      <p className="text-sm text-muted-foreground">Criar, editar e remover itens</p>
                    </div>
                    <Package2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/orders">
                <div className="rounded-xl border p-4 hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Validar pedidos</p>
                      <p className="text-sm text-muted-foreground">Conferir pagamentos e status</p>
                    </div>
                    <ReceiptText className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/users">
                <div className="rounded-xl border p-4 hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Gerenciar usuários</p>
                      <p className="text-sm text-muted-foreground">Atualizar papel e permissões</p>
                    </div>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Resumo rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <p className="text-sm font-medium">Pedidos pendentes</p>
                      <p className="text-2xl font-bold">{orderStats?.pendingOrders ?? 0}</p>
                    </div>
                    <Badge variant={orderStats?.pendingOrders ? "default" : "secondary"}>
                      {orderStats?.pendingOrders ? "Ação necessária" : "Tudo em dia"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <p className="text-sm font-medium">Produtos ativos</p>
                      <p className="text-2xl font-bold">{productStats?.activeProducts ?? 0}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <p className="text-sm font-medium">Total de usuários</p>
                      <p className="text-2xl font-bold">{userStats?.totalUsers ?? 0}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
