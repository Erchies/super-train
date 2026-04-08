"use client";

import { type FormEvent, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";

type Mov = {
  id: string;
  tipo: string;
  statusAnterior?: string | null;
  statusNovo: string;
  localizacao?: { codigo: string } | null;
  tue?: { numero: string } | null;
  posicao?: { codigo: string } | null;
  funcao?: { codigo: string } | null;
  oficina?: { nome: string } | null;
  motivoReparo?: string | null;
  motivoSucata?: string | null;
  ehExcecao: boolean;
  justificativa?: string | null;
  realizadoPor: string;
  realizadoEm: string;
  observacao?: string | null;
};

type Equip = {
  id: string;
  numeroSerie: string;
  descricao: string;
  status: string;
  movimentacoes: Mov[];
};

const TIPO_LABELS: Record<string, string> = {
  ENTRADA_ESTOQUE: "Entrada em Estoque",
  INSTALACAO_TUE: "Instalação em TUE",
  RETIRADA_TUE_ESTOQUE: "Retirada -> Estoque",
  RETIRADA_TUE_REPARO: "Retirada -> Reparo",
  TRANSFERENCIA_TUE: "Transferência TUE",
  ENVIO_REPARO: "Envio para Reparo",
  RETORNO_REPARO_ESTOQUE: "Retorno Reparo -> Estoque",
  RETORNO_REPARO_INSTALACAO: "Retorno Reparo -> Instalação",
  TRANSFERENCIA_LOCALIZACAO: "Transferência Localização",
  BAIXA_SUCATA: "Baixa para Sucata",
  REGULARIZACAO: "Regularização",
  EXCECAO: "Exceção",
};

const STATUS_LABELS: Record<string, string> = {
  EM_ESTOQUE: "Em Estoque",
  INSTALADO_TUE: "Instalado TUE",
  AGUARDANDO_REPARO: "Aguardando Reparo",
  EM_REPARO: "Em Reparo",
  SUCATA: "Sucata",
};

const STATUS_COLORS: Record<string, string> = {
  EM_ESTOQUE: "bg-green-100 text-green-800",
  INSTALADO_TUE: "bg-blue-100 text-blue-800",
  AGUARDANDO_REPARO: "bg-yellow-100 text-yellow-800",
  EM_REPARO: "bg-orange-100 text-orange-800",
  SUCATA: "bg-gray-100 text-gray-800",
};

export default function HistoricoPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [equip, setEquip] = useState<Equip | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setNotFound(false);
    setEquip(null);

    const res = await fetch(`/api/equipamentos/historico?numeroSerie=${encodeURIComponent(query.trim())}`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        setEquip(data);
      } else {
        setNotFound(true);
      }
    } else {
      setNotFound(true);
    }

    setLoading(false);
  }

  return (
    <div>
      <PageHeader
        title="Histórico de Equipamento"
        breadcrumbs={[{ label: "Consultas" }, { label: "Histórico" }]}
      />

      <div className="mb-6 max-w-3xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Número de série (ex: SN-001-2024)"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </form>
      </div>

      {notFound && (
        <div className="max-w-3xl rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          Equipamento não encontrado para o número de série informado.
        </div>
      )}

      {equip && (
        <div className="max-w-3xl space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{equip.numeroSerie}</h2>
                <p className="text-sm text-gray-600">{equip.descricao}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[equip.status] ?? "bg-gray-100 text-gray-800"}`}>
                {STATUS_LABELS[equip.status] ?? equip.status}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-4 font-medium text-gray-900">Linha do Tempo ({equip.movimentacoes.length} movimentações)</h3>
            {equip.movimentacoes.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma movimentação registrada.</p>
            ) : (
              <div className="relative">
                <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-gray-200" />
                <div className="space-y-4">
                  {equip.movimentacoes.map((mov, idx) => (
                    <div key={mov.id} className="relative pl-10">
                      <div
                        className={`absolute left-2.5 h-3 w-3 rounded-full border-2 border-white ${idx === 0 ? "bg-blue-600" : "bg-gray-400"}`}
                        style={{ top: "4px" }}
                      />
                      <div className={`rounded-md border p-3 ${mov.ehExcecao ? "border-orange-300 bg-orange-50" : "border-gray-200"}`}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {TIPO_LABELS[mov.tipo] ?? mov.tipo}
                            {mov.ehExcecao && (
                              <span className="ml-2 rounded bg-orange-200 px-1.5 py-0.5 text-xs text-orange-800">EXCEÇÃO</span>
                            )}
                          </span>
                          <span className="text-xs text-gray-500">{new Date(mov.realizadoEm).toLocaleDateString("pt-BR")}</span>
                        </div>
                        {mov.statusAnterior && (
                          <p className="text-xs text-gray-600">
                            {STATUS_LABELS[mov.statusAnterior] ?? mov.statusAnterior} {" -> "}
                            <strong>{STATUS_LABELS[mov.statusNovo] ?? mov.statusNovo}</strong>
                          </p>
                        )}
                        {mov.tue && (
                          <p className="text-xs text-gray-600">
                            TUE: {mov.tue.numero}
                            {mov.posicao ? ` / Posição: ${mov.posicao.codigo}` : ""}
                            {mov.funcao ? ` / Função: ${mov.funcao.codigo}` : ""}
                          </p>
                        )}
                        {mov.localizacao && <p className="text-xs text-gray-600">Localização: {mov.localizacao.codigo}</p>}
                        {mov.oficina && <p className="text-xs text-gray-600">Oficina: {mov.oficina.nome}</p>}
                        {mov.motivoReparo && <p className="text-xs text-gray-600">Motivo: {mov.motivoReparo}</p>}
                        {mov.motivoSucata && <p className="text-xs text-gray-600">Motivo Sucata: {mov.motivoSucata}</p>}
                        {mov.observacao && <p className="text-xs italic text-gray-500">{mov.observacao}</p>}
                        {mov.justificativa && <p className="text-xs text-orange-700">Justificativa: {mov.justificativa}</p>}
                        <p className="mt-1 text-xs text-gray-400">Realizado por: {mov.realizadoPor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

