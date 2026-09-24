import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { fetchOrdersByUser } from "@/lib/orders";
import { formatPrice, STATUS_LABELS, type Order, type OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/conta_/pedidos")({
  head: () => ({
    meta: [
      { title: "Meus pedidos — Use D'lua" },
      { name: "description", content: "Veja o histórico e o status dos seus pedidos na Use D'lua." },
      { property: "og:title", content: "Meus pedidos — Use D'lua" },
      { property: "og:description", content: "Veja o histórico e o status dos seus pedidos na Use D'lua." },
    ],
  }),
  component: OrdersPage,
});

export const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-secondary text-muted-foreground",
  separacao: "bg-secondary text-foreground",
  enviado: "bg-sky-100 text-sky-800",
  entregue: "bg-emerald-100 text-emerald-800",
  cancelado: "bg-red-100 text-red-800",
};

function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchOrdersByUser(user.uid).then(setOrders).catch(() => setOrders([]));
  }, [user]);

  if (loading) return <p className="py-32 text-center text-sm text-muted-foreground">Carregando…</p>;
  if (!user)
    return (
      <div className="py-32 text-center">
        <h1 className="text-3xl">Entre para ver seus pedidos</h1>
        <Link to="/conta" className="btn-gold mt-8">Entrar</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <p className="eyebrow">Minha conta</p>
      <h1 className="mt-2 text-4xl">Meus pedidos</h1>
      {orders === null ? (
        <p className="mt-10 text-sm text-muted-foreground">Carregando pedidos…</p>
      ) : orders.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">Você ainda não fez nenhum pedido.</p>
      ) : (
        <ul className="mt-10 space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-col gap-4 border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm">Pedido {o.id}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(o.criadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              </div>
              <span className={`w-fit px-3 py-1 text-xs uppercase tracking-[0.12em] ${STATUS_BADGE[o.status]}`}>
                {STATUS_LABELS[o.status]}
              </span>
              <span className="text-sm">{formatPrice(o.total)}</span>
              <Link to="/rastreamento" search={{ pedido: o.id }} className="btn-outline-ink px-4 py-2">
                Ver detalhes
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
