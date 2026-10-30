import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

const WHATSAPP_NUMBER = "5513991419808";
const WHATSAPP_MESSAGE = "Olá! Preciso de ajuda, gostaria de falar com atendimento";
const SUPPORT_EMAIL = "use.dlua01@gmail.com";
const EMAIL_SUBJECT = "Suporte Use D'lua";

const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${SUPPORT_EMAIL}&su=${encodeURIComponent(EMAIL_SUBJECT)}`;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.483.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function GmailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
    </svg>
  );
}

export const Route = createFileRoute("/suporte")({
  head: () => ({
    meta: [
      { title: "Suporte — Use D'lua" },
      {
        name: "description",
        content: "Fale com a Use D'lua pelo WhatsApp ou por e-mail. Estamos aqui para ajudar.",
      },
    ],
  }),
  component: Suporte,
});

function Suporte() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="eyebrow">Atendimento</p>
      <h1 className="mt-2 text-4xl">Fale com nossa equipe</h1>
      <p className="mt-4 max-w-xl text-sm text-muted-foreground">
        Tem alguma dúvida sobre um pedido, tamanho ou produto? Escolha o canal que preferir e nossa
        equipe te responde imediatamente.
      </p>

      <div className="mt-10 border-t border-border pt-10">
        <div className="grid gap-6 md:grid-cols-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center border border-border bg-card px-6 py-10 text-center transition-colors hover:border-gold"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white">
              <WhatsAppIcon className="h-8 w-8" />
            </span>
            <h2 className="mt-6 text-2xl">WhatsApp</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Atendimento rápido e direto, com a nossa equipe.
            </p>
            <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-ink px-6 py-3 text-xs uppercase tracking-[0.18em] transition-colors group-hover:bg-ink group-hover:text-background">
              Conversar agora
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </a>

          <a
            href={gmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center border border-border bg-card px-6 py-10 text-center transition-colors hover:border-gold"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#EA4335] shadow-sm ring-1 ring-border">
              <GmailIcon className="h-8 w-8" />
            </span>
            <h2 className="mt-6 text-2xl">E-mail</h2>
            <p className="mt-2 text-sm text-muted-foreground">{SUPPORT_EMAIL}</p>
            <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-ink px-6 py-3 text-xs uppercase tracking-[0.18em] transition-colors group-hover:bg-ink group-hover:text-background">
              Enviar e-mail
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
