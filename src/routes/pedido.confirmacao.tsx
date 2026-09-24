import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { fetchOrder } from "@/lib/orders";
import { OrderSummary } from "@/components/OrderSummary";
import { PAYMENT_LABELS, STATUS_LABELS, type Order } from "@/lib/types";

export const Route = createFileRoute("/pedido/confirmacao")({
  validateSearch: (s: Record<string, unknown>) => ({ pedido: typeof s.pedido === "string" ? s.pedido : "" }),
  head: () => ({
    meta: [
      { title: "Pedido confirmado — Use D'lua" },
      { name: "description", content: "Seu pedido na Use D'lua foi recebido com sucesso." },
      { property: "og:title", content: "Pedido confirmado — Use D'lua" },
      { property: "og:description", content: "Seu pedido na Use D'lua foi recebido com sucesso." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { pedido } = Route.useSearch();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder(pedido).then(setOrder).catch(() => setOrder(null)).finally(() => setLoading(false));
  }, [pedido]);

  if (loading) return <p className="py-32 text-center text-sm text-muted-foreground">Carregando…</p>;
  if (!order)
    return (
      <div className="py-32 text-center">
        <h1 className="text-3xl">Pedido não encontrado</h1>
        <Link to="/" className="btn-gold mt-8">Voltar para a loja</Link>
      </div>
    );

  const a = order.enderecoEntrega;
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-gold" strokeWidth={1.2} />
        <p className="eyebrow mt-6">Obrigada pela compra</p>
        <h1 className="mt-2 text-4xl">Pedido confirmado</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Número do pedido: <span className="font-medium text-foreground">{order.id}</span>
        </p>
        <span className="mt-4 inline-block bg-secondary px-3 py-1 text-xs uppercase tracking-[0.16em]">
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="mt-10 grid gap-4 text-sm sm:grid-cols-2">
        <div className="border border-border bg-card p-5">
          <p className="eyebrow">Endereço de entrega</p>
          <p className="mt-2">{a.nome}</p>
          <p className="text-muted-foreground">
            {a.rua}, {a.numero} {a.complemento}<br />
            {a.bairro} — {a.cidade}/{a.estado}<br />CEP {a.cep}
          </p>
        </div>
        <div className="border border-border bg-card p-5">
          <p className="eyebrow">Forma de pagamento</p>
          <p className="mt-2">{PAYMENT_LABELS[order.formaPagamento]}</p>
        </div>
      </div>

      <div className="mt-6 border border-border bg-card p-5">
        <p className="eyebrow">Resumo da compra</p>
        <OrderSummary items={order.itens} subtotal={order.subtotal} discount={order.desconto} total={order.total} />
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/" className="btn-outline-ink">Continuar comprando</Link>
        <Link to="/rastreamento" search={{ pedido: order.id }} className="btn-gold">Acompanhar pedido</Link>
      </div>
    </div>
  );
}
