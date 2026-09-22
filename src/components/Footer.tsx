import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail } from "lucide-react";
import { CATEGORIES } from "@/lib/types";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <span className="brand-wordmark text-lg">Use D&apos;lua</span>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Moda feminina atemporal, feita para mulheres que vestem a própria essência.
          </p>
        </div>

        <div>
          <p className="eyebrow">Categorias</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to="/categoria/$slug" params={{ slug: c.slug }} className="hover:text-foreground">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">Institucional</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/sobre" className="hover:text-foreground">Sobre a loja</Link>
            </li>
            <li>
              <Link to="/termos" className="hover:text-foreground">Termos de uso</Link>
            </li>
            <li>
              <Link to="/privacidade" className="hover:text-foreground">Política de privacidade</Link>
            </li>
            <li>
              <Link to="/conta" className="hover:text-foreground">Minha conta</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Redes sociais</p>
          <div className="mt-4 flex gap-4 text-muted-foreground">
            <a href="#" aria-label="Instagram" className="hover:text-gold"><Instagram className="h-5 w-5" /></a>
            <a href="#" aria-label="Facebook" className="hover:text-gold"><Facebook className="h-5 w-5" /></a>
            <a href="#" aria-label="E-mail" className="hover:text-gold"><Mail className="h-5 w-5" /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-border py-6 text-center text-xs tracking-wide text-muted-foreground">
        © {new Date().getFullYear()} Use D&apos;lua. Todos os direitos reservados.
      </div>
    </footer>
  );
}
