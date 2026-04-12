import { StorefrontLayout } from "@/components/StorefrontLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileDown, ShieldCheck } from "lucide-react";

const downloads = [
  { name: "UI Kit Premium", type: "Template", expires: "30 dias", status: "Disponível" },
  { name: "Landing SaaS", type: "Página completa", expires: "25 dias", status: "Disponível" },
  { name: "Ebook de Vendas", type: "PDF", expires: "24 dias", status: "Atualizado" },
];

export default function Downloads() {
  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Badge variant="outline" className="mb-3">Downloads</Badge>
          <h1 className="text-3xl font-bold tracking-tight">Biblioteca de arquivos</h1>
          <p className="mt-2 text-muted-foreground">Área para baixar produtos digitais adquiridos.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {downloads.map((item) => (
            <Card key={item.name}>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{item.type}</span>
                  <Badge variant="secondary">{item.status}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  Expira em {item.expires}
                </div>
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar agora
                </Button>
                <Button variant="outline" className="w-full">
                  <FileDown className="mr-2 h-4 w-4" />
                  Ver detalhes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StorefrontLayout>
  );
}
