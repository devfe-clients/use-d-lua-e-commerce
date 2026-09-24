import { ProductImage } from "@/components/ProductImage";
import { formatPrice, type CartItem } from "@/lib/types";

export function OrderSummary({
  items,
  subtotal,
  discount,
  total,
}: {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
}) {
  return (
    <div>
      <ul className="divide-y divide-border">
        {items.map((i) => (
          <li key={`${i.productId}-${i.size}-${i.color}`} className="flex gap-4 py-4">
            <div className="h-20 w-16 shrink-0 overflow-hidden bg-secondary">
              <ProductImage src={i.image} alt={i.name} label="Foto" />
            </div>
            <div className="flex flex-1 justify-between gap-3 text-sm">
              <div>
                <p>{i.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tam. {i.size} · {i.color} · Qtd. {i.quantity}
                </p>
              </div>
              <span>{formatPrice(i.price * i.quantity)}</span>
            </div>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Desconto</dt>
            <dd>-{formatPrice(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-2 text-base">
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
    </div>
  );
}
