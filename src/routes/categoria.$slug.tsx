import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchProductsByCategory } from "@/lib/catalog";
import { CatalogView } from "@/components/CatalogView";
import { CATEGORIES, type CategorySlug } from "@/lib/types";

export const Route = createFileRoute("/categoria/$slug")({
  head: ({ params }) => {
    const name = CATEGORIES.find((c) => c.slug === params.slug)?.name ?? "Categoria";
    return {
      meta: [
        { title: `${name} — Use D'lua` },
        { name: "description", content: `Confira as peças de ${name} da Use D'lua.` },
        { property: "og:title", content: `${name} — Use D'lua` },
        { property: "og:description", content: `Confira as peças de ${name} da Use D'lua.` },
      ],
    };
  },
  beforeLoad: ({ params }) => {
    if (!CATEGORIES.some((c) => c.slug === params.slug)) throw notFound();
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const category = slug as CategorySlug;
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", category],
    queryFn: () => fetchProductsByCategory(category),
  });
  const name = CATEGORIES.find((c) => c.slug === category)?.name ?? "Categoria";

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow">Catálogo</p>
      <h1 className="mt-2 text-4xl">{name}</h1>
      <div className="mt-8">
        {isLoading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Carregando peças…</p>
        ) : (
          <CatalogView products={products} lockedCategory={category} />
        )}
      </div>
    </div>
  );
}
