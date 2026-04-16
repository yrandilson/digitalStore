import { StorefrontLayout } from "@/components/StorefrontLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Package2, Settings2, ShoppingBag, UserCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const { data: ordersData, isLoading: ordersLoading } = trpc.orders.listMine.useQuery({
    page: 1,
    limit: 50,
  });
  const { data: downloadsData, isLoading: downloadsLoading } = trpc.downloads.listMine.useQuery({
    page: 1,
    limit: 50,
  });

  const isLoading = loading || ordersLoading || downloadsLoading;

  const fullName = user?.name || "Usuário";
  const email = user?.email || "Sem email";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "US";

  const totalOrders = ordersData?.pagination.total ?? 0;
  const totalDownloads = downloadsData?.length ?? 0;
  const totalDownloadActions = (downloadsData ?? []).reduce((acc, item) => acc + (item.downloadCount ?? 0), 0);

  const profileStats = [
    { label: "Pedidos", value: String(totalOrders) },
    { label: "Arquivos", value: String(totalDownloads) },
    { label: "Downloads", value: String(totalDownloadActions) },
  ];

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{fullName}</h1>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
              <Badge variant={user?.role === "admin" ? "default" : "secondary"}>
                {user?.role === "admin" ? "Administrador" : "Cliente"}
              </Badge>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/orders">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Ver pedidos
                </Link>
              </Button>
              <Button variant="ghost" className="w-full" onClick={logout}>
                <Settings2 className="mr-2 h-4 w-4" />
                Sair da conta
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {isLoading
                ? Array.from({ length: 3 }).map((_, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-6">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="mt-3 h-8 w-12" />
                      </CardContent>
                    </Card>
                  ))
                : profileStats.map((stat) => (
                    <Card key={stat.label}>
                      <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                      </CardContent>
                    </Card>
                  ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Atalhos da conta</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/orders">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Meus pedidos
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/downloads">
                    <Package2 className="mr-2 h-4 w-4" />
                    Meus downloads
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/products">
                    <UserCircle2 className="mr-2 h-4 w-4" />
                    Explorar produtos
                  </Link>
                </Button>
                {user?.role === "admin" ? (
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/dashboard">
                      <Settings2 className="mr-2 h-4 w-4" />
                      Painel admin
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/cart">
                      <Settings2 className="mr-2 h-4 w-4" />
                      Ir para carrinho
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
