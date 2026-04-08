"use client";

import { type FormEvent, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";

type MovConsumivel = {
  id: string;
  tipo: string;
  quantidade: number;
  numeroOS?: string | null;
  numeroChamado?: string | null;
  atividade?: { codigo: string; descricao: string } | null;
  material: { codigoTrensurb: string; descricao: string; unidade: string };
  realizadoPor: string;
  realizadoEm: string;
  observacao?: string | null;
  ehExcecao: boolean;
};

type MovEquipamento = {
  id: string;
  tipo: string;
  equipamento: { numeroSerie: string; descricao: string };
  statusNovo: string;
  tue?: { numero: string } | null;
  posicao?: { codigo: string } | null;
  realizadoPor: string;
  realizadoEm: string;
  observacao?: string | null;
  ehExcecao: boolean;
};

type RastreabilidadeResult = {
  consumiveis: MovConsumivel[];
  equipamentos: MovEquipamento[];
};

const TIPO_CONS_LABELS: Record<string, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  AJUSTE_POSITIVO: "Ajuste +",
  AJUSTE_NEGATIVO: "Ajuste -",
};

const TIPO_EQUIP_LABELS: Record<string, string> = {
  ENTRADA_ESTOQUE: "Entrada",
  INSTALACAO_TUE: "Instalação TUE",
  RETIRADA_TUE_ESTOQUE: "Retirada->Estoque",
  RETIRADA_TUE_REPARO: "Retirada->Reparo",
  TRANSFERENCIA_TUE: "Transferência TUE",
  ENVIO_REPARO: "Envio Reparo",
  RETORNO_REPARO_ESTOQUE: "Retorno Reparo",
  BAIXA_SUCATA: "Sucata",
};

export default function RastreabilidadePage() {
  const [tipoFiltro, setTipoFiltro] = useState<"os" | "chamado">("os");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RastreabilidadeResult | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(false);

    const param = tipoFiltro === "os" ? "numeroOS" : "numeroChamado";
    const res = await fetch(`/api/consultas/rastreabilidade?${param}=${encodeURIComponent(query.trim())}`);
    const data = await res.json();

    setResult(data);
    setSearched(true);
    setLoading(false);
  }

  const total = (result?.consumiveis.length ?? 0) + (result?.equipamentos.length ?? 0);

  return (
    <div>
      <PageHeader
        title="Rastreabilidade"
        breadcrumbs={[{ label: "Consultas" }, { label: "Rastreabilidade" }]}
      />

      <div className="mb-6 max-w-4xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex gap-4">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="radio"
                value="os"
                checked={tipoFiltro === "os"}
                onChange={() => setTipoFiltro("os")}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-700">Número de OS</span>
            </label>
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="radio"
                value="chamado"
                checked={tipoFiltro === "chamado"}
                onChange={() => setTipoFiltro("chamado")}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-700">Número de Chamado</span>
            </label>
          </div>

          <div className="flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tipoFiltro === "os" ? "ex: OS-2024-001" : "ex: CHM-2024-123"}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </form>
      </div>

      {searched && total === 0 && (
        <div className="max-w-4xl rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          Nenhuma movimentação encontrada para {tipoFiltro === "os" ? "OS" : "chamado"} <strong>{query}</strong>.
        </div>
      )}

      {result && total > 0 && (
        <div className="max-w-4xl space-y-6">
          <p className="text-sm text-gray-600">
            {total} movimentação(ões) encontrada(s) para <strong>{tipoFiltro === "os" ? "OS" : "Chamado"} {query}</strong>
          </p>

          {result.consumiveis.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 className="font-medium text-gray-900">Materiais Consumíveis ({result.consumiveis.length})</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="px-4 py-2 font-medium text-gray-700">Material</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Tipo</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Qtd</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Atividade</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Realizado em</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.consumiveis.map((m) => (
                    <tr key={m.id} className={m.ehExcecao ? "bg-orange-50" : ""}>
                      <td className="px-4 py-2">
                        <div className="font-medium">{m.material.codigoTrensurb}</div>
                        <div className="text-xs text-gray-500">{m.material.descricao}</div>
                      </td>
                      <td className="px-4 py-2">{TIPO_CONS_LABELS[m.tipo] ?? m.tipo}</td>
                      <td className="px-4 py-2">{m.quantidade} {m.material.unidade}</td>
                      <td className="px-4 py-2 text-gray-600">{m.atividade ? `${m.atividade.codigo} - ${m.atividade.descricao}` : "-"}</td>
                      <td className="px-4 py-2">{new Date(m.realizadoEm).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-2 text-gray-600">{m.realizadoPor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.equipamentos.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 className="font-medium text-gray-900">Equipamentos ({result.equipamentos.length})</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="px-4 py-2 font-medium text-gray-700">Equipamento</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Movimentação</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Destino</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Realizado em</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.equipamentos.map((m) => (
                    <tr key={m.id} className={m.ehExcecao ? "bg-orange-50" : ""}>
                      <td className="px-4 py-2">
                        <div className="font-medium">{m.equipamento.numeroSerie}</div>
                        <div className="text-xs text-gray-500">{m.equipamento.descricao}</div>
                      </td>
                      <td className="px-4 py-2">{TIPO_EQUIP_LABELS[m.tipo] ?? m.tipo}</td>
                      <td className="px-4 py-2 text-gray-600">
                        {m.tue ? `TUE ${m.tue.numero}${m.posicao ? ` / ${m.posicao.codigo}` : ""}` : m.statusNovo}
                      </td>
                      <td className="px-4 py-2">{new Date(m.realizadoEm).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-2 text-gray-600">{m.realizadoPor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
