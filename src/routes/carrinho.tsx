import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { ProductImage } from "@/components/ProductImage";
import { formatPrice } from "@/lib/types";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho — Use D'lua" },
      { name: "description", content: "Revise as peças da sua sacola antes de finalizar." },
      { property: "og:title", content: "Carrinho — Use D'lua" },
      { property: "og:description", content: "Revise as peças da sua sacola antes de finalizar." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const {
    items,
    subtotal,
    discount,
    total,
    coupon,
    couponError,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const [code, setCode] = useState("");

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-28 text-center">
        <h1 className="text-3xl">Sua sacola está vazia</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Explore nossas peças e encontre a sua próxima favorita.
        </p>
        <Link to="/categoria/$slug" params={{ slug: "blusas" }} className="btn-gold mt-8">
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">Sacola</p>
      <h1 className="mt-2 text-4xl">Carrinho de compras</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <ul className="divide-y divide-border border-y border-border">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.size}-${item.color}`}
              className="flex gap-4 py-6"
            >
              <Link
                to="/produto/$id"
                params={{ id: item.slug }}
                className="h-28 w-20 shrink-0 overflow-hidden bg-secondary"
              >
                <ProductImage src={item.image} alt={item.name} label="Foto" />
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm">{item.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tamanho {item.size} · {item.color}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Unitário {formatPrice(item.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                    aria-label="Remover item"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center border border-border">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.size, item.color, item.quantity - 1)
                      }
                      className="px-3 py-1.5"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                      }
                      className="px-3 py-1.5"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-sm">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit border border-border bg-card p-6">
          <h2 className="text-xl">Resumo</h2>

          <form
            className="mt-6"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await applyCoupon(code);
              if (ok) toast.success("Cupom aplicado!");
            }}
          >
            <label className="eyebrow">Cupom de desconto</label>
            <div className="mt-2 flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Digite o cupom"
                className="w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
              />
              <button type="submit" className="btn-outline-ink px-4 py-2">
                Aplicar
              </button>
            </div>
            {couponError && <p className="mt-2 text-xs text-destructive">{couponError}</p>}
            {coupon && (
              <p className="mt-2 text-xs text-muted-foreground">
                Cupom {coupon.code} aplicado.{" "}
                <button type="button" onClick={removeCoupon} className="underline">
                  remover
                </button>
              </p>
            )}
          </form>

          <dl className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Desconto</dt>
              <dd>-{formatPrice(discount)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>

          <button
            className="btn-gold mt-6 w-full"
            onClick={() => toast("Checkout em breve", { description: "O fluxo de pagamento será configurado na próxima etapa." })}
          >
            Finalizar compra
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Frete e pagamento na próxima etapa.
          </p>
        </aside>
      </div>
    </div>
  );
}
