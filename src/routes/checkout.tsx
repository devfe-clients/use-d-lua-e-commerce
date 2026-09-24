import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Barcode, Check, CreditCard, QrCode } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { createOrder, decrementStock } from "@/lib/orders";
import { OrderSummary } from "@/components/OrderSummary";
import { PAYMENT_LABELS, type PaymentMethod, type ShippingAddress } from "@/lib/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Use D'lua" },
      { name: "description", content: "Finalize sua compra na Use D'lua: entrega, pagamento e resumo." },
      { property: "og:title", content: "Checkout — Use D'lua" },
      { property: "og:description", content: "Finalize sua compra na Use D'lua." },
    ],
  }),
  component: CheckoutPage,
});

const STEPS = ["Entrega", "Pagamento", "Resumo"];
const inputCls =
  "w-full border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-gold";

const FIELDS: { key: keyof ShippingAddress; label: string; span?: boolean; optional?: boolean; type?: string }[] = [
  { key: "nome", label: "Nome completo", span: true },
  { key: "email", label: "E-mail", type: "email" },
  { key: "telefone", label: "Telefone", type: "tel" },
  { key: "cep", label: "CEP" },
  { key: "rua", label: "Rua" },
  { key: "numero", label: "Número" },
  { key: "complemento", label: "Complemento", optional: true },
  { key: "bairro", label: "Bairro" },
  { key: "cidade", label: "Cidade" },
  { key: "estado", label: "Estado (UF)" },
];

const PAYMENTS: { key: PaymentMethod; icon: typeof CreditCard; hint: string }[] = [
  { key: "cartao", icon: CreditCard, hint: "Em até 6x sem juros" },
  { key: "pix", icon: QrCode, hint: "Aprovação imediata" },
  { key: "boleto", icon: Barcode, hint: "Vence em 3 dias úteis" },
];

function CheckoutPage() {
  const { items, subtotal, discount, total, coupon, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [addr, setAddr] = useState<ShippingAddress>({
    nome: "", email: "", telefone: "", cep: "", rua: "", numero: "",
    complemento: "", bairro: "", cidade: "", estado: "",
  });
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [busy, setBusy] = useState(false);

  if (items.length === 0 && !busy) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-28 text-center">
        <h1 className="text-3xl">Sua sacola está vazia</h1>
        <Link to="/" className="btn-gold mt-8">Voltar para a loja</Link>
      </div>
    );
  }

  async function confirm() {
    if (!payment) return;
    setBusy(true);
    try {
      const order = await createOrder({
        usuarioId: user?.uid ?? null,
        itens: items,
        subtotal,
        desconto: discount,
        total,
        cupom: coupon?.code ?? null,
        enderecoEntrega: addr,
        formaPagamento: payment,
      });
      await decrementStock(items).catch(() => undefined);
      clear();
      navigate({ to: "/pedido/confirmacao", search: { pedido: order.id } });
    } catch (err) {
      setBusy(false);
      toast.error(err instanceof Error ? err.message : "Não foi possível confirmar o pedido.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <p className="eyebrow">Checkout</p>
      <h1 className="mt-2 text-4xl">Finalizar compra</h1>

      <ol className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.16em]">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                i <= step ? "border-gold bg-gold text-primary-foreground" : "border-border text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={i <= step ? "" : "text-muted-foreground"}>{s}</span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>

      <div className="mt-10 border border-border bg-card p-6 sm:p-8">
        {step === 0 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(1);
            }}
          >
            <h2 className="text-2xl">Dados de entrega</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <input
                  key={f.key}
                  type={f.type ?? "text"}
                  placeholder={f.label + (f.optional ? " (opcional)" : "")}
                  required={!f.optional}
                  value={addr[f.key] ?? ""}
                  onChange={(e) => setAddr({ ...addr, [f.key]: e.target.value })}
                  className={`${inputCls} ${f.span ? "sm:col-span-2" : ""}`}
                />
              ))}
            </div>
            <button type="submit" className="btn-gold mt-8 w-full sm:w-auto">Continuar para pagamento</button>
          </form>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-2xl">Forma de pagamento</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {PAYMENTS.map(({ key, icon: Icon, hint }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPayment(key)}
                  className={`flex flex-col items-center gap-3 border p-6 text-center transition ${
                    payment === key ? "border-gold bg-secondary" : "border-border hover:border-gold"
                  }`}
                >
                  <Icon className="h-7 w-7 text-gold" />
                  <span className="text-sm">{PAYMENT_LABELS[key]}</span>
                  <span className="text-xs text-muted-foreground">{hint}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Pagamento simulado — nenhuma cobrança será feita.</p>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setStep(0)} className="btn-outline-ink">Voltar</button>
              <button disabled={!payment} onClick={() => setStep(2)} className="btn-gold">Revisar pedido</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl">Resumo do pedido</h2>
            <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div className="bg-secondary p-4">
                <p className="eyebrow">Entrega</p>
                <p className="mt-2">{addr.nome}</p>
                <p className="text-muted-foreground">
                  {addr.rua}, {addr.numero} {addr.complemento} — {addr.bairro}, {addr.cidade}/{addr.estado} · {addr.cep}
                </p>
              </div>
              <div className="bg-secondary p-4">
                <p className="eyebrow">Pagamento</p>
                <p className="mt-2">{payment && PAYMENT_LABELS[payment]}</p>
              </div>
            </div>
            <div className="mt-6">
              <OrderSummary items={items} subtotal={subtotal} discount={discount} total={total} />
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline-ink" disabled={busy}>Voltar</button>
              <button onClick={() => void confirm()} className="btn-gold flex-1" disabled={busy}>
                {busy ? "Confirmando…" : "Confirmar pedido"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
