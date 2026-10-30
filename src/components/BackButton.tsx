import { useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();
  const navigate = useNavigate();

  function goBack() {
    if (window.history.length > 1) {
      router.history.back();
    } else {
      navigate({ to: "/" });
    }
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Voltar"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:border-gold hover:text-gold"
    >
      <ArrowLeft className="h-4 w-4" />
    </button>
  );
}
