import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { fetchProduct } from "@/lib/catalog";
import { ProductImage } from "@/components/ProductImage";
import { useCart } from "@/lib/cart";
import {
  LOW_STOCK_THRESHOLD,
  effectivePrice,
  formatPrice,
  isLowStock,
  type Product,
} from "@/lib/types";

export const Route = createFileRoute("/produto/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Produto ${params.id} — Use D'lua` },
      { name: "description", content: "Detalhes da peça, tamanhos, cores e disponibilidade." },
      { property: "og:title", content: `Produto — Use D'lua` },
      {
        property: "og:description",
        content: "Detalhes da peça, tamanhos, cores e disponibilidade.",
      },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
  });

  if (isLoading) {
    return <p className="py-32 text-center text-sm text-muted-foreground">Carregando peça…</p>;
  }
  if (!product) {
    return <p className="py-32 text-center text-sm text-muted-foreground">Peça não encontrada.</p>;
  }
  return <ProductDetail product={product} />;
}

function ProductDetail({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const price = effectivePrice(product);
  const hasSale = Boolean(product.salePrice && product.salePrice > 0);
  const low = isLowStock(product.stock);
  const soldOut = product.stock <= 0;
  const gallery = product.images.length > 0 ? product.images : [undefined, undefined, undefined];

  function add() {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      ...(product.images[0] ? { image: product.images[0] } : {}),
      price,
      size,
      color,
      quantity,
      stock: product.stock,
    });
    toast.success("Peça adicionada à sacola");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-[3/4] overflow-hidden bg-secondary">
            <ProductImage src={gallery[activeImage]} alt={product.name} label="Foto do produto" />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`aspect-square overflow-hidden border ${
                  activeImage === i ? "border-gold" : "border-border"
                }`}
                aria-label={`Foto ${i + 1}`}
              >
                <ProductImage src={img} alt={`${product.name} ${i + 1}`} label="Foto" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow">{product.category}</p>
          <h1 className="mt-2 text-4xl">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            {hasSale && (
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="text-2xl">{formatPrice(price)}</span>
          </div>

          {low && (
            <p className="mt-4 inline-block bg-destructive px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-destructive-foreground">
              Últimas unidades! Restam {product.stock} de {LOW_STOCK_THRESHOLD}
            </p>
          )}
          {soldOut && (
            <p className="mt-4 inline-block bg-muted px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Esgotado
            </p>
          )}

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-8">
            <p className="eyebrow">Tamanho</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-11 border px-3 py-2 text-xs uppercase tracking-[0.12em] ${
                    size === s ? "border-ink bg-ink text-background" : "border-border"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="eyebrow">Cor</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`border px-3 py-2 text-xs uppercase tracking-[0.12em] ${
                    color === c ? "border-ink bg-ink text-background" : "border-border"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="eyebrow">Quantidade</p>
            <div className="mt-3 inline-flex items-center border border-border">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2"
                aria-label="Diminuir"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                className="px-3 py-2"
                aria-label="Aumentar"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={add} disabled={soldOut} className="btn-outline-ink flex-1">
              Adicionar ao carrinho
            </button>
            <button
              onClick={() => {
                add();
                navigate({ to: "/carrinho" });
              }}
              disabled={soldOut}
              className="btn-gold flex-1"
            >
              Comprar agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
