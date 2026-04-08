import { getServerSession as nextAuthGetServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  perfil: "OPERADOR" | "SUPERVISOR" | "ADMIN";
};

export async function getServerSession() {
  const session = await nextAuthGetServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as SessionUser;
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getServerSession();
  if (!user) throw new Error("Não autenticado");
  return user;
}

export function canAuthorizeExcecao(perfil: string): boolean {
  return perfil === "SUPERVISOR" || perfil === "ADMIN";
}
