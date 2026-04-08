import Link from "next/link";
import { listarEquipamentos } from "@/repositories/equipamento.repository";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { LABELS_COMPATIBILIDADE, LABELS_STATUS_EQUIPAMENTO } from "@/lib/utils";
import { Search } from "lucide-react";

interface PageProps {
  searchParams: { status?: string; compatibilidade?: string; q?: string };
}

export default async function EquipamentosPage({ searchParams }: PageProps) {
  const statusFiltro = searchParams.status || undefined;
  const compatFiltro = searchParams.compatibilidade || undefined;
  const busca = searchParams.q || undefined;

  const equipamentos = await listarEquipamentos({
    status: statusFiltro as never,
    compatibilidade: compatFiltro,
    busca,
  });

  const statusOptions = Object.entries(LABELS_STATUS_EQUIPAMENTO);
  const compatOptions = Object.entries(LABELS_COMPATIBILIDADE);

  function getLocalizacao(eq: (typeof equipamentos)[0]): string {
    if (eq.tue) {
      const carro = (eq as any).carro;
      const posicaoInstalada = (eq as any).posicaoInstalada;
      let s = `TUE ${eq.tue.numero}`;
      if (carro) s += ` / ${carro}`;
      if (posicaoInstalada) s += ` / ${posicaoInstalada}`;
      return s;
    }
    if ((eq as any).localizacao) {
      return `${(eq as any).localizacao.codigo} - ${(eq as any).localizacao.descricao}`;
    }
    return "-";
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Equipamentos" description={`${equipamentos.length} equipamento(s) encontrado(s)`}>
        <Link
          href="/equipamentos/novo"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Novo Equipamento
        </Link>
      </PageHeader>

      <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <form method="GET" className="flex gap-2">
          {statusFiltro && <input type="hidden" name="status" value={statusFiltro} />}
          {compatFiltro && <input type="hidden" name="compatibilidade" value={compatFiltro} />}
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              name="q"
              defaultValue={busca}
              placeholder="Buscar por série, código ou descrição..."
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            Buscar
          </button>
          {(busca || statusFiltro || compatFiltro) && (
            <Link href="/equipamentos" className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              Limpar
            </Link>
          )}
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase text-gray-500">Status:</span>
          <Link
            href={`/equipamentos?${compatFiltro ? `compatibilidade=${compatFiltro}&` : ""}${busca ? `q=${busca}` : ""}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!statusFiltro ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Todos
          </Link>
          {statusOptions.map(([value, label]) => (
            <Link
              key={value}
              href={`/equipamentos?status=${value}${compatFiltro ? `&compatibilidade=${compatFiltro}` : ""}${busca ? `&q=${busca}` : ""}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${statusFiltro === value ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase text-gray-500">Série:</span>
          <Link
            href={`/equipamentos?${statusFiltro ? `status=${statusFiltro}&` : ""}${busca ? `q=${busca}` : ""}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!compatFiltro ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Todas
          </Link>
          {compatOptions.map(([value, label]) => (
            <Link
              key={value}
              href={`/equipamentos?compatibilidade=${value}${statusFiltro ? `&status=${statusFiltro}` : ""}${busca ? `&q=${busca}` : ""}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${compatFiltro === value ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {equipamentos.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium">Nenhum equipamento encontrado</p>
            <p className="mt-1 text-sm">Tente ajustar os filtros ou cadastre um novo equipamento.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">N° Série</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Cód. Trensurb</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Descrição</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Série</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Localização / TUE</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {equipamentos.map((eq) => (
                  <tr key={eq.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-900">{eq.numeroSerie}</td>
                    <td className="px-4 py-3 text-gray-600">{eq.codigoTrensurb || "-"}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-gray-900">{eq.descricao}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {LABELS_COMPATIBILIDADE[eq.compatibilidade as keyof typeof LABELS_COMPATIBILIDADE] ?? eq.compatibilidade ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={eq.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{getLocalizacao(eq)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/equipamentos/${eq.id}`} className="font-medium text-blue-600 hover:text-blue-800">
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
