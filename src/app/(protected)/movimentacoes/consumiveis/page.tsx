import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { formatDateTime, LABELS_TIPO_MOV_CONSUMIVEL } from "@/lib/utils";

export default async function MovimentacoesConsumiveisPage() {
  const movimentacoes = await prisma.movimentacaoConsumivel.findMany({
    take: 100,
    orderBy: { realizadoEm: "desc" },
    include: {
      material: { select: { codigoTrensurb: true, descricao: true, unidade: true } },
      atividade: { select: { codigo: true } },
      usuario: { select: { nome: true } },
    },
  });

  const tipoColors: Record<string, string> = {
    ENTRADA: "bg-green-100 text-green-800",
    SAIDA: "bg-blue-100 text-blue-800",
    AJUSTE_POSITIVO: "bg-yellow-100 text-yellow-800",
    AJUSTE_NEGATIVO: "bg-orange-100 text-orange-800",
  };

  return (
    <div>
      <PageHeader
        title="Movimentações de Materiais"
        description="Histórico das últimas 100 movimentações de consumíveis"
        breadcrumbs={[{ label: "Movimentações" }, { label: "Consumíveis" }]}
        action={
          <Link
            href="/movimentacoes/consumiveis/nova"
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Nova Movimentação
          </Link>
        }
      />

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Data</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Material</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Tipo</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Qtd</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Rastreabilidade</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Responsável</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Exc.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {movimentacoes.map((m) => (
              <tr key={m.id} className={m.ehExcecao ? "bg-orange-50" : ""}>
                <td className="whitespace-nowrap px-4 py-2.5 text-xs text-gray-500">{formatDateTime(m.realizadoEm)}</td>
                <td className="px-4 py-2.5">
                  <Link
                    href={`/materiais/${m.materialId}`}
                    className="font-mono text-xs font-medium text-blue-600 hover:underline"
                  >
                    {m.material.codigoTrensurb}
                  </Link>
                  <p className="max-w-[160px] truncate text-xs text-gray-500">{m.material.descricao}</p>
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      tipoColors[m.tipo] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {LABELS_TIPO_MOV_CONSUMIVEL[m.tipo] ?? m.tipo}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right text-sm font-medium">
                  {m.tipo === "SAIDA" || m.tipo === "AJUSTE_NEGATIVO" ? (
                    <span className="text-red-600">-{m.quantidade}</span>
                  ) : (
                    <span className="text-green-600">+{m.quantidade}</span>
                  )}
                  <span className="ml-1 text-xs text-gray-400">{m.material.unidade}</span>
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-600">
                  {m.numeroOS && <span className="mr-1">OS: {m.numeroOS}</span>}
                  {m.numeroChamado && <span className="mr-1">CHM: {m.numeroChamado}</span>}
                  {m.atividade && (
                    <span className="rounded bg-purple-50 px-1.5 py-0.5 text-xs text-purple-700">{m.atividade.codigo}</span>
                  )}
                  {!m.numeroOS && !m.numeroChamado && !m.atividade && <span className="text-gray-400">-</span>}
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-600">{m.usuario.nome}</td>
                <td className="px-4 py-2.5 text-center">
                  {m.ehExcecao && (
                    <span title={m.justificativa ?? ""} className="text-xs font-bold text-orange-500">
                      EXC
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {movimentacoes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Nenhuma movimentação registrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
