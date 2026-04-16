import { StorefrontLayout } from "@/components/StorefrontLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Download, FileDown, Package } from "lucide-react";
import { toast } from "sonner";

export default function Downloads() {
  const { data: downloads, isLoading } = trpc.downloads.listMine.useQuery({
    page: 1,
    limit: 50,
  });

  const recordMutation = trpc.downloads.recordDownload.useMutation({
    onSuccess: () => {
      toast.success("Download iniciado!");
    },
  });

  const handleDownload = (downloadId: number) => {
    recordMutation.mutate({ downloadId });
    // In production, this would also trigger actual file download via presigned URL
  };

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Badge variant="outline" className="mb-3">Meus Downloads</Badge>
          <h1 className="text-3xl font-bold tracking-tight">Arquivos adquiridos</h1>
          <p className="mt-2 text-muted-foreground">
            Todos os produtos digitais que você comprou estão disponíveis aqui.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : !downloads || downloads.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum download disponível</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Seus arquivos aparecerão aqui após finalizar uma compra.
              </p>
              <Button asChild>
                <a href="/products">Explorar produtos</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {downloads.map((item) => (
              <Card key={item.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
                    {item.productImageUrl ? (
                      <img
                        src={item.productImageUrl}
                        alt={item.productName}
                        loading="lazy"
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <FileDown className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{item.productName}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      {item.fileName && <span>{item.fileName}</span>}
                      {item.fileSize && (
                        <span>{(item.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      )}
                      <span>Pedido #{item.orderId}</span>
                      <span>{item.downloadCount ?? 0} downloads</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleDownload(item.id)}
                    disabled={recordMutation.isPending}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
