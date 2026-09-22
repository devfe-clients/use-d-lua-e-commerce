import { useMemo, useState } from "react";
import { ProductGrid } from "./ProductGrid";
import { applyFilters, collectColors, collectSizes, type SortOption } from "@/lib/catalog";
import { CATEGORIES, type CategorySlug, type Product } from "@/lib/types";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-3 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors ${
        active
          ? "border-ink bg-ink text-background"
          : "border-border text-muted-foreground hover:border-ink hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function CatalogView({
  products,
  search = "",
  lockedCategory,
}: {
  products: Product[];
  search?: string;
  lockedCategory?: CategorySlug;
}) {
  const [sort, setSort] = useState<SortOption>("recentes");
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [category, setCategory] = useState<CategorySlug | "todas">(lockedCategory ?? "todas");

  const allSizes = useMemo(() => collectSizes(products), [products]);
  const allColors = useMemo(() => collectColors(products), [products]);

  const filtered = useMemo(
    () => applyFilters(products, { search, sizes, colors, sort, category }),
    [products, search, sizes, colors, sort, category],
  );

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  return (
    <div>
      <div className="mb-8 space-y-5 border-y border-border py-6">
        {!lockedCategory && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow mr-2">Categoria</span>
            <Chip active={category === "todas"} onClick={() => setCategory("todas")}>
              Todas
            </Chip>
            {CATEGORIES.map((c) => (
              <Chip key={c.slug} active={category === c.slug} onClick={() => setCategory(c.slug)}>
                {c.name}
              </Chip>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-2">Tamanho</span>
          {allSizes.map((s) => (
            <Chip key={s} active={sizes.includes(s)} onClick={() => toggle(sizes, setSizes, s)}>
              {s}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-2">Cor</span>
          {allColors.map((c) => (
            <Chip key={c} active={colors.includes(c)} onClick={() => toggle(colors, setColors, c)}>
              {c}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {filtered.length} peça{filtered.length === 1 ? "" : "s"}
          </span>
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Ordenar
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="border border-border bg-card px-3 py-2 text-xs tracking-normal text-foreground outline-none focus:border-gold"
            >
              <option value="recentes">Mais recentes</option>
              <option value="menor-preco">Preço: menor para maior</option>
              <option value="maior-preco">Preço: maior para menor</option>
            </select>
          </label>
        </div>
      </div>

      <ProductGrid products={filtered} />
    </div>
  );
}
