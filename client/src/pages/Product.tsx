import { useState } from "react";
import { Link, useRoute } from "wouter";
import { StorefrontLayout } from "@/components/StorefrontLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { Star, ShoppingCart, Download, Share2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Product() {
  const [, params] = useRoute("/products/:slug");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  const slug = params?.slug as string;

  // Fetch product by slug
  const { data: product, isLoading, error } = trpc.products.bySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <StorefrontLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  if (error || !product) {
    return (
      <StorefrontLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Produto não encontrado</AlertDescription>
          </Alert>
        </div>
      </StorefrontLayout>
    );
  }

  const price = parseFloat(product.price).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const ratingValue = product.rating ? parseFloat(product.rating) : 0;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      addItem(
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          imageUrl: product.imageUrl,
        },
        quantity
      );
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <StorefrontLayout>
      {/* Breadcrumb */}
      <div className="bg-muted py-4 mb-8">
        <div className="container mx-auto px-4">
          <div className="text-sm text-muted-foreground">
            <Link href="/" className="hover:underline">Início</Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:underline">Produtos</Link>
            <span className="mx-2">/</span>
            <span>{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="flex flex-col">
            <div className="relative bg-muted rounded-lg overflow-hidden h-96 flex items-center justify-center mb-4">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground">Sem imagem</div>
              )}
              {product.featured && (
                <Badge className="absolute top-4 left-4 bg-yellow-500 hover:bg-yellow-600">
                  Em Destaque
                </Badge>
              )}
            </div>

            {/* Preview Link */}
            {product.previewUrl && (
              <Button variant="outline" className="mb-4">
                <Download size={18} className="mr-2" />
                Visualizar Demo
              </Button>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Title and Rating */}
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i < Math.round(ratingValue)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {ratingValue.toFixed(1)} ({product.reviewCount} avaliações)
              </span>
              <span className="text-sm text-muted-foreground">
                {product.salesCount} vendas
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">{price}</div>
              {product.fileSize && (
                <p className="text-sm text-muted-foreground">
                  Tamanho do arquivo: {(product.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>

            {/* Add to Cart */}
            <Card className="p-6 mb-6 bg-blue-50 dark:bg-slate-900 border-blue-200 dark:border-slate-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    −
                  </Button>
                  <span className="px-4 py-2 w-12 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                <ShoppingCart size={20} className="mr-2" />
                {isAdding ? "Adicionando..." : "Adicionar ao Carrinho"}
              </Button>
            </Card>

            {/* Share */}
            <Button variant="outline" className="w-full mb-6">
              <Share2 size={18} className="mr-2" />
              Compartilhar
            </Button>

            {/* Description */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {product.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Conteúdo Completo</h3>
                <p className="text-sm text-muted-foreground max-h-40 overflow-y-auto">
                  {product.longDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="text-center">
              <Download size={32} className="mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">Download Digital</h3>
              <p className="text-sm text-muted-foreground">
                Acesso instantâneo após a compra
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <Star size={32} className="mx-auto mb-4 text-yellow-500" />
              <h3 className="font-semibold mb-2">Alta Qualidade</h3>
              <p className="text-sm text-muted-foreground">
                Conteúdo profissional verificado
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <ShoppingCart size={32} className="mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold mb-2">Sem Preocupações</h3>
              <p className="text-sm text-muted-foreground">
                Garantia de 7 dias de reembolso
              </p>
            </div>
          </Card>
        </div>
      </div>
    </StorefrontLayout>
  );
}
