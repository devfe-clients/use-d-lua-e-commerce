import { useState, useEffect, type ComponentType } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Banknote, Check, CreditCard, QrCode } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { createOrder, decrementStock, setDeliveryPayment } from "@/lib/orders";
import { OrderSummary } from "@/components/OrderSummary";
import {
  DELIVERY_PAYMENT_LABELS,
  PAYMENT_LABELS,
  formatPrice,
  type DeliveryPaymentMethod,
  type Order,
  type PaymentMethod,
  type ShippingAddress,
} from "@/lib/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Use D'lua" },
      {
        name: "description",
        content: "Finalize sua compra na Use D'lua: entrega, pagamento e resumo.",
      },
      { property: "og:title", content: "Checkout — Use D'lua" },
      { property: "og:description", content: "Finalize sua compra na Use D'lua." },
    ],
  }),
  component: CheckoutPage,
});

const STEPS = ["Entrega", "Pagamento", "Resumo"];
const inputCls =
  "w-full border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-gold";

const FIELDS: {
  key: keyof ShippingAddress;
  label: string;
  span?: boolean;
  optional?: boolean;
  type?: string;
}[] = [
  { key: "nome", label: "Nome completo", span: true },
  { key: "telefone", label: "Telefone", type: "tel" },
  { key: "rua", label: "Rua" },
  { key: "numero", label: "Número" },
  { key: "complemento", label: "Complemento", optional: true },
  { key: "bairro", label: "Bairro" },
];

/** Entregador de moto com bolsa nas costas (mesmo estilo de traço do lucide). */
function DeliveryRiderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* rodas */}
      <circle cx="5" cy="18" r="2.5" />
      <circle cx="19" cy="18" r="2.5" />
      {/* moto: quadro, banco, garfo e guidão */}
      <path d="M5 18h6.5l2.5-4.5h2" />
      <path d="M6.5 14.5h5" />
      <path d="M19 18l-3-7h-1.5" />
      {/* piloto: cabeça, tronco, braço e perna */}
      <circle cx="11.5" cy="5" r="1.5" />
      <path d="M8.5 14L11 7.5" />
      <path d="M11 8.5l3.5 2.5" />
      <path d="M8.5 14l3 1.5-.5 2.5" />
      {/* bolsa nas costas */}
      <rect x="3.5" y="7" width="5" height="5.5" rx="1" />
    </svg>
  );
}

const PAYMENTS: {
  key: PaymentMethod;
  icon: ComponentType<{ className?: string }>;
  hint: string;
}[] = [
  { key: "cartao", icon: CreditCard, hint: "Em até 6x sem juros" },
  { key: "pix", icon: QrCode, hint: "Aprovação imediata" },
  { key: "entrega", icon: DeliveryRiderIcon, hint: "Pague quando receber" },
];

const DELIVERY_OPTIONS: {
  key: DeliveryPaymentMethod;
  icon: ComponentType<{ className?: string }>;
  hint: string;
}[] = [
  { key: "cartao", icon: CreditCard, hint: "Crédito ou débito" },
  { key: "dinheiro", icon: Banknote, hint: "Pague em espécie" },
  { key: "pix", icon: QrCode, hint: "Pague na hora" },
];

/** Tela exibida depois de confirmar um pedido "Pagar na entrega". */
function DeliveryPaymentScreen({ order }: { order: Order }) {
  const [choice, setChoice] = useState<DeliveryPaymentMethod | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function finish() {
    if (!choice) return;
    setBusy(true);
    try {
      await setDeliveryPayment(order.id, choice);
      // Email de confirmacao, sem await para nao travar o fluxo
      fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      }).catch(() => undefined);
      setDone(true);
    } catch {
      toast.error("Nao foi possivel salvar a forma de pagamento. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  if (done && choice) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-28 text-center">
        <p className="eyebrow">Pedido confirmado</p>
        <h1 className="mt-2 text-4xl">Recebemos seu pedido!</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Pedido nº {order.id} · Pagamento na entrega: {DELIVERY_PAYMENT_LABELS[choice]} ·{" "}
          {formatPrice(order.total)}
        </p>
        <Link to="/" className="btn-gold mt-8">
          Voltar para a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <p className="eyebrow">Pedido nº {order.id}</p>
      <h1 className="mt-2 text-4xl">Como você vai pagar?</h1>

      <div className="mt-10 border border-border bg-card p-6 sm:p-8">
        <h2 className="text-2xl">Pagamento na entrega</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Total a pagar: {formatPrice(order.total)}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {DELIVERY_OPTIONS.map(({ key, icon: Icon, hint }) => (
            <button
              key={key}
              type="button"
              onClick={() => setChoice(key)}
              className={`flex flex-col items-center gap-3 border p-6 text-center transition ${
                choice === key ? "border-gold bg-secondary" : "border-border hover:border-gold"
              }`}
            >
              <Icon className="h-7 w-7 text-gold" />
              <span className="text-sm">{DELIVERY_PAYMENT_LABELS[key]}</span>
              <span className="text-xs text-muted-foreground">{hint}</span>
            </button>
          ))}
        </div>
        <div className="mt-8">
          <button
            disabled={!choice || busy}
            onClick={() => void finish()}
            className="btn-gold w-full sm:w-auto"
          >
            {busy ? "Salvando…" : "Finalizar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckoutPage() {
  const { items, subtotal, discount, total, coupon, clear } = useCart();
  // Pega também o loading para não redirecionar antes do Firebase confirmar a sessão
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [addr, setAddr] = useState<ShippingAddress>({
    nome: "",
    telefone: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
  });
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [busy, setBusy] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Redireciona para o login se o usuário não estiver autenticado.
  // O loading evita redirecionar enquanto o Firebase ainda está verificando a sessão.
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/conta" });
    }
  }, [user, loading, navigate]);

  // Enquanto o Firebase verifica a sessão, não renderiza nada para evitar flash de conteúdo
  if (loading) return null;

  // Pedido "Pagar na entrega" já criado: mostra a tela de escolha do pagamento
  if (placedOrder) return <DeliveryPaymentScreen order={placedOrder} />;

  if (items.length === 0 && !busy) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-28 text-center">
        <h1 className="text-3xl">Sua sacola está vazia</h1>
        <Link to="/" className="btn-gold mt-8">
          Voltar para a loja
        </Link>
      </div>
    );
  }

  async function confirm() {
    if (!payment) return;
    setBusy(true);
    try {
      // 1. Cria o pedido no Firestore com status pending
      const order = await createOrder({
        usuarioId: user?.uid ?? null,
        usuarioEmail: user?.email ?? null,
        itens: items,
        subtotal,
        desconto: discount,
        total,
        cupom: coupon?.code ?? null,
        enderecoEntrega: addr,
        formaPagamento: payment,
      });

      // Pagar na entrega: nao passa pelo Mercado Pago. Baixa o estoque, limpa a
      // sacola e abre a tela onde o cliente escolhe como vai pagar ao receber.
      if (payment === "entrega") {
        await decrementStock(items).catch(() => undefined);
        clear();
        setPlacedOrder(order);
        return;
      }

      // 2. Chama a Vercel Function para criar a preferencia no Mercado Pago
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itens: items,
          orderId: order.id,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? "Erro ao criar checkout.");
      }

      const { checkoutUrl } = await response.json();

      // 3. Limpa o carrinho antes de redirecionar
      await decrementStock(items).catch(() => undefined);
      clear();

      // 4. Dispara o email de confirmacao, sem await para nao travar o fluxo
      fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      }).catch(() => undefined); // erro no email nao quebra o pedido

      // 5. Redireciona para o Mercado Pago
      window.location.href = checkoutUrl;
    } catch (err) {
      setBusy(false);
      toast.error(err instanceof Error ? err.message : "Nao foi possivel confirmar o pedido.");
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
                i <= step
                  ? "border-gold bg-gold text-primary-foreground"
                  : "border-border text-muted-foreground"
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
            <button type="submit" className="btn-gold mt-8 w-full sm:w-auto">
              Continuar para pagamento
            </button>
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
            <div className="mt-8 flex gap-3">
              <button onClick={() => setStep(0)} className="btn-outline-ink">
                Voltar
              </button>
              <button disabled={!payment} onClick={() => setStep(2)} className="btn-gold">
                Revisar pedido
              </button>
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
                  {addr.rua}, {addr.numero} {addr.complemento} — {addr.bairro}
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
              <button onClick={() => setStep(1)} className="btn-outline-ink" disabled={busy}>
                Voltar
              </button>
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
