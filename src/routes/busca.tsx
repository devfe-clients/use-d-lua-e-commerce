import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchProducts } from "@/lib/catalog";
import { CatalogView } from "@/components/CatalogView";

type SearchParams = { q: string };

export const Route = createFileRoute("/busca")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Buscar peças — Use D'lua" },
      { name: "description", content: "Encontre blusas, calças e corsets da Use D'lua." },
      { property: "og:title", content: "Buscar peças — Use D'lua" },
      { property: "og:description", content: "Encontre blusas, calças e corsets da Use D'lua." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [term, setTerm] = useState(q);
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">Busca</p>
      <h1 className="mt-2 text-4xl">{q ? `Resultados para “${q}”` : "Todas as peças"}</h1>

      <form
        className="mt-6 flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/busca", search: { q: term.trim() } });
        }}
      >
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar por nome ou palavra-chave"
          className="w-full border border-border bg-card px-3 py-2 text-sm outline-none focus:border-gold"
          aria-label="Buscar produtos"
        />
        <button type="submit" className="btn-outline-ink">
          Buscar
        </button>
      </form>

      <div className="mt-10">
        <CatalogView products={products} search={q} />
      </div>
    </div>
  );
}
