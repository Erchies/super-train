import { listarTUEs } from "@/repositories/cadastros.repository";
import { listarEquipamentosPorTUE } from "@/repositories/equipamento.repository";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ChevronDown, Package, Train } from "lucide-react";

export const metadata = {
  title: "Consulta por TUE",
};

interface PageProps {
  searchParams: { tueId?: string };
}

export default async function PorTuePage({ searchParams }: PageProps) {
  const tues = await listarTUEs();
  const selectedTueId = searchParams.tueId ?? "";

  const equipamentos = selectedTueId
    ? await listarEquipamentosPorTUE(selectedTueId)
    : [];

  const selectedTue = tues.find((t) => t.id === selectedTueId) ?? null;

  const totalEquipamentosInstalados = equipamentos.filter(
    (e) => e.status === "INSTALADO_TUE"
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consulta por TUE"
        description="Visualize os equipamentos instalados por Trem de Uso Exclusivo"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-blue-50 p-2">
            <Train className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total de TUEs</p>
            <p className="text-2xl font-bold text-gray-900">{tues.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-green-50 p-2">
            <Package className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Equipamentos Instalados</p>
            <p className="text-2xl font-bold text-gray-900">
              {selectedTueId ? totalEquipamentosInstalados : "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <form method="GET" className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="tueId" className="mb-1 block text-sm font-medium text-gray-700">
              Selecionar TUE
            </label>
            <div className="relative">
              <select
                id="tueId"
                name="tueId"
                defaultValue={selectedTueId}
                className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- Selecione uma TUE --</option>
                {tues.map((tue) => (
                  <option key={tue.id} value={tue.id}>
                    {tue.numero} {tue.descricao ? `- ${tue.descricao}` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Consultar
          </button>
        </form>
      </div>

      {selectedTueId && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              Equipamentos da TUE <span className="text-blue-700">{selectedTue?.numero ?? selectedTueId}</span>
            </h2>
            <span className="text-sm text-gray-500">{equipamentos.length} registro{equipamentos.length !== 1 ? "s" : ""}</span>
          </div>

          {equipamentos.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
              <Package className="mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500">Nenhum equipamento encontrado para esta TUE</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">N° Série</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Descrição</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Compatibilidade</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Carro</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Posição</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {equipamentos.map((equip) => (
                    <tr key={equip.id} className="transition-colors hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-sm font-medium text-gray-900">{equip.numeroSerie}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{equip.descricao}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{equip.compatibilidade ?? <span className="italic text-gray-400">-</span>}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-sm font-semibold text-blue-700">{(equip as any).carro ?? <span className="font-normal italic text-gray-400">-</span>}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{(equip as any).posicaoInstalada ?? <span className="italic text-gray-400">-</span>}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <StatusBadge status={equip.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!selectedTueId && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <Train className="mb-3 h-10 w-10 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">Selecione uma TUE para visualizar os equipamentos</p>
          <p className="mt-1 text-xs text-gray-400">Use o filtro acima para escolher uma composição</p>
        </div>
      )}
    </div>
  );
}
