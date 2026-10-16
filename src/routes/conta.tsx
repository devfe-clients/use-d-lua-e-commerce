import { useState } from "react";
import { Chrome } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/conta")({
  head: () => ({
    meta: [
      { title: "Minha conta — Use D'lua" },
      { name: "description", content: "Acesse sua conta Use D'lua e acompanhe seus pedidos." },
      { property: "og:title", content: "Minha conta — Use D'lua" },
      {
        property: "og:description",
        content: "Acesse sua conta Use D'lua e acompanhe seus pedidos.",
      },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading, configured, signIn, signUp, signInWithGoogle, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  // Estado separado para o botão do Google não desabilitar o formulário de e-mail
  const [busyGoogle, setBusyGoogle] = useState(false);

  async function submitGoogle() {
    setBusyGoogle(true);
    try {
      await signInWithGoogle();
      toast.success("Bem-vinda à Use D'lua!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível entrar com o Google.");
    } finally {
      setBusyGoogle(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") await signIn(email, password);
      else await signUp(name, email, password);
      toast.success("Bem-vinda à Use D'lua!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível continuar.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="py-32 text-center text-sm text-muted-foreground">Carregando…</p>;
  }

  if (user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="eyebrow">Minha conta</p>
        <h1 className="mt-2 text-3xl">Olá, {user.displayName ?? user.email}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Seus pedidos aparecerão aqui assim que o checkout estiver ativo.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/conta/pedidos" className="btn-gold">Meus pedidos</Link>
          <button onClick={() => void logout()} className="btn-outline-ink">
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <p className="eyebrow text-center">Minha conta</p>
      <h1 className="mt-2 text-center text-3xl">{mode === "login" ? "Entrar" : "Criar conta"}</h1>

      {!configured && (
        <p className="mt-6 border border-border bg-secondary p-4 text-xs leading-relaxed text-muted-foreground">
          O login ficará ativo assim que você preencher as chaves do Firebase no arquivo
          <code className="mx-1">.env</code> (veja <code>.env.example</code> e{" "}
          <code>FIREBASE.md</code>).
        </p>
      )}

      <form onSubmit={submit} className="mt-8 space-y-4">
        {mode === "signup" && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome completo"
            required
            className="w-full border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          required
          className="w-full border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          required
          minLength={6}
          className="w-full border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
        <button type="submit" disabled={busy || !configured} className="btn-gold w-full">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      {/* Separador visual entre os dois métodos de login */}
      <div className="mt-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-[0.16em]">ou</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Botão de login com Google — usa o popup do Firebase */}
      <button
        onClick={() => void submitGoogle()}
        disabled={busyGoogle || !configured}
        className="btn-outline-ink mt-4 flex w-full items-center justify-center gap-2"
      >
        <Chrome className="h-4 w-4" />
        {busyGoogle ? "Entrando…" : "Entrar com Google"}
      </button>

      <button
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        className="mt-6 w-full text-center text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
      >
        {mode === "login" ? "Não tenho conta — criar agora" : "Já tenho conta — entrar"}
      </button>
    </div>
  );
}
