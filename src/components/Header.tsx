import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { CATEGORIES } from "@/lib/types";
import { useCart } from "@/lib/cart";

export function Header() {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { count } = useCart();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    navigate({ to: "/busca", search: { q: term.trim() } });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
        <button
          className="lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="brand-wordmark text-xl leading-none sm:text-2xl">
          Use D&apos;lua
        </Link>

        <nav className="ml-8 hidden items-center gap-8 lg:flex">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/categoria/$slug"
              params={{ slug: c.slug }}
              className="text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <form onSubmit={submit} className="ml-auto hidden max-w-xs flex-1 items-center md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar peças"
              className="w-full border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-gold"
              aria-label="Buscar produtos"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-4 md:ml-4">
          <Link to="/conta" aria-label="Minha conta" className="hover:text-gold">
            <User className="h-5 w-5" />
          </Link>
          <Link to="/carrinho" aria-label="Carrinho" className="relative hover:text-gold">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] text-ink">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <form onSubmit={submit} className="mb-4">
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar peças"
              className="w-full border border-border bg-card px-3 py-2 text-sm outline-none focus:border-gold"
              aria-label="Buscar produtos"
            />
          </form>
          <nav className="flex flex-col gap-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to="/categoria/$slug"
                params={{ slug: c.slug }}
                onClick={() => setOpen(false)}
                className="text-xs uppercase tracking-[0.18em] text-muted-foreground"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
