import { useState } from "react";
import { Link, useRoute } from "wouter";
import { StorefrontLayout } from "@/components/StorefrontLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Star, ShoppingCart, Download, Share2, AlertCircle, Check, MessageSquare } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function Product() {
  const [, params] = useRoute("/products/:slug");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");

  const slug = params?.slug as string;

  // Fetch product by slug
  const { data: product, isLoading, error } = trpc.products.bySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  // Fetch reviews
  const { data: reviewsData, isLoading: reviewsLoading } = trpc.reviews.byProduct.useQuery(
    { productId: product?.id ?? 0, page: 1, limit: 10 },
    { enabled: !!product?.id }
  );

  const utils = trpc.useUtils();

  const createReviewMutation = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("Avaliação enviada com sucesso!");
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
      if (product) {
        utils.reviews.byProduct.invalidate({ productId: product.id });
        utils.products.bySlug.invalidate({ slug });
      }
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao enviar avaliação");
    },
  });

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

  const handleAddToCart = () => {
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
      toast.success("Adicionado ao carrinho", {
        description: `${product.name} × ${quantity}`,
        icon: <Check className="h-4 w-4" />,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || "Confira este produto!",
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  const handleSubmitReview = () => {
    if (!user) {
      toast.error("Faça login para avaliar");
      return;
    }
    createReviewMutation.mutate({
      productId: product.id,
      rating: reviewRating,
      title: reviewTitle || undefined,
      comment: reviewComment || undefined,
    });
  };

  const reviews = reviewsData?.data ?? [];

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
                  loading="lazy"
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
              <Button variant="outline" className="mb-4" asChild>
                <a href={product.previewUrl} target="_blank" rel="noopener noreferrer">
                  <Download size={18} className="mr-2" />
                  Visualizar Demo
                </a>
              </Button>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
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
            <Button variant="outline" className="w-full mb-6" onClick={handleShare}>
              <Share2 size={18} className="mr-2" />
              Compartilhar
            </Button>

            {/* Description */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-sm text-muted-foreground">
                  {product.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Conteúdo Completo</h3>
                <p className="text-sm text-muted-foreground max-h-40 overflow-y-auto whitespace-pre-line">
                  {product.longDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
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

        {/* Reviews Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6" />
            <h2 className="text-2xl font-bold">
              Avaliações ({reviewsData?.pagination?.total ?? 0})
            </h2>
          </div>

          {/* Write Review Form */}
          {user ? (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Escreva sua avaliação</h3>
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Nota</Label>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReviewRating(i + 1)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={
                            i < reviewRating
                              ? "fill-yellow-400 text-yellow-400 cursor-pointer"
                              : "text-muted-foreground cursor-pointer hover:text-yellow-300"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="reviewTitle">Título (opcional)</Label>
                  <Input
                    id="reviewTitle"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Resuma sua experiência"
                  />
                </div>
                <div>
                  <Label htmlFor="reviewComment">Comentário (opcional)</Label>
                  <Textarea
                    id="reviewComment"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Descreva o que achou do produto..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleSubmitReview} disabled={createReviewMutation.isPending}>
                  {createReviewMutation.isPending ? "Enviando..." : "Enviar avaliação"}
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center border-dashed">
              <p className="text-muted-foreground mb-3">Faça login para avaliar este produto</p>
              <Button asChild variant="outline">
                <Link href="/login">Entrar</Link>
              </Button>
            </Card>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{review.userName || "Anônimo"}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Compra verificada
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {review.title && (
                    <h4 className="font-medium text-sm mt-2">{review.title}</h4>
                  )}
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6">
              Nenhuma avaliação ainda. Seja o primeiro a avaliar!
            </p>
          )}
        </div>
      </div>
    </StorefrontLayout>
  );
}
