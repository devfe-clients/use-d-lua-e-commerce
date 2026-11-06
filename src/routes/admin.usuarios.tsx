import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminFetchUsers } from "@/lib/admin";

export const Route = createFileRoute("/admin/usuarios")({
  component: AdminUsuarios,
});

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR");
}

function AdminUsuarios() {
  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: adminFetchUsers,
  });

  return (
    <div>
      <h1 className="mb-8 text-2xl">Usuários</h1>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      {error && (
        <p className="text-sm text-destructive">
          Não foi possível carregar os usuários. Verifique as regras do Firestore.
        </p>
      )}

      {!isLoading && !error && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {users.length} {users.length === 1 ? "usuário cadastrado" : "usuários cadastrados"}
          </p>

          <div className="flex flex-col gap-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between gap-4 rounded border border-border px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{u.name || "Sem nome"}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(u.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
