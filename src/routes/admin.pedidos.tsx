/**
 * routes/admin.pedidos.tsx
 *
 * Tela de pedidos do painel admin.
 * Mostra todos os pedidos do Firestore com:
 * - Filtro por status
 * - Botão para avançar o status de cada pedido
 * - Detalhes do endereço e itens ao clicar
 */

import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { adminFetchOrders, adminUpdateOrderStatus } from "@/lib/admin";
import {
  formatPrice,
  STATUS_LABELS,
  type Order,
  type OrderStatus,
} from "@/lib/types";

export const Route = createFileRoute("/admin/pedidos")({
  component: AdminPedidos,
});

// Sequência de status — a ordem importa para saber qual é o "próximo"
const STATUS_FLOW: OrderStatus[] = [
  "pending",
  "separacao",
  "enviado",
  "entregue",
];

function AdminPedidos() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtro de status — "all" mostra todos
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  // Qual pedido está expandido (mostra detalhes)
  // null = nenhum expandido
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await adminFetchOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Avança o status para o próximo na sequência.
   * "pending" → "separacao" → "enviado" → "entregue"
   *
   * indexOf encontra a posição atual na lista STATUS_FLOW,
   * e pegamos o item na posição seguinte.
   */
  async function handleAdvanceStatus(order: Order) {
    const currentIndex = STATUS_FLOW.indexOf(order.status as OrderStatus);
    // Se já está no último status ou é "cancelado", não faz nada
    if (currentIndex === -1 || currentIndex >= STATUS_FLOW.length - 1) return;

    const nextStatus = STATUS_FLOW[currentIndex + 1];
    await adminUpdateOrderStatus(order.id, nextStatus);

    // Atualiza o estado local para refletir a mudança sem recarregar tudo
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, status: nextStatus } : o,
      ),
    );
  }

  // Filtra os pedidos de acordo com o status selecionado
  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <h1 className="mb-6 text-2xl tracking-wide">Pedidos</h1>

      {/* Filtros de status */}
      <div className="mb-6 flex flex-wrap gap-2">
        {/* Botão "Todos" */}
        <FilterButton
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="Todos"
          count={orders.length}
        />
        {/* Um botão para cada status possível */}
        {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
          <FilterButton
            key={s}
            active={filter === s}
            onClick={() => setFilter(s)}
            label={STATUS_LABELS[s]}
            count={orders.filter((o) => o.status === s).length}
          />
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum pedido encontrado.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              expanded={expanded === order.id}
              onToggle={() =>
                // Clicar no mesmo pedido fecha o detalhe (toggle)
                setExpanded((prev) => (prev === order.id ? null : order.id))
              }
              onAdvance={() => handleAdvanceStatus(order)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Linha de pedido — resumo + detalhes expansíveis
// ---------------------------------------------------------------------------

function OrderRow({
  order,
  expanded,
  onToggle,
  onAdvance,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  onAdvance: () => void;
}) {
  const currentIndex = STATUS_FLOW.indexOf(order.status as OrderStatus);
  // Pedido pode avançar se ainda não chegou no último status e não está cancelado
  const canAdvance =
    currentIndex !== -1 && currentIndex < STATUS_FLOW.length - 1;

  return (
    <div className="rounded border border-border">
      {/* Cabeçalho clicável — abre/fecha os detalhes */}
      <div
        className="flex cursor-pointer flex-wrap items-center gap-4 px-4 py-3 hover:bg-secondary/40"
        onClick={onToggle}
      >
        {/* ID do pedido — mostramos só os primeiros 8 caracteres para ficar legível */}
        <span className="font-mono text-xs text-muted-foreground">
          #{order.id.slice(0, 8)}
        </span>

        <span className="text-sm font-medium">{order.enderecoEntrega.nome}</span>

        <span className="text-sm">{formatPrice(order.total)}</span>

        {/* Badge de status com cor de fundo diferente por status */}
        <StatusBadge status={order.status} />

        {/* Data do pedido formatada em pt-BR */}
        <span className="ml-auto text-xs text-muted-foreground">
          {new Date(order.criadoEm).toLocaleDateString("pt-BR")}
        </span>

        {/* Seta indica se está expandido ou não */}
        <span className="text-xs text-muted-foreground">
          {expanded ? "▲" : "▼"}
        </span>
      </div>

      {/* Detalhes — só aparecem quando expanded === true */}
      {expanded && (
        <div className="border-t border-border px-4 py-4">
          <div className="grid gap-6 sm:grid-cols-2">

            {/* Itens do pedido */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Itens
              </p>
              <ul className="space-y-1 text-sm">
                {order.itens.map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span>
                      {item.quantity}× {item.name} ({item.size} / {item.color})
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              {/* Totais */}
              <div className="mt-3 border-t border-border pt-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.desconto > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Desconto</span>
                    <span>− {formatPrice(order.desconto)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Endereço de entrega */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Entrega
              </p>
              <address className="not-italic text-sm leading-relaxed text-muted-foreground">
                {order.enderecoEntrega.rua}, {order.enderecoEntrega.numero}
                {order.enderecoEntrega.complemento
                  ? ` — ${order.enderecoEntrega.complemento}`
                  : ""}
                <br />
                {order.enderecoEntrega.bairro} — {order.enderecoEntrega.cidade}/
                {order.enderecoEntrega.estado}
                <br />
                CEP {order.enderecoEntrega.cep}
                <br />
                {order.enderecoEntrega.telefone}
                <br />
                {order.enderecoEntrega.email}
              </address>
            </div>
          </div>

          {/* Botão de avançar status */}
          {canAdvance && (
            <div className="mt-4 border-t border-border pt-4">
              {/* STATUS_FLOW[currentIndex + 1] é o próximo status na sequência */}
              <button onClick={onAdvance} className="btn-gold text-xs">
                Avançar para:{" "}
                {STATUS_LABELS[STATUS_FLOW[STATUS_FLOW.indexOf(order.status as OrderStatus) + 1]]}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componentes auxiliares
// ---------------------------------------------------------------------------

/**
 * Botão de filtro com contador de pedidos.
 * Fica ativo (fundo escuro) quando o status selecionado é o dele.
 */
function FilterButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded border px-3 py-1.5 text-xs ${
        active
          ? "border-ink bg-ink text-background"
          : "border-border text-muted-foreground hover:border-ink"
      }`}
    >
      {label} ({count})
    </button>
  );
}

/**
 * Badge colorido por status.
 * Cada status tem uma cor diferente para identificação visual rápida.
 */
function StatusBadge({ status }: { status: string }) {
  // Mapa de status → classe de cor de fundo
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    separacao: "bg-blue-100 text-blue-800",
    enviado: "bg-purple-100 text-purple-800",
    entregue: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-medium ${colors[status] ?? "bg-secondary"}`}
    >
      {STATUS_LABELS[status as OrderStatus] ?? status}
    </span>
  );
}
