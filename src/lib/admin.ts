/**
 * lib/admin.ts
 *
 * Funções que o painel admin usa para ler e escrever no Firestore.
 * Separamos aqui para não misturar com o catalog.ts (que é só leitura,
 * usado pelo lado público do site).
 */

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDb, COLLECTIONS } from "./firebase";
import type { Order, OrderStatus, Product } from "./types";

// ---------------------------------------------------------------------------
// PRODUTOS
// ---------------------------------------------------------------------------

/**
 * Busca todos os produtos do Firestore, ordenados por data de criação.
 * Usada na listagem do admin para mostrar todos os produtos cadastrados.
 */
export async function adminFetchProducts(): Promise<Product[]> {
  const db = getDb();
  if (!db) throw new Error("Firebase não configurado.");

  // query() monta a consulta — aqui pedimos todos os produtos ordenados pelo mais novo primeiro
  const q = query(
    collection(db, COLLECTIONS.products),
    orderBy("createdAt", "desc"),
  );

  const snap = await getDocs(q);

  // snap.docs é um array de DocumentSnapshot — mapeamos para o tipo Product
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
}

/**
 * Cria ou atualiza um produto no Firestore.
 *
 * - Se `id` for vazio, gera um ID automático (novo produto).
 * - Se `id` tiver valor, sobrescreve o documento existente (edição).
 *
 * setDoc com { merge: true } faz um "upsert":
 * cria se não existir, atualiza só os campos enviados se existir.
 */
export async function adminSaveProduct(
  id: string,
  data: Omit<Product, "id">,
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase não configurado.");

  // doc() sem ID gera um ID automático; com ID aponta para o documento existente
  const ref = id
    ? doc(db, COLLECTIONS.products, id)
    : doc(collection(db, COLLECTIONS.products));

  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Exclui um produto pelo ID.
 * deleteDoc remove o documento permanentemente — não tem lixeira no Firestore.
 */
export async function adminDeleteProduct(id: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase não configurado.");

  await deleteDoc(doc(db, COLLECTIONS.products, id));
}

// ---------------------------------------------------------------------------
// PEDIDOS
// ---------------------------------------------------------------------------

/**
 * Busca todos os pedidos, do mais recente para o mais antigo.
 * Usada na tela de pedidos do admin.
 */
export async function adminFetchOrders(): Promise<Order[]> {
  const db = getDb();
  if (!db) throw new Error("Firebase não configurado.");

  const q = query(
    collection(db, COLLECTIONS.orders),
    orderBy("criadoEm", "desc"),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
}

/**
 * Avança o status de um pedido.
 *
 * updateDoc atualiza só os campos listados — não apaga o resto do documento.
 * Registramos também a data da mudança em `historico` para mostrar no rastreamento.
 */
export async function adminUpdateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase não configurado.");

  await updateDoc(doc(db, COLLECTIONS.orders, orderId), {
    status,
    // Notação de ponto: atualiza só o campo específico dentro do objeto historico
    [`historico.${status}`]: new Date().toISOString(),
  });
}
