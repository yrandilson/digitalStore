import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Search } from "lucide-react";

export default function Products() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "price-asc" | "price-desc" | "rating">(
    "newest"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = trpc.products.list.useQuery({
    page,
    limit,
    categoryId,
    sortBy,
  });

  // Fetch categories
  const { data: categories } = trpc.products.categories.useQuery();

  // Search products
  const { data: searchResults, isLoading: searchLoading } = trpc.products.search.useQuery(
    { query: searchQuery, limit: 20 },
    { enabled: searchQuery.length > 2 }
  );

  const displayProducts = searchQuery.length > 2 ? searchResults : productsData?.data;
  const isPaginated = searchQuery.length <= 2;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-blue-50 dark:bg-slate-900 py-8 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Catálogo de Produtos</h1>
          <p className="text-muted-foreground">
            Explore nossa seleção de produtos digitais premium
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* Filters Section */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <Input
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Category Filter */}
            {categories && categories.length > 0 && (
              <Select
                value={categoryId?.toString() || "all"}
                onValueChange={(value) => {
                  setCategoryId(value === "all" ? undefined : parseInt(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Sort Filter */}
            <Select value={sortBy} onValueChange={(value: any) => {
              setSortBy(value);
              setPage(1);
            }}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais Recente</SelectItem>
                <SelectItem value="popular">Mais Popular</SelectItem>
                <SelectItem value="price-asc">Menor Preço</SelectItem>
                <SelectItem value="price-desc">Maior Preço</SelectItem>
                <SelectItem value="rating">Melhor Avaliação</SelectItem>
              </SelectContent>
            </Select>

            {/* Items per page */}
            <Select value={limit.toString()} onValueChange={(value) => {
              setLimit(parseInt(value));
              setPage(1);
            }}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Itens por página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 itens</SelectItem>
                <SelectItem value="12">12 itens</SelectItem>
                <SelectItem value="24">24 itens</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {(productsLoading || searchLoading) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!productsLoading && !searchLoading && displayProducts && displayProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  featured={product.featured}
                />
              ))}
            </div>

            {/* Pagination */}
            {isPaginated && productsData?.pagination && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Anterior
                </Button>

                <div className="flex gap-1">
                  {Array.from({
                    length: Math.min(5, productsData.pagination.totalPages),
                  }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        onClick={() => setPage(pageNum)}
                        className="w-10 h-10 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= productsData.pagination.totalPages}
                >
                  Próximo
                </Button>
              </div>
            )}
          </>
        ) : (
          !productsLoading &&
          !searchLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Nenhum produto encontrado</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
