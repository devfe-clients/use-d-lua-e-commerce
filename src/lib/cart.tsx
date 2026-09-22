import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem, Coupon } from "./types";
import { fetchCoupon } from "./catalog";

const STORAGE_KEY = "usedlua.cart.v1";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  discount: number;
  total: number;
  coupon: Coupon | null;
  couponError: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clear: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const keyOf = (i: { productId: string; size: string; color: string }) =>
  `${i.productId}|${i.size}|${i.color}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignora */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignora */
    }
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => keyOf(i) === keyOf(item));
      if (idx === -1) return [...prev, item];
      const next = [...prev];
      const existing = next[idx]!;
      next[idx] = {
        ...existing,
        quantity: Math.min(existing.stock, existing.quantity + item.quantity),
      };
      return next;
    });
  }, []);

  const removeItem = useCallback((productId: string, size: string, color: string) => {
    setItems((prev) => prev.filter((i) => keyOf(i) !== keyOf({ productId, size, color })));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: string, color: string, quantity: number) => {
      setItems((prev) =>
        prev.map((i) =>
          keyOf(i) === keyOf({ productId, size, color })
            ? { ...i, quantity: Math.max(1, Math.min(i.stock || 99, quantity)) }
            : i,
        ),
      );
    },
    [],
  );

  const clear = useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  const discount = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return 0;
    const raw = coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
    return Math.min(subtotal, Math.round(raw * 100) / 100);
  }, [coupon, subtotal]);

  const applyCoupon = useCallback(
    async (code: string) => {
      setCouponError(null);
      const found = await fetchCoupon(code);
      if (!found) {
        setCouponError("Cupom inválido ou expirado.");
        setCoupon(null);
        return false;
      }
      if (found.minSubtotal && subtotal < found.minSubtotal) {
        setCouponError(`Cupom válido em compras acima de R$ ${found.minSubtotal.toFixed(2)}.`);
        setCoupon(null);
        return false;
      }
      setCoupon(found);
      return true;
    },
    [subtotal],
  );

  const value: CartContextValue = {
    items,
    count: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount),
    coupon,
    couponError,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    applyCoupon,
    removeCoupon: () => {
      setCoupon(null);
      setCouponError(null);
    },
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
