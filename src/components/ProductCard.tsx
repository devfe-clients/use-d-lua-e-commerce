import { Link } from "@tanstack/react-router";
import { ProductImage } from "./ProductImage";
import { effectivePrice, formatPrice, isLowStock, type Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const price = effectivePrice(product);
  const hasSale = Boolean(product.salePrice && product.salePrice > 0);
  const low = isLowStock(product.stock);
  const soldOut = product.stock <= 0;

  return (
    <Link
      to="/produto/$id"
      params={{ id: product.slug }}
      className="group block"
      aria-label={product.name}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <ProductImage src={product.images[0]} alt={product.name} className="transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute left-0 top-3 flex flex-col gap-1">
          {hasSale && !soldOut && (
            <span className="bg-ink px-3 py-1 text-[0.6rem] uppercase tracking-[0.18em] text-background">
              Promoção
            </span>
          )}
          {low && (
            <span className="bg-destructive px-3 py-1 text-[0.6rem] uppercase tracking-[0.18em] text-destructive-foreground">
              Últimas unidades!
            </span>
          )}
          {soldOut && (
            <span className="bg-muted px-3 py-1 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              Esgotado
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-base font-normal tracking-wide text-foreground">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          {hasSale && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          )}
          <span className="text-sm tracking-wide text-foreground">{formatPrice(price)}</span>
        </div>
      </div>
    </Link>
  );
}
