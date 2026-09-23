import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — Use D'lua" },
      { name: "description", content: "Como a Use D'lua trata os seus dados pessoais." },
      { property: "og:title", content: "Política de privacidade — Use D'lua" },
      { property: "og:description", content: "Como a Use D'lua trata os seus dados pessoais." },
    ],
  }),
  component: () => (
    <article className="mx-auto max-w-2xl px-4 py-20">
      <p className="eyebrow">Institucional</p>
      <h1 className="mt-2 text-4xl">Política de privacidade</h1>
      <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted-foreground">
        <p>
          Coletamos apenas os dados necessários para processar pedidos, entregas e atendimento:
          nome, e-mail, endereço e histórico de compras.
        </p>
        <p>
          Seus dados não são vendidos a terceiros e são compartilhados somente com parceiros
          essenciais à operação, como transportadoras e meios de pagamento.
        </p>
        <p>
          Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelos
          nossos canais de atendimento, conforme a LGPD.
        </p>
        <p className="italic">Texto modelo — revise com o seu jurídico antes de publicar.</p>
      </div>
    </article>
  ),
});
