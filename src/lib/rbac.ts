/**
 * Controle de acesso por perfil (RBAC).
 *
 * Define quais perfis podem acessar cada grupo de rotas.
 * Perfis superiores herdam acesso dos inferiores:
 *   ADMIN > SUPERVISOR > OPERADOR
 */

export type Perfil = "OPERADOR" | "SUPERVISOR" | "ADMIN";

const PERFIL_NIVEL: Record<Perfil, number> = {
  OPERADOR: 1,
  SUPERVISOR: 2,
  ADMIN: 3,
};

/** Rotas que exigem perfil mínimo acima de OPERADOR */
const ROTAS_RESTRITAS: { prefixo: string; perfilMinimo: Perfil }[] = [
  { prefixo: "/cadastros/usuarios", perfilMinimo: "ADMIN" },
  { prefixo: "/auditoria", perfilMinimo: "SUPERVISOR" },
];

/**
 * Verifica se um perfil tem acesso a um pathname.
 * Retorna true se permitido, false se bloqueado.
 */
export function temAcessoRota(perfil: string, pathname: string): boolean {
  const nivel = PERFIL_NIVEL[perfil as Perfil];
  if (!nivel) return false;

  for (const regra of ROTAS_RESTRITAS) {
    if (pathname.startsWith(regra.prefixo)) {
      return nivel >= PERFIL_NIVEL[regra.perfilMinimo];
    }
  }

  // Rotas não listadas são acessíveis a todos os perfis autenticados
  return true;
}

/**
 * Retorna o perfil mínimo exigido para uma rota, ou null se a rota é aberta a todos.
 */
export function perfilMinimoPara(pathname: string): Perfil | null {
  for (const regra of ROTAS_RESTRITAS) {
    if (pathname.startsWith(regra.prefixo)) {
      return regra.perfilMinimo;
    }
  }
  return null;
}
