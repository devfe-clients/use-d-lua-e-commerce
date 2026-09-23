import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a Use D'lua" },
      { name: "description", content: "Conheça a história e os valores da Use D'lua." },
      { property: "og:title", content: "Sobre a Use D'lua" },
      { property: "og:description", content: "Conheça a história e os valores da Use D'lua." },
    ],
  }),
  component: () => (
    <article className="mx-auto max-w-2xl px-4 py-20">
      <p className="eyebrow">Institucional</p>
      <h1 className="mt-2 text-4xl">Sobre a loja</h1>
      <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted-foreground">
        <p>
          A Use D&apos;lua nasceu do desejo de criar peças femininas atemporais, com caimento
          impecável e acabamento cuidadoso. Cada coleção é pensada para valorizar a mulher que
          veste sua própria essência.
        </p>
        <p>
          Trabalhamos com produção em pequena escala e tecidos selecionados, priorizando conforto,
          durabilidade e um guarda-roupa que atravessa estações.
        </p>
      </div>
    </article>
  ),
});
