"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronRight,
  Cpu,
  FileUp,
  FolderOpen,
  LayoutDashboard,
  ClipboardList,
  Package,
  Search,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href?: string;
  icon: React.ElementType;
  /** Perfil mínimo necessário para ver este item. Ausente = todos. */
  perfilMinimo?: "SUPERVISOR" | "ADMIN";
  children?: { label: string; href: string; perfilMinimo?: "SUPERVISOR" | "ADMIN" }[];
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Materiais",
    icon: Package,
    children: [
      { label: "Listar Materiais", href: "/materiais" },
      { label: "Novo Material", href: "/materiais/novo" },
      { label: "Nova Movimentação", href: "/movimentacoes/consumiveis/nova" },
    ],
  },
  {
    label: "Equipamentos",
    icon: Cpu,
    children: [
      { label: "Listar Equipamentos", href: "/equipamentos" },
      { label: "Novo Equipamento", href: "/equipamentos/novo" },
    ],
  },
  {
    label: "Movimentações",
    icon: ArrowLeftRight,
    children: [
      { label: "Instalação em TUE", href: "/movimentacoes/equipamentos/instalacao" },
      { label: "Retirada de TUE", href: "/movimentacoes/equipamentos/retirada" },
      { label: "Envio para Reparo", href: "/movimentacoes/equipamentos/envio-reparo" },
      { label: "Retorno de Reparo", href: "/movimentacoes/equipamentos/retorno-reparo" },
      { label: "Transferência TUE", href: "/movimentacoes/equipamentos/transferencia-tue" },
      { label: "Baixa para Sucata", href: "/movimentacoes/equipamentos/sucata" },
    ],
  },
  {
    label: "Cadastros",
    icon: FolderOpen,
    children: [
      { label: "Localizações", href: "/cadastros/localizacoes" },
      { label: "TUEs", href: "/cadastros/tues" },
      { label: "Carros", href: "/cadastros/carros" },
      { label: "Posições", href: "/cadastros/posicoes" },
      { label: "Oficinas", href: "/cadastros/oficinas" },
      { label: "Atividades", href: "/cadastros/atividades" },
      { label: "Usuários", href: "/cadastros/usuarios", perfilMinimo: "ADMIN" },
    ],
  },
  {
    label: "Consultas",
    icon: Search,
    children: [
      { label: "Estoque Crítico", href: "/consultas/estoque-critico" },
      { label: "Equipamentos por TUE", href: "/consultas/por-tue" },
      { label: "Histórico por Série", href: "/consultas/historico" },
      { label: "Rastreabilidade OS", href: "/consultas/rastreabilidade" },
    ],
  },
  {
    label: "Importação",
    icon: FileUp,
    children: [
      { label: "Relatório Diário", href: "/importacao/relatorio-diario" },
      { label: "Levantamento de Estoque", href: "/importacao/levantamento" },
    ],
  },
  {
    label: "Relatórios de Turno",
    icon: ClipboardList,
    children: [
      { label: "Lista de relatórios", href: "/relatorios-turno" },
      { label: "Novo relatório", href: "/relatorios-turno/novo" },
      { label: "Abertos/em andamento", href: "/relatorios-turno/abertos" },
      { label: "Falhas nível C pendentes", href: "/relatorios-turno/falhas-nivel-c" },
      { label: "Dashboard do plantão", href: "/relatorios-turno/dashboard" },
    ],
  },
  { label: "Auditoria", href: "/auditoria", icon: Shield, perfilMinimo: "SUPERVISOR" },
];

const PERFIL_NIVEL: Record<string, number> = {
  OPERADOR: 1,
  SUPERVISOR: 2,
  ADMIN: 3,
};

function temAcesso(perfil: string, perfilMinimo?: string): boolean {
  if (!perfilMinimo) return true;
  return (PERFIL_NIVEL[perfil] ?? 0) >= (PERFIL_NIVEL[perfilMinimo] ?? 99);
}

export function Sidebar({ perfil = "OPERADOR" }: { perfil?: string }) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>(["Materiais", "Equipamentos"]);

  function toggleGroup(label: string) {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  }

  // Filtra itens de navegação baseado no perfil do usuário
  const filteredNavItems = navItems
    .filter((item) => temAcesso(perfil, item.perfilMinimo))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => temAcesso(perfil, child.perfilMinimo)),
    }));

  return (
    <div className="flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
            <span className="text-xs font-bold text-white">T</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Trensurb</p>
            <p className="text-xs text-gray-500">Estoque & Rastreabilidade</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {filteredNavItems.map((item) => {
          if (item.href) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          }

          const visibleChildren = item.children ?? [];
          if (visibleChildren.length === 0) return null;

          const isOpen = openGroups.includes(item.label);
          const hasActive = visibleChildren.some((c) => pathname.startsWith(c.href));

          return (
            <div key={item.label} className="mb-1">
              <button
                onClick={() => toggleGroup(item.label)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  hasActive ? "text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>

              {isOpen && (
                <div className="mt-1 ml-7 space-y-1">
                  {visibleChildren.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "block rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                        pathname === child.href
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
