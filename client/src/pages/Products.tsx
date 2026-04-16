import { useState, useMemo } from "react";
import { StorefrontLayout } from "@/components/StorefrontLayout";
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
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export default function Products() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "price-asc" | "price-desc" | "rating">(
    "newest"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = trpc.products.list.useQuery({
    page,
    limit,
    categoryId,
    sortBy,
  });

  // Fetch categories
  const { data: categories } = trpc.products.categories.useQuery();

  // Search products (debounced)
  const { data: searchResults, isLoading: searchLoading } = trpc.products.search.useQuery(
    { query: debouncedSearch, limit: 20 },
    { enabled: debouncedSearch.length > 2 }
  );

  const displayProducts = debouncedSearch.length > 2 ? searchResults : productsData?.data;
  const isPaginated = debouncedSearch.length <= 2;
  const totalPages = productsData?.pagination?.totalPages || 1;

  // Generate smart pagination numbers with ellipsis
  const paginationNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [1];

    if (page > 3) pages.push("...");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) pages.push("...");

    pages.push(totalPages);
    return pages;
  }, [page, totalPages]);

  return (
    <StorefrontLayout>
      <div className="bg-muted/30 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Catálogo de Produtos</h1>
          <p className="text-muted-foreground">
            Explore nossa seleção de produtos digitais premium
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 pt-8">
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
            {Array.from({ length: limit }).map((_, i) => (
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
              {displayProducts.map((product: any) => (
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

            {/* Pagination with ellipsis */}
            {isPaginated && productsData?.pagination && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Anterior
                </Button>

                <div className="flex gap-1">
                  {paginationNumbers.map((pageNum, idx) =>
                    pageNum === "..." ? (
                      <span key={`ellipsis-${idx}`} className="flex items-center px-2 text-muted-foreground">
                        …
                      </span>
                    ) : (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-9 h-9 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
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
    </StorefrontLayout>
  );
}
