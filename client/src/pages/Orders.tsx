import { StorefrontLayout } from "@/components/StorefrontLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const orders = [
  { id: "#4581", date: "12/04/2026", items: 3, total: "R$ 149,90", status: "Pago" },
  { id: "#4472", date: "06/04/2026", items: 1, total: "R$ 49,90", status: "Processando" },
  { id: "#4398", date: "21/03/2026", items: 2, total: "R$ 89,90", status: "Concluído" },
];

export default function Orders() {
  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Badge variant="outline" className="mb-3">Pedidos</Badge>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de compras</h1>
          <p className="mt-2 text-muted-foreground">Acompanhe status, valores e quantidade de itens.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Últimos pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>{order.total}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{order.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </StorefrontLayout>
  );
}
