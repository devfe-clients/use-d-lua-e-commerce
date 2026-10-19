import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

export function ProductGrid({
  products,
  carousel = false,
}: {
  products: Product[];
  carousel?: boolean;
}) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        Nenhuma peça encontrada com esses filtros.
      </p>
    );
  }
  if (carousel) {
    return (
      <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-pl-4 px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:scroll-pl-6 sm:px-6 lg:-mx-8 lg:scroll-pl-8 lg:px-8">
        {products.map((p) => (
          <div
            key={p.id}
            className="w-[44%] shrink-0 snap-start sm:w-[30%] md:w-[calc((100%_-_2.5rem)/3)] lg:w-[calc((100%_-_3.75rem)/4)]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
