import { addDoc, collection, doc, getDocs, query, runTransaction, where } from "firebase/firestore";
import { COLLECTIONS, getDb } from "./firebase";
import type { CartItem, Order } from "./types";

/**
 * Pedidos e estoque.
 * Estrutura pronta para o Firebase — ao configurar as chaves, estas funções
 * passam a gravar no Firestore automaticamente.
 */
export async function createOrder(
  order: Omit<Order, "id" | "createdAt" | "status"> & { status?: Order["status"] },
): Promise<Order> {
  const payload: Order = {
    ...order,
    status: order.status ?? "pending",
    createdAt: new Date().toISOString(),
  };
  const db = getDb();
  if (!db) return { ...payload, id: `local-${Date.now()}` };
  const ref = await addDoc(collection(db, COLLECTIONS.orders), payload);
  return { ...payload, id: ref.id };
}

/** Baixa de estoque transacional (executada no fechamento do pedido). */
export async function decrementStock(items: CartItem[]): Promise<void> {
  const db = getDb();
  if (!db) return;
  await runTransaction(db, async (tx) => {
    for (const item of items) {
      const ref = doc(db, COLLECTIONS.products, item.productId);
      const snap = await tx.get(ref);
      if (!snap.exists()) continue;
      const current = (snap.data().stock as number) ?? 0;
      tx.update(ref, { stock: Math.max(0, current - item.quantity) });
    }
  });
}

export async function fetchOrdersByUser(userId: string): Promise<Order[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.orders), where("userId", "==", userId)),
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, "id">) }));
}
