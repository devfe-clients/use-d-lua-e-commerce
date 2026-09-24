import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductImage } from "@/components/ProductImage";
import { CATEGORIES } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Use D'lua — Moda feminina moderna e elegante" },
      {
        name: "description",
        content:
          "Blusas, calças e corsets femininos com design minimalista e acabamento impecável. Conheça a Use D'lua.",
      },
      { property: "og:title", content: "Use D'lua — Moda feminina moderna e elegante" },
      {
        property: "og:description",
        content: "Blusas, calças e corsets femininos com design minimalista e acabamento impecável.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  const lancamentos = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);
  const maisVendidos = products.filter((p) => p.bestSeller).slice(0, 4);

  return (
    <div>
      {/* Banner principal — substitua pela sua imagem */}
      <section className="relative">
        <div className="relative h-[70vh] min-h-[420px] w-full">
          {/* Troque src={undefined} pela URL da sua imagem de banner */}
          <ProductImage src={undefined} alt="Banner Use D'lua" label="" />
          <div className="absolute inset-0 flex items-center justify-center bg-ink/10 px-6">
            <div className="max-w-xl text-center">
              <p className="eyebrow">Nova estação</p>
              <h1 className="mt-4 text-4xl leading-tight sm:text-5xl lg:text-6xl">
                Elegância que acompanha o seu ritmo
              </h1>
              <p className="mt-4 text-sm text-muted-foreground">
                Peças atemporais em tecidos nobres, pensadas para o dia a dia e para as noites
                especiais.
              </p>
              <Link to="/categoria/$slug" params={{ slug: "blusas" }} className="btn-gold mt-8">
                Ver coleção
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="eyebrow">Categorias em destaque</p>
          <h2 className="mt-2 text-3xl">Escolha o seu estilo</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/categoria/$slug"
              params={{ slug: c.slug }}
              className="group relative aspect-[4/5] overflow-hidden"
            >
              <ProductImage src={undefined} alt={c.name} label={`Foto ${c.name}`} />
              <div className="absolute inset-x-0 bottom-0 bg-background/85 py-4 text-center">
                <span className="text-xs uppercase tracking-[0.22em]">{c.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow">Novidades</p>
            <h2 className="mt-2 text-3xl">Lançamentos</h2>
          </div>
        </div>
        <ProductGrid products={lancamentos} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="eyebrow">Favoritas das clientes</p>
          <h2 className="mt-2 text-3xl">Mais vendidos</h2>
        </div>
        <ProductGrid products={maisVendidos} />
      </section>
    </div>
  );
}
