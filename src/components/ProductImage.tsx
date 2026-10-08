import { cn } from "@/lib/utils";

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
}: {
  src?: string | undefined;
  alt: string;
  className?: string | undefined;
  label?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div className={cn("image-placeholder h-full w-full", className)}>
        <span>{label}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding={priority ? "sync" : "async"}
    />
  );
}
