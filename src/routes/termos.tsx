import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de uso — Use D'lua" },
      { name: "description", content: "Condições de uso da loja virtual Use D'lua." },
      { property: "og:title", content: "Termos de uso — Use D'lua" },
      { property: "og:description", content: "Condições de uso da loja virtual Use D'lua." },
    ],
  }),
  component: () => (
    <article className="mx-auto max-w-2xl px-4 py-20">
      <p className="eyebrow">Institucional</p>
      <h1 className="mt-2 text-4xl">Termos de uso</h1>
      <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted-foreground">
        <p>
          Ao navegar e comprar na Use D&apos;lua, você concorda com as condições descritas nesta
          página. Os preços, descrições e disponibilidade das peças podem ser alterados sem aviso
          prévio.
        </p>
        <p>
          Pedidos estão sujeitos à confirmação de pagamento e à disponibilidade de estoque. Em caso
          de indisponibilidade, entraremos em contato para troca ou reembolso.
        </p>
        <p>
          Trocas e devoluções seguem o Código de Defesa do Consumidor: até 7 dias corridos após o
          recebimento, com a peça sem uso e com etiqueta.
        </p>
        <p className="italic">Texto modelo — revise com o seu jurídico antes de publicar.</p>
      </div>
    </article>
  ),
});
