import { cn } from "@/lib/utils";

const WIDTHS = [320, 480, 640, 800, 1200];

// Insere f_auto (WebP/AVIF), q_auto e largura máxima na URL do Cloudinary
function cld(url: string, w: number) {
  return url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${w}/`);
}

function isCloudinary(url: string) {
  return (
    url.includes("res.cloudinary.com") &&
    url.includes("/upload/") &&
    !url.includes("/upload/f_auto")
  );
}

/**
 * Exibe a foto do produto. Enquanto não houver imagem cadastrada,
 * mostra um espaço reservado elegante.
 */
export function ProductImage({
  src,
  alt,
  className,
  label = "Foto do produto",
  priority = false,
  sizes = "(min-width: 1024px) 400px, 70vw",
}: {
  src?: string | undefined;
  alt: string;
  className?: string | undefined;
  label?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (!src) {
    return (
      <div className={cn("image-placeholder h-full w-full", className)}>
        <span>{label}</span>
      </div>
    );
  }
  const optimized = isCloudinary(src);
  return (
    <img
      src={optimized ? cld(src, 800) : src}
      srcSet={optimized ? WIDTHS.map((w) => `${cld(src, w)} ${w}w`).join(", ") : undefined}
      sizes={optimized ? sizes : undefined}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding={priority ? "sync" : "async"}
    />
  );
}
