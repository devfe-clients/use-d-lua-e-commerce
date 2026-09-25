import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchOrder, fetchOrdersByUser, formatDateTime } from "@/lib/orders";
import { formatPrice, STATUS_LABELS, type Order, type OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/rastreamento")({
  validateSearch: (s: Record<string, unknown>) => ({ pedido: typeof s["pedido"] === "string" ? s["pedido"] : undefined }),
  head: () => ({
    meta: [
      { title: "Rastrear pedido — Use D'lua" },
      { name: "description", content: "Acompanhe cada etapa do seu pedido Use D'lua." },
      { property: "og:title", content: "Rastrear pedido — Use D'lua" },
      { property: "og:description", content: "Acompanhe cada etapa do seu pedido Use D'lua." },
    ],
  }),
  component: TrackingPage,
});

const TIMELINE: Exclude<OrderStatus, "cancelado">[] = ["pending", "separacao", "enviado", "entregue"];

function TrackingPage() {
  const { pedido } = Route.useSearch();
  const navigate = useNavigate({ from: "/rastreamento" });
  const { user, loading: authLoading } = useAuth();
  const [input, setInput] = useState(pedido ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "notfound">("idle");

  useEffect(() => {
    if (pedido) {
      setInput(pedido);
      setState("loading");
      fetchOrder(pedido)
        .then((o) => { setOrder(o); setState(o ? "idle" : "notfound"); })
        .catch(() => setState("notfound"));
    } else if (!authLoading && user) {
      // Logada sem número: busca automaticamente o pedido mais recente da cliente.
      fetchOrdersByUser(user.uid).then((list) => {
        if (list[0]) navigate({ search: { pedido: list[0].id }, replace: true });
      }).catch(() => undefined);
    }
  }, [pedido, user, authLoading, navigate]);

  const currentIdx = order ? TIMELINE.indexOf(order.status as (typeof TIMELINE)[number]) : -1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="eyebrow">Rastreamento</p>
      <h1 className="mt-2 text-4xl">Acompanhe seu pedido</h1>

      <form
        className="mt-8 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) navigate({ search: { pedido: input.trim().toUpperCase() } });
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Número do pedido"
          className="w-full border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
        <button type="submit" className="btn-gold px-6">Buscar</button>
      </form>

      {state === "loading" && <p className="mt-10 text-sm text-muted-foreground">Buscando…</p>}
      {state === "notfound" && <p className="mt-10 text-sm text-destructive">Pedido não encontrado. Confira o número.</p>}

      {order && state === "idle" && (
        <div className="mt-10 border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-wrap justify-between gap-2 text-sm">
            <p>Pedido <span className="font-medium">{order.id}</span></p>
            <p className="text-muted-foreground">{formatPrice(order.total)}</p>
          </div>

          {order.status === "cancelado" ? (
            <p className="mt-8 bg-red-100 p-4 text-sm text-red-800">Este pedido foi cancelado.</p>
          ) : (
            <ol className="mt-8">
              {TIMELINE.map((step, i) => {
                const done = i <= currentIdx;
                const date = order.historico?.[step] ?? (step === "pending" ? order.criadoEm : undefined);
                return (
                  <li key={step} className="relative flex gap-4 pb-8 last:pb-0">
                    {i < TIMELINE.length - 1 && (
                      <span className={`absolute left-[13px] top-7 h-full w-px ${i < currentIdx ? "bg-gold" : "bg-border"}`} />
                    )}
                    <span
                      className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                        done ? "border-gold bg-gold text-primary-foreground" : "border-border bg-background"
                      }`}
                    >
                      {done && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <div>
                      <p className={`text-sm ${done ? "" : "text-muted-foreground"}`}>{STATUS_LABELS[step]}</p>
                      {done && date && <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(date)}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
