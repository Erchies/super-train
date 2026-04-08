import { listarMateriais } from "@/repositories/material.repository";
import { PageHeader } from "@/components/shared/page-header";
import { StockBadge } from "@/components/shared/status-badge";
import Link from "next/link";
import { Plus, ArrowLeftRight, Search, Eye, Truck } from "lucide-react";

export default async function MateriaisPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const materiais = await listarMateriais({ busca: searchParams.q });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Materiais Consumíveis"
        description="Gerencie o estoque de materiais consumíveis da frota."
      >
        <Link
          href="/movimentacoes/consumiveis/nova"
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Nova Movimentação
        </Link>
        <Link
          href="/materiais/novo"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Material
        </Link>
      </PageHeader>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <form method="GET" className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={searchParams.q ?? ""}
              placeholder="Buscar por código, descrição ou localização..."
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Buscar
          </button>
          {searchParams.q && (
            <Link
              href="/materiais"
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Limpar
            </Link>
          )}
        </form>
      </div>

      {searchParams.q && (
        <p className="text-sm text-gray-500">
          {materiais.length} resultado{materiais.length !== 1 ? "s" : ""} para{" "}
          <span className="font-medium">&ldquo;{searchParams.q}&rdquo;</span>
        </p>
      )}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        {materiais.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              {searchParams.q
                ? "Nenhum material encontrado para esta busca."
                : "Nenhum material cadastrado."}
            </p>
            {!searchParams.q && (
              <Link
                href="/materiais/novo"
                className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <Plus className="h-4 w-4" />
                Cadastrar primeiro material
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Código Trensurb
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Descrição
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Unidade
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Saldo Atual
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Est. Mínimo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Localização
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {materiais.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-mono font-medium text-gray-900">
                      {material.codigoTrensurb}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                      <span className="line-clamp-2">{material.descricao}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {material.unidade}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-medium text-gray-900">{material.quantidadeAtual}</span>
                        <StockBadge atual={material.quantidadeAtual} estoqueMinimo={material.estoqueMinimo} />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-right text-gray-600">
                      {material.estoqueMinimo ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {material.localizacao ? `${material.localizacao.codigo} - ${material.localizacao.descricao}` : (
                        <span className="text-gray-400 italic">Não definida</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/materiais/${material.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Detalhes
                        </Link>
                        <Link
                          href={`/movimentacoes/consumiveis/nova?materialId=${material.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                          title="Registrar movimentação"
                        >
                          <Truck className="h-3.5 w-3.5" />
                          Movimentar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {materiais.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          {materiais.length} material{materiais.length !== 1 ? "is" : ""} listado{materiais.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
