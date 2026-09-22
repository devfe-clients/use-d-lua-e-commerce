import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { COLLECTIONS, getDb } from "./firebase";
import { SAMPLE_COUPONS, SAMPLE_PRODUCTS } from "./sample-data";
import type { CategorySlug, Coupon, Product } from "./types";
import { effectivePrice } from "./types";

/**
 * Camada de dados do catálogo.
 * Lê do Firestore quando o Firebase está configurado; caso contrário usa o
 * catálogo local de demonstração.
 */
export async function fetchProducts(): Promise<Product[]> {
  const db = getDb();
  if (!db) return SAMPLE_PRODUCTS;
  const snap = await getDocs(collection(db, COLLECTIONS.products));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) }));
}

export async function fetchProductsByCategory(category: CategorySlug): Promise<Product[]> {
  const db = getDb();
  if (!db) return SAMPLE_PRODUCTS.filter((p) => p.category === category);
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.products), where("category", "==", category)),
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) }));
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const db = getDb();
  if (!db) return SAMPLE_PRODUCTS.find((p) => p.id === id || p.slug === id) ?? null;
  const ref = doc(db, COLLECTIONS.products, id);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id: snap.id, ...(snap.data() as Omit<Product, "id">) };
  const bySlug = await getDocs(
    query(collection(db, COLLECTIONS.products), where("slug", "==", id)),
  );
  const first = bySlug.docs[0];
  return first ? { id: first.id, ...(first.data() as Omit<Product, "id">) } : null;
}

export async function fetchCoupon(code: string): Promise<Coupon | null> {
  const normalized = code.trim().toUpperCase();
  const db = getDb();
  if (!db) return SAMPLE_COUPONS.find((c) => c.code === normalized) ?? null;
  const snap = await getDoc(doc(db, COLLECTIONS.coupons, normalized));
  return snap.exists() ? (snap.data() as Coupon) : null;
}

export type SortOption = "recentes" | "menor-preco" | "maior-preco";

export type CatalogFilters = {
  search?: string;
  category?: CategorySlug | "todas";
  sizes?: string[];
  colors?: string[];
  sort?: SortOption;
};

export function applyFilters(products: Product[], filters: CatalogFilters): Product[] {
  const term = filters.search?.trim().toLowerCase();
  let list = products.filter((p) => {
    if (filters.category && filters.category !== "todas" && p.category !== filters.category)
      return false;
    if (term && !`${p.name} ${p.description}`.toLowerCase().includes(term)) return false;
    if (filters.sizes?.length && !p.sizes.some((s) => filters.sizes!.includes(s))) return false;
    if (filters.colors?.length && !p.colors.some((c) => filters.colors!.includes(c)))
      return false;
    return true;
  });

  switch (filters.sort) {
    case "menor-preco":
      list = [...list].sort((a, b) => effectivePrice(a) - effectivePrice(b));
      break;
    case "maior-preco":
      list = [...list].sort((a, b) => effectivePrice(b) - effectivePrice(a));
      break;
    default:
      list = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
  return list;
}

export function collectSizes(products: Product[]) {
  return Array.from(new Set(products.flatMap((p) => p.sizes)));
}

export function collectColors(products: Product[]) {
  return Array.from(new Set(products.flatMap((p) => p.colors)));
}
