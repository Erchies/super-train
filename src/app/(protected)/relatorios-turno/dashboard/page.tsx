import { prisma } from "@/lib/prisma";
import { AlertTriangle, CheckCircle, Clock, ClipboardList, XCircle } from "lucide-react";

export default async function DashboardPlantaoPage() {
  const [
    totalRelatorios,
    abertos,
    totalAtendimentos,
    falhasPendentes,
    pendenciasPendentes,
    ultimosRelatorios,
  ] = await Promise.all([
    prisma.relatorioTurno.count(),
    prisma.relatorioTurno.count({ where: { status: "ABERTO" } }),
    prisma.atendimentoTurno.count(),
    prisma.falhaNivelC.count({ where: { status: "PENDENTE" } }),
    prisma.pendenciaTurno.count({ where: { status: "PENDENTE" } }),
    prisma.relatorioTurno.findMany({
      take: 5,
      orderBy: { criadoEm: "desc" },
      select: {
        id: true,
        data: true,
        turno: true,
        responsavelNome: true,
        status: true,
        _count: { select: { atendimentos: true } },
      },
    }),
  ]);

  const cards = [
    {
      label: "Relatórios Totais",
      value: totalRelatorios,
      icon: ClipboardList,
      color: "bg-blue-500",
    },
    {
      label: "Abertos Agora",
      value: abertos,
      icon: Clock,
      color: "bg-green-500",
    },
    {
      label: "Atendimentos Registrados",
      value: totalAtendimentos,
      icon: CheckCircle,
      color: "bg-purple-500",
    },
    {
      label: "Falhas C Pendentes",
      value: falhasPendentes,
      icon: AlertTriangle,
      color: falhasPendentes > 0 ? "bg-red-500" : "bg-gray-400",
    },
    {
      label: "Pendências Abertas",
      value: pendenciasPendentes,
      icon: XCircle,
      color: pendenciasPendentes > 0 ? "bg-orange-500" : "bg-gray-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard do Plantão</h1>
        <p className="text-sm text-gray-500">Visão geral dos relatórios de turno e indicadores</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color}`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900">Últimos Relatórios</h2>
        </div>
        {ultimosRelatorios.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">Nenhum relatório registrado.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {ultimosRelatorios.map((r) => {
              const statusColor =
                r.status === "ABERTO"
                  ? "bg-green-100 text-green-700"
                  : r.status === "CANCELADO"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700";

              return (
                <div key={r.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(r.data).toLocaleDateString("pt-BR")} — {r.turno}
                    </p>
                    <p className="text-xs text-gray-500">{r.responsavelNome} · {r._count.atendimentos} atendimento(s)</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                    {r.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
