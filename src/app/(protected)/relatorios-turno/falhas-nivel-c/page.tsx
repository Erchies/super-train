import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export default async function FalhasNivelCPage() {
  const falhas = await prisma.falhaNivelC.findMany({
    where: { status: "PENDENTE" },
    orderBy: [{ prioridade: "asc" }, { dataAbertura: "desc" }],
    include: {
      tue: { select: { numero: true } },
      relatorioTurno: { select: { data: true, turno: true } },
    },
  });

  const prioridadeColors: Record<string, string> = {
    ALTA: "bg-red-100 text-red-700",
    MEDIA: "bg-yellow-100 text-yellow-700",
    BAIXA: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Falhas Nível C Pendentes</h1>
          <p className="text-sm text-gray-500">
            {falhas.length} falha(s) pendente(s) de resolução
          </p>
        </div>
      </div>

      {falhas.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">Nenhuma falha nível C pendente.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Prioridade</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">TUE</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Origem</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Descrição</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">OS/PI/Ticket</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Abertura</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Recolhimento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {falhas.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${prioridadeColors[f.prioridade] ?? "bg-gray-100 text-gray-700"}`}>
                      {f.prioridade}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{f.tueNumero ?? f.tue?.numero ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{f.origemFalha}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{f.descricaoFalha}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {[f.numeroOS, f.numeroPI, f.numeroTicket].filter(Boolean).join(" / ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(f.dataAbertura)}</td>
                  <td className="px-4 py-3 text-xs">
                    {f.necessitaRecolhimento ? (
                      <span className={f.recolhimentoSolicitado ? "text-green-600" : "text-red-600 font-medium"}>
                        {f.recolhimentoSolicitado ? "Solicitado" : "Necessário"}
                      </span>
                    ) : (
                      <span className="text-gray-400">Não</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
