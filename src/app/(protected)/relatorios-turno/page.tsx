import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime } from "@/lib/utils";
import { ClipboardList, Plus } from "lucide-react";

export default async function RelatoriosTurnoPage() {
  const relatorios = await prisma.relatorioTurno.findMany({
    orderBy: { criadoEm: "desc" },
    take: 50,
    include: {
      responsavel: { select: { nome: true } },
      _count: {
        select: {
          atendimentos: true,
          falhasNivelC: true,
          pendencias: true,
        },
      },
    },
  });

  const statusColors: Record<string, string> = {
    ABERTO: "bg-green-100 text-green-700",
    FECHADO: "bg-gray-100 text-gray-700",
    CANCELADO: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios de Turno</h1>
          <p className="text-sm text-gray-500">Plantão Corretiva SEOFI</p>
        </div>
        <Link
          href="/relatorios-turno/novo"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Relatório
        </Link>
      </div>

      {relatorios.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">Nenhum relatório de turno encontrado.</p>
          <Link
            href="/relatorios-turno/novo"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Criar Primeiro Relatório
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Data</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Turno</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Responsável</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Atendimentos</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Falhas C</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Pendências</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {relatorios.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{formatDate(r.data)}</td>
                  <td className="px-4 py-3 text-gray-600">{r.turno}</td>
                  <td className="px-4 py-3 text-gray-600">{r.responsavelNome}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{r._count.atendimentos}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{r._count.falhasNivelC}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{r._count.pendencias}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[r.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDateTime(r.criadoEm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
