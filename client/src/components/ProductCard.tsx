import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  id: number;
  slug: string;
  name: string;
  price: string;
  imageUrl?: string | null;
  rating?: string;
  reviewCount?: number;
  category?: string;
  featured?: boolean;
}

export function ProductCard({
  id,
  slug,
  name,
  price,
  imageUrl,
  rating,
  reviewCount = 0,
  category,
  featured,
}: ProductCardProps) {
  const formattedPrice = parseFloat(price).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const ratingValue = rating ? parseFloat(rating) : 0;

  return (
    <Link href={`/products/${slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col">
        {/* Product Image */}
        <div className="relative overflow-hidden bg-muted h-48 w-full flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="text-muted-foreground text-sm">Sem imagem</div>
          )}

          {/* Featured Badge */}
          {featured && (
            <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
              Em Destaque
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Category Badge */}
          {category && (
            <Badge variant="outline" className="w-fit mb-2 text-xs">
              {category}
            </Badge>
          )}

          {/* Product Name */}
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>

          {/* Rating */}
          {ratingValue > 0 && (
            <div className="flex items-center gap-1 mb-3">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.round(ratingValue)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({reviewCount})
              </span>
            </div>
          )}

          {/* Price and Button */}
          <div className="mt-auto flex items-center justify-between">
            <span className="text-lg font-bold text-blue-600">
              {formattedPrice}
            </span>
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Add to cart functionality
              }}
            >
              <ShoppingCart size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
