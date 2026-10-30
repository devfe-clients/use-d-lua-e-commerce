import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductImage } from "@/components/ProductImage";
import { CATEGORIES } from "@/lib/types";

// Otimiza imagens do Cloudinary: formato e qualidade automáticos + largura limitada
const cld = (url: string, w: number) => url.replace("/upload/", `/upload/f_auto,q_auto,w_${w}/`);
const BANNER_DESKTOP =
  "https://res.cloudinary.com/cmehevck/image/upload/v1791418035/WhatsApp_Image_2026-10-07_at_20.04.16.jpg";
const BANNER_MOBILE =
  "https://res.cloudinary.com/cmehevck/image/upload/v1792512910/WhatsApp_Image_2026-10-20_at_13.13.46.jpg";

const CATEGORY_IMAGES = [
  "https://res.cloudinary.com/cmehevck/image/upload/v1792505770/WhatsApp_Image_2026-10-20_at_11.15.10.jpg",
  "https://res.cloudinary.com/cmehevck/image/upload/v1791640868/WhatsApp_Image_2026-10-10_at_10.39..jpg",
  "https://res.cloudinary.com/cmehevck/image/upload/v1791640882/WhatsApp_Image_2026-10-10_at_10.39.1.jpg",
];
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
        content:
          "Blusas, calças e corsets femininos com design minimalista e acabamento impecável.",
      },
    ],
    links: [
      {
        rel: "preload",
        as: "image",
        href: cld(BANNER_MOBILE, 800),
        media: "(max-width: 767px)",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        href: cld(BANNER_DESKTOP, 1600),
        media: "(min-width: 768px)",
        fetchPriority: "high",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  useEffect(() => {
    if (isLoading || window.location.hash !== "#lancamentos") return;
    const timer = setTimeout(() => {
      document.getElementById("lancamentos")?.scrollIntoView({ behavior: "auto", block: "start" });
    }, 300);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const catRef = useRef<HTMLDivElement>(null);

  // Carrossel automático das categorias: avança um card por vez e volta ao primeiro no final
  useEffect(() => {
    const el = catRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout>;

    const pause = () => {
      paused = true;
      clearTimeout(resumeTimer);
    };
    const resume = () => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        paused = false;
      }, 2500);
    };

    const interval = setInterval(() => {
      if (paused) return;
      const first = el.firstElementChild as HTMLElement | null;
      if (!first) return;
      const step = first.offsetWidth + 20; // 20px = gap-5
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: step, behavior: "smooth" });
    }, 2000);

    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("pointerdown", pause);
    el.addEventListener("wheel", pause, { passive: true });
    el.addEventListener("mouseenter", pause);
    el.addEventListener("touchend", resume);
    el.addEventListener("pointerup", resume);
    el.addEventListener("pointercancel", resume);
    el.addEventListener("mouseleave", resume);

    return () => {
      clearInterval(interval);
      clearTimeout(resumeTimer);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("wheel", pause);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("touchend", resume);
      el.removeEventListener("pointerup", resume);
      el.removeEventListener("pointercancel", resume);
      el.removeEventListener("mouseleave", resume);
    };
  }, []);

  const marcados = products.filter((p) => p.launch);
  const lancamentos = [...(marcados.length > 0 ? marcados : products)]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
  const maisVendidos = products.filter((p) => p.bestSeller).slice(0, 8);

  return (
    <div>
      {/* Banner principal — substitua pela sua imagem */}
      <section className="relative">
        <div className="relative min-h-105 w-full md:min-h-0 md:aspect-1600/756">
          <div className="absolute inset-0">
            <picture>
              <source media="(min-width: 768px)" srcSet={cld(BANNER_DESKTOP, 1600)} />
              <img
                src={cld(BANNER_MOBILE, 800)}
                alt="Banner Use D'lua"
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </picture>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/10 px-6 text-center md:block md:px-0">
            <div className="md:absolute md:left-[29.2%] md:top-[12%] md:w-[48%] md:-translate-x-1/2">
              <p className="eyebrow">Moda Íntima Feminina</p>
              <h1 className="mt-4 text-4xl leading-tight md:text-[clamp(1.5rem,4.6vw,5rem)]">
                Assim Como a Lua <br className="hidden md:block" />
                somos feitas de Fases
              </h1>
              <p className="mt-4 text-sm text-ink/80 md:text-[clamp(0.875rem,1.25vw,1.25rem)]">
                Elegância e qualidade em cada detalhe
              </p>
            </div>
            <Link
              to="/busca"
              search={{ q: "" }}
              className="btn-gold mt-8 rounded-full md:absolute md:left-[26.5%] md:top-[60%] md:mt-0 md:-translate-y-1/2"
            >
              Ver coleção
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="eyebrow">Categorias em destaque</p>
          <h2 className="mt-2 text-3xl">Escolha o seu estilo</h2>
        </div>
        <div
          ref={catRef}
          className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-pl-4 px-4 pb-2 scrollbar-width:none [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:scroll-pl-6 sm:px-6 lg:-mx-8 lg:scroll-pl-8 lg:px-8"
        >
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.slug}
              to="/categoria/$slug"
              params={{ slug: c.slug }}
              className="group block w-[72%] shrink-0 snap-start sm:w-[45%] md:w-[calc((100%-2.5rem)/3)]"
            >
              <div className="relative aspect-4/5 overflow-hidden">
                <ProductImage
                  src={CATEGORY_IMAGES[i]}
                  alt={c.name}
                  label={`Foto ${c.name}`}
                  sizes="(min-width: 768px) 33vw, 72vw"
                />
              </div>
              <div className="py-4 text-center">
                <span className="text-xs uppercase tracking-[0.22em]">{c.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="lancamentos"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-20 sm:px-6 lg:px-8"
      >
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow">Novidades</p>
            <h2 className="mt-2 text-3xl">Lançamentos</h2>
          </div>
        </div>
        {isLoading ? (
          <div className="min-h-80" aria-hidden="true" />
        ) : (
          <ProductGrid products={lancamentos} carousel />
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="eyebrow">Favoritas das clientes</p>
          <h2 className="mt-2 text-3xl">Mais vendidos</h2>
        </div>
        {isLoading ? (
          <div className="min-h-80" aria-hidden="true" />
        ) : (
          <ProductGrid products={maisVendidos} carousel />
        )}
      </section>
    </div>
  );
}
