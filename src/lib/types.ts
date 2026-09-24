export type CategorySlug = "blusas" | "calcas" | "corset";

export const CATEGORIES: { slug: CategorySlug; name: string }[] = [
  { slug: "blusas", name: "Blusas" },
  { slug: "calcas", name: "Calças" },
  { slug: "corset", name: "Corset" },
];

export const LOW_STOCK_THRESHOLD = 5;

export type ProductVariant = {
  size: string;
  color: string;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: CategorySlug;
  description: string;
  price: number;
  salePrice?: number | null;
  /** URLs das fotos. Deixe vazio para exibir o placeholder. */
  images: string[];
  sizes: string[];
  colors: string[];
  variants: ProductVariant[];
  stock: number;
  featured?: boolean;
  bestSeller?: boolean;
  /** ISO date — usado na ordenação "mais recentes". */
  createdAt: string;
};

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  image?: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  stock: number;
};

export type Coupon = {
  code: string;
  /** percentual (0-100) ou valor fixo em reais */
  type: "percent" | "fixed";
  value: number;
  minSubtotal?: number;
};

export type OrderStatus = "pending" | "separacao" | "enviado" | "entregue" | "cancelado";

export type PaymentMethod = "cartao" | "pix" | "boleto";

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cartao: "Cartão de crédito",
  pix: "Pix",
  boleto: "Boleto bancário",
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pedido recebido",
  separacao: "Em separação",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export type ShippingAddress = {
  nome: string;
  email: string;
  telefone: string;
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export type Order = {
  id: string;
  usuarioId: string | null;
  itens: CartItem[];
  subtotal: number;
  desconto: number;
  total: number;
  cupom?: string | null;
  enderecoEntrega: ShippingAddress;
  formaPagamento: PaymentMethod;
  status: OrderStatus;
  criadoEm: string;
  /** Datas ISO de cada etapa (preenchidas no Firestore conforme o pedido avança). */
  historico?: Partial<Record<Exclude<OrderStatus, "cancelado">, string>>;
};

export function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function effectivePrice(product: Product) {
  return product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
}

export function isLowStock(stock: number) {
  return stock > 0 && stock < LOW_STOCK_THRESHOLD;
}
