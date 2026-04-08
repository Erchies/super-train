import { listarMateriaisAbaixoMinimo } from "@/repositories/material.repository";
import { PageHeader } from "@/components/shared/page-header";
import Link from "next/link";
import { AlertTriangle, Package } from "lucide-react";

export const metadata = {
  title: "Estoque Crítico",
};

export default async function EstoqueCriticoPage() {
  const materiais = await listarMateriaisAbaixoMinimo();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estoque Crítico"
        description="Materiais com saldo atual abaixo do estoque mínimo definido"
      />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          <span>
            {materiais.length === 0
              ? "Nenhum material em estoque crítico"
              : `${materiais.length} material${materiais.length !== 1 ? "is" : ""} em estoque crítico`}
          </span>
        </div>
      </div>

      {materiais.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <Package className="mb-3 h-10 w-10 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">Todos os materiais estão com estoque adequado</p>
          <p className="mt-1 text-xs text-gray-400">Nenhum item abaixo do estoque mínimo no momento</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Código</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Descrição</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Unidade</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Saldo Atual</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Estoque Mínimo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Localização</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {materiais.map((material) => {
                const isZero = material.quantidadeAtual === 0;
                return (
                  <tr key={material.id} className="transition-colors hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-mono font-medium text-gray-900">{material.codigoTrensurb}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{material.descricao}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{material.unidade}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-semibold ${
                          isZero ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {material.quantidadeAtual}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">{material.estoqueMinimo}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {material.localizacao ? (
                        `${material.localizacao.codigo} - ${material.localizacao.descricao}`
                      ) : (
                        <span className="italic text-gray-400">Não definida</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <Link
                        href={`/materiais/${material.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Ver detalhe
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
