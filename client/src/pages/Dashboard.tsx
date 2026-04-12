import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Package2, ReceiptText, Users } from "lucide-react";

const stats = [
  { label: "Receita", value: "R$ 18.420", delta: "+12%" },
  { label: "Pedidos", value: "142", delta: "+8%" },
  { label: "Produtos", value: "38", delta: "+4%" },
  { label: "Usuários", value: "1.284", delta: "+16%" },
];

export default function Dashboard() {
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
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <Badge variant="secondary">{stat.delta}</Badge>
                </div>
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
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Adicionar produto</p>
                    <p className="text-sm text-muted-foreground">Criar novo item digital</p>
                  </div>
                  <Package2 className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Validar pedidos</p>
                    <p className="text-sm text-muted-foreground">Conferir pagamentos recebidos</p>
                  </div>
                  <ReceiptText className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Gerenciar usuários</p>
                    <p className="text-sm text-muted-foreground">Atualizar papel e permissões</p>
                  </div>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Atividade recente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "Novo pedido pago de R$ 149,90",
                "Produto 'UI Kit Premium' atualizado",
                "Novo usuário admin cadastrado",
              ].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-xl border p-4">
                  <p className="text-sm">{item}</p>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
