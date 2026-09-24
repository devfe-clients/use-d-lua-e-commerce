import { collection, doc, getDoc, getDocs, query, runTransaction, setDoc, where } from "firebase/firestore";
import { COLLECTIONS, getDb } from "./firebase";
import type { CartItem, Order } from "./types";

/**
 * Pedidos e estoque. Com o Firebase configurado grava/lê do Firestore
 * (coleção "orders", id do documento = número do pedido). Sem as chaves,
 * usa o localStorage para que o fluxo possa ser testado.
 */
const LOCAL_KEY = "usedlua.orders.v1";

function readLocal(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]") as Order[];
  } catch {
    return [];
  }
}

export function generateOrderNumber() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 4; i++) rand += chars[Math.floor(Math.random() * chars.length)];
  return `${Date.now()}${rand}`;
}

export async function createOrder(
  data: Omit<Order, "id" | "criadoEm" | "status" | "historico">,
): Promise<Order> {
  const now = new Date().toISOString();
  const order: Order = {
    ...data,
    id: generateOrderNumber(),
    status: "pending",
    criadoEm: now,
    historico: { pending: now },
  };
  const db = getDb();
  if (db) {
    await setDoc(doc(db, COLLECTIONS.orders, order.id), order);
  } else {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([order, ...readLocal()]));
  }
  return order;
}

export async function fetchOrder(id: string): Promise<Order | null> {
  const clean = id.trim().toUpperCase();
  if (!clean) return null;
  const db = getDb();
  if (!db) return readLocal().find((o) => o.id === clean) ?? null;
  const snap = await getDoc(doc(db, COLLECTIONS.orders, clean));
  return snap.exists() ? ({ ...(snap.data() as Order), id: snap.id }) : null;
}

export async function fetchOrdersByUser(usuarioId: string): Promise<Order[]> {
  const db = getDb();
  const list = db
    ? (await getDocs(query(collection(db, COLLECTIONS.orders), where("usuarioId", "==", usuarioId)))).docs.map(
        (d) => ({ ...(d.data() as Order), id: d.id }),
      )
    : readLocal().filter((o) => o.usuarioId === usuarioId);
  return list.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

/** Baixa de estoque transacional (executada no fechamento do pedido). */
export async function decrementStock(items: CartItem[]): Promise<void> {
  const db = getDb();
  if (!db) return;
  await runTransaction(db, async (tx) => {
    const refs = items.map((i) => doc(db, COLLECTIONS.products, i.productId));
    const snaps = await Promise.all(refs.map((r) => tx.get(r)));
    snaps.forEach((snap, idx) => {
      if (!snap.exists()) return;
      const current = (snap.data()["stock"] as number) ?? 0;
      tx.update(refs[idx]!, { stock: Math.max(0, current - items[idx]!.quantity) });
    });
  });
}

export function formatDateTime(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
