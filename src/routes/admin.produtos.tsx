/**
 * routes/admin.produtos.tsx
 *
 * Tela de produtos do painel admin.
 * Tem duas "visualizações" dentro do mesmo componente:
 *
 * 1. Lista — mostra todos os produtos cadastrados
 * 2. Formulário — abre quando clica em "Novo produto" ou em um produto existente
 *
 * Usamos estado local (useState) para controlar qual visualização mostrar,
 * sem precisar de rotas separadas — mantém simples para uma aula.
 */

import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  adminDeleteProduct,
  adminFetchProducts,
  adminSaveProduct,
} from "@/lib/admin";
import { CATEGORIES, formatPrice, type CategorySlug, type Product } from "@/lib/types";

export const Route = createFileRoute("/admin/produtos")({
  component: AdminProdutos,
});

// ---------------------------------------------------------------------------
// Componente principal — alterna entre lista e formulário
// ---------------------------------------------------------------------------

function AdminProdutos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // `editing` armazena o produto que está sendo editado.
  // null = nenhum (mostra a lista)
  // {} vazio = novo produto (abre formulário em branco)
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  // Busca os produtos assim que o componente monta
  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await adminFetchProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    // window.confirm abre um diálogo nativo do navegador — simples e sem dependência extra
    if (!window.confirm("Excluir este produto? Essa ação não pode ser desfeita.")) return;
    await adminDeleteProduct(id);
    // Atualiza a lista local sem precisar buscar tudo de novo do Firestore
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleSave(data: Omit<Product, "id">) {
    const id = editing?.id ?? "";
    await adminSaveProduct(id, data);
    // Fecha o formulário e recarrega a lista para refletir o novo produto
    setEditing(null);
    await load();
  }

  // Se `editing` não for null, mostra o formulário
  if (editing !== null) {
    return (
      <ProductForm
        initial={editing}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />
    );
  }

  // Caso contrário, mostra a lista
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl tracking-wide">Produtos</h1>
        {/* Clique em "Novo produto" abre o formulário com objeto vazio */}
        <button onClick={() => setEditing({})} className="btn-gold">
          + Novo produto
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum produto cadastrado ainda.</p>
      ) : (
        <div className="overflow-hidden rounded border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Estoque</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 justify-end">
                      {/* Clique em "Editar" passa o produto completo para o formulário */}
                      <button
                        onClick={() => setEditing(p)}
                        className="text-xs underline underline-offset-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs text-destructive underline underline-offset-2"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Formulário de cadastro / edição
// ---------------------------------------------------------------------------

/**
 * Props do formulário:
 * - initial: os dados do produto (vazio para novo, preenchido para edição)
 * - onSave: chamada quando o usuário clica em Salvar
 * - onCancel: chamada quando clica em Cancelar (volta para a lista)
 */
function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Partial<Product>;
  onSave: (data: Omit<Product, "id">) => Promise<void>;
  onCancel: () => void;
}) {
  // Cada campo do produto tem seu próprio estado
  // Os valores padrão (after ??) são usados quando é um produto novo
  const [name, setName] = useState(initial.name ?? "");
  const [slug, setSlug] = useState(initial.slug ?? "");
  const [category, setCategory] = useState<CategorySlug>(
    initial.category ?? "blusas",
  );
  const [description, setDescription] = useState(initial.description ?? "");

  // Preços guardados em centavos no Firestore, mas exibidos em reais no formulário
  // Por isso dividimos por 100 ao preencher e multiplicamos por 100 ao salvar
  const [priceDisplay, setPriceDisplay] = useState(
    initial.price ? String(initial.price / 100) : "",
  );
  const [salePriceDisplay, setSalePriceDisplay] = useState(
    initial.salePrice ? String(initial.salePrice / 100) : "",
  );

  const [stock, setStock] = useState(String(initial.stock ?? ""));

  // Imagens: o usuário cola URLs do Cloudinary separadas por vírgula
  const [imagesRaw, setImagesRaw] = useState(
    (initial.images ?? []).join(", "),
  );

  // Tamanhos e cores: separados por vírgula também
  const [sizesRaw, setSizesRaw] = useState((initial.sizes ?? []).join(", "));
  const [colorsRaw, setColorsRaw] = useState(
    (initial.colors ?? []).join(", "),
  );

  const [bestSeller, setBestSeller] = useState(initial.bestSeller ?? false);
  const [saving, setSaving] = useState(false);

  /**
   * Gera o slug automaticamente a partir do nome.
   * "Blusa Linho Off White" → "blusa-linho-off-white"
   *
   * normalize("NFD") separa letras de acentos
   * replace(...) remove os acentos
   * trim().toLowerCase().replace(...) limpa e formata
   */
  function slugify(value: string) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /**
   * Converte uma string separada por vírgula em array limpo.
   * "P, M, G" → ["P", "M", "G"]
   */
  function toArray(raw: string): string[] {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      // Monta o objeto que vai para o Firestore
      const data: Omit<Product, "id"> = {
        name,
        slug,
        category,
        description,
        // parseFloat converte string para número decimal
        // Math.round evita problemas de ponto flutuante
        // * 100 para guardar em centavos
        price: Math.round(parseFloat(priceDisplay) * 100),
        salePrice: salePriceDisplay
          ? Math.round(parseFloat(salePriceDisplay) * 100)
          : null,
        stock: parseInt(stock, 10),
        images: toArray(imagesRaw),
        sizes: toArray(sizesRaw),
        colors: toArray(colorsRaw),
        variants: initial.variants ?? [],
        bestSeller,
        featured: initial.featured ?? false,
        // Se é edição, mantém a data original; se é novo, usa hoje
        createdAt: initial.createdAt ?? new Date().toISOString(),
      };

      await onSave(data);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={onCancel}
          className="text-sm text-muted-foreground underline underline-offset-2"
        >
          ← Voltar
        </button>
        <h1 className="text-2xl tracking-wide">
          {initial.id ? "Editar produto" : "Novo produto"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">

        {/* Nome + slug lado a lado */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome">
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                // Preenche o slug automaticamente enquanto o usuário digita o nome
                // Se o produto já existe (edição), não altera o slug automaticamente
                if (!initial.id) setSlug(slugify(e.target.value));
              }}
              required
              className={inputClass}
            />
          </Field>

          <Field label="Slug (URL)">
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className={inputClass}
              placeholder="blusa-linho-off-white"
            />
          </Field>
        </div>

        {/* Categoria */}
        <Field label="Categoria">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategorySlug)}
            className={inputClass}
          >
            {/* CATEGORIES vem do types.ts — lista as categorias disponíveis */}
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        {/* Descrição */}
        <Field label="Descrição">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </Field>

        {/* Preço e preço promocional */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Preço (R$)">
            <input
              type="number"
              step="0.01"
              min="0"
              value={priceDisplay}
              onChange={(e) => setPriceDisplay(e.target.value)}
              required
              className={inputClass}
              placeholder="129.90"
            />
          </Field>

          <Field label="Preço promocional (R$) — deixe vazio se não houver">
            <input
              type="number"
              step="0.01"
              min="0"
              value={salePriceDisplay}
              onChange={(e) => setSalePriceDisplay(e.target.value)}
              className={inputClass}
              placeholder="99.90"
            />
          </Field>
        </div>

        {/* Estoque */}
        <Field label="Estoque">
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            className={inputClass}
          />
        </Field>

        {/* Imagens: URLs do Cloudinary separadas por vírgula */}
        <Field label="URLs das fotos (separadas por vírgula)">
          <textarea
            value={imagesRaw}
            onChange={(e) => setImagesRaw(e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="https://res.cloudinary.com/…/foto1.jpg, https://res.cloudinary.com/…/foto2.jpg"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Copie as URLs do Cloudinary e cole aqui. A primeira foto é a capa do produto.
          </p>
        </Field>

        {/* Tamanhos e cores */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tamanhos (separados por vírgula)">
            <input
              value={sizesRaw}
              onChange={(e) => setSizesRaw(e.target.value)}
              className={inputClass}
              placeholder="P, M, G, GG"
            />
          </Field>

          <Field label="Cores (separadas por vírgula)">
            <input
              value={colorsRaw}
              onChange={(e) => setColorsRaw(e.target.value)}
              className={inputClass}
              placeholder="Off White, Preto"
            />
          </Field>
        </div>

        {/* Mais vendido */}
        <div className="flex items-center gap-3">
          <input
            id="bestSeller"
            type="checkbox"
            checked={bestSeller}
            onChange={(e) => setBestSeller(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="bestSeller" className="text-sm">
            Mais vendido (aparece na seção "Mais vendidos" da home)
          </label>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-gold disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar produto"}
          </button>
          <button type="button" onClick={onCancel} className="btn-outline-ink">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componentes auxiliares
// ---------------------------------------------------------------------------

/**
 * Field é um wrapper de campo reutilizável:
 * label em cima + o input/select/textarea passado como children embaixo.
 */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

// Classe CSS compartilhada por todos os inputs — evita repetição
const inputClass =
  "border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink w-full";
