import { prisma } from "@/lib/prisma";
import { listarMateriaisAbaixoMinimo } from "@/repositories/material.repository";
import { contarEquipamentosPorStatus } from "@/repositories/equipamento.repository";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/utils";
import { AlertTriangle, Clock, Cpu } from "lucide-react";

export default async function DashboardPage() {
  const [statusCounts, abaixoMinimo, ultimasMov] = await Promise.all([
    contarEquipamentosPorStatus(),
    listarMateriaisAbaixoMinimo(),
    prisma.movimentacaoEquipamento.findMany({
      take: 10,
      orderBy: { criadoEm: "desc" },
      include: {
        equipamento: { select: { numeroSerie: true, descricao: true } },
        usuario: { select: { nome: true } },
      },
    }),
  ]);

  const countByStatus = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count.id])
  );

  const statsCards = [
    {
      label: "Em Estoque",
      value: countByStatus["EM_ESTOQUE"] ?? 0,
      color: "bg-green-500",
      href: "/equipamentos?status=EM_ESTOQUE",
    },
    {
      label: "Instalados em TUE",
      value: countByStatus["INSTALADO_TUE"] ?? 0,
      color: "bg-blue-500",
      href: "/equipamentos?status=INSTALADO_TUE",
    },
    {
      label: "Aguardando Reparo",
      value: countByStatus["AGUARDANDO_REPARO"] ?? 0,
      color: "bg-yellow-500",
      href: "/equipamentos?status=AGUARDANDO_REPARO",
    },
    {
      label: "Em Reparo",
      value: countByStatus["EM_REPARO"] ?? 0,
      color: "bg-orange-500",
      href: "/equipamentos?status=EM_REPARO",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Visão geral do estoque e rastreabilidade</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color}`}>
              <Cpu className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h2 className="font-semibold text-gray-900">Estoque Crítico</h2>
              {abaixoMinimo.length > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                  {abaixoMinimo.length}
                </span>
              )}
            </div>
            <Link href="/consultas/estoque-critico" className="text-xs text-blue-600 hover:underline">
              Ver todos
            </Link>
          </div>
          {abaixoMinimo.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">Nenhum item abaixo do mínimo.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {abaixoMinimo.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.codigoTrensurb}</p>
                    <p className="text-xs text-gray-500">{m.descricao}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-red-600">
                      {m.quantidadeAtual} {m.unidade}
                    </span>
                    <p className="text-xs text-gray-400">mín: {m.estoqueMinimo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-200 p-4">
            <Clock className="h-4 w-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Últimas Movimentações</h2>
          </div>
          {ultimasMov.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">Nenhuma movimentação registrada.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {ultimasMov.map((m) => (
                <div key={m.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/equipamentos/${m.equipamentoId}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {m.equipamento.numeroSerie}
                    </Link>
                    <StatusBadge status={m.statusNovo} />
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{m.equipamento.descricao}</p>
                  <p className="text-xs text-gray-400">
                    {formatDateTime(m.realizadoEm)} - {m.usuario.nome}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">Ações Rápidas</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/materiais/novo", label: "Novo Material" },
            { href: "/equipamentos/novo", label: "Novo Equipamento" },
            { href: "/movimentacoes/consumiveis/nova", label: "Mov. Consumível" },
            { href: "/movimentacoes/equipamentos/instalacao", label: "Instalar em TUE" },
            { href: "/movimentacoes/equipamentos/envio-reparo", label: "Enviar p/ Reparo" },
            { href: "/movimentacoes/equipamentos/retorno-reparo", label: "Retorno de Reparo" },
            { href: "/auditoria", label: "Auditoria" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
