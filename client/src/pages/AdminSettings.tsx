import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettings() {
  return (
    <DashboardLayout>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Identidade da loja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Nome da loja</Label>
              <Input id="store-name" defaultValue="Digital Store" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-bio">Descrição</Label>
              <Textarea id="store-bio" defaultValue="Produtos digitais premium com entrega imediata." />
            </div>
            <Button>Salvar alterações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stripe">Stripe</Label>
              <Input id="stripe" placeholder="Chave pública" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firebase">Firebase</Label>
              <Input id="firebase" placeholder="Project ID" />
            </div>
            <Button variant="outline">Salvar integrações</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
