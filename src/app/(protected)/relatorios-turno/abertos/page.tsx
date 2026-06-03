import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Clock } from "lucide-react";

export default async function RelatoriosAbertosPage() {
  const relatorios = await prisma.relatorioTurno.findMany({
    where: { status: "ABERTO" },
    orderBy: { criadoEm: "desc" },
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios Abertos</h1>
        <p className="text-sm text-gray-500">Relatórios de turno em andamento</p>
      </div>

      {relatorios.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <Clock className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">Nenhum relatório aberto no momento.</p>
          <Link
            href="/relatorios-turno"
            className="mt-4 inline-block rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            ← Ver todos os relatórios
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {relatorios.map((r) => (
            <div key={r.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{formatDate(r.data)} — {r.turno}</p>
                  <p className="text-sm text-gray-500">{r.responsavelNome}</p>
                </div>
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  ABERTO
                </span>
              </div>
              <div className="mt-4 flex gap-4 text-xs text-gray-500">
                <span>{r._count.atendimentos} atendimento(s)</span>
                <span>{r._count.falhasNivelC} falha(s) C</span>
                <span>{r._count.pendencias} pendência(s)</span>
              </div>
              <p className="mt-2 text-xs text-gray-400">Criado em {formatDateTime(r.criadoEm)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
