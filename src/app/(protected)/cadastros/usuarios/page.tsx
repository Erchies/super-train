import { CheckCircle, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { UsuarioForm } from "./usuario-form";

function perfilLabel(perfil: string) {
  const labels: Record<string, string> = {
    OPERADOR: "Operador",
    SUPERVISOR: "Supervisor",
    ADMIN: "Admin",
  };

  return labels[perfil] ?? perfil;
}

export default async function UsuariosPage() {
  const session = await requireSession();

  if (session.perfil !== "ADMIN") {
    return (
      <div>
        <PageHeader
          title="Usuarios"
          description="Cadastro interno de acessos ao sistema"
          breadcrumbs={[{ label: "Cadastros" }, { label: "Usuarios" }]}
        />
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <h2 className="text-base font-semibold text-red-800">Acesso negado</h2>
          <p className="mt-1">Apenas usuarios com perfil ADMIN podem acessar este cadastro.</p>
        </div>
      </div>
    );
  }

  const usuarios = await prisma.usuario.findMany({
    orderBy: [{ nome: "asc" }, { email: "asc" }],
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
      ativo: true,
    },
  });

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Cadastro interno de acessos ao sistema"
        breadcrumbs={[{ label: "Cadastros" }, { label: "Usuarios" }]}
      />

      <div className="mb-6">
        <UsuarioForm />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Nome</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">E-mail</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Perfil</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className={usuario.ativo ? "" : "opacity-60"}>
                <td className="px-4 py-3 font-medium text-gray-900">{usuario.nome}</td>
                <td className="px-4 py-3 text-gray-700">{usuario.email}</td>
                <td className="px-4 py-3 text-gray-700">{perfilLabel(usuario.perfil)}</td>
                <td className="px-4 py-3">
                  {usuario.ativo ? (
                    <span className="flex items-center gap-1 text-xs text-green-700">
                      <CheckCircle className="h-3 w-3" /> Ativo
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-500">
                      <XCircle className="h-3 w-3" /> Inativo
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  Nenhum usuario cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
