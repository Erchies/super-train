import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerSession } from "@/lib/session";
import { temAcessoRota } from "@/lib/rbac";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  // RBAC: verificar se o perfil do usuário tem acesso à rota atual
  const headersList = headers();
  const pathname = headersList.get("x-next-pathname") || headersList.get("x-invoke-path") || "";

  if (pathname && !temAcessoRota(session.perfil, pathname)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar perfil={session.perfil} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={session} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
