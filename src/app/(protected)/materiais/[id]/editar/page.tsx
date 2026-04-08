"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertError } from "@/components/shared/form-error";
import { PageHeader } from "@/components/shared/page-header";

type Localizacao = { id: string; codigo: string; descricao: string };
type Posicao = { id: string; codigo: string; descricao: string };

export default function EditarMaterialPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [posicoes, setPosicoes] = useState<Posicao[]>([]);

  const [codigoTrensurb, setCodigoTrensurb] = useState("");
  const [descricao, setDescricao] = useState("");
  const [unidade, setUnidade] = useState("");
  const [estoqueMinimo, setEstoqueMinimo] = useState("0");
  const [localizacaoId, setLocalizacaoId] = useState("");
  const [posicoesPossiveisIds, setPosicoesPossiveisIds] = useState<string[]>([]);
  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    async function load() {
      const [matRes, locRes, posRes] = await Promise.all([
        fetch(`/api/materiais/${params.id}`),
        fetch("/api/cadastros/localizacoes"),
        fetch("/api/cadastros/posicoes"),
      ]);

      const mat = await matRes.json();
      const locs = await locRes.json();
      const poss = await posRes.json();

      setCodigoTrensurb(mat.codigoTrensurb ?? "");
      setDescricao(mat.descricao ?? "");
      setUnidade(mat.unidade ?? "");
      setEstoqueMinimo(String(mat.estoqueMinimo ?? 0));
      setLocalizacaoId(mat.localizacaoId ?? "");
      setPosicoesPossiveisIds(
        (mat.posicoesPossiveis ?? []).map((item: { posicaoId: string }) => item.posicaoId)
      );
      setObservacao(mat.observacao ?? "");

      setLocalizacoes(Array.isArray(locs) ? locs : []);
      setPosicoes(Array.isArray(poss) ? poss : []);
      setLoading(false);
    }

    load();
  }, [params.id]);

  function togglePosicao(posicaoId: string) {
    setPosicoesPossiveisIds((prev) =>
      prev.includes(posicaoId)
        ? prev.filter((id) => id !== posicaoId)
        : [...prev, posicaoId]
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/materiais/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descricao,
        unidade,
        estoqueMinimo: Number(estoqueMinimo),
        localizacaoId: localizacaoId || null,
        posicoesPossiveisIds,
        observacao,
      }),
    });

    const data = await res.json();
    if (data.success) {
      router.push(`/materiais/${params.id}`);
    } else {
      setError(data.error ?? "Erro ao atualizar");
    }

    setSaving(false);
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando...</div>;

  return (
    <div>
      <PageHeader
        title="Editar Material"
        breadcrumbs={[
          { label: "Materiais", href: "/materiais" },
          { label: codigoTrensurb, href: `/materiais/${params.id}` },
          { label: "Editar" },
        ]}
      />

      <div className="max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Código Trensurb</label>
            <input
              value={codigoTrensurb}
              readOnly
              className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Descrição <span className="text-red-500">*</span>
            </label>
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Unidade <span className="text-red-500">*</span>
              </label>
              <input
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                required
                placeholder="Ex: UN, MT, KG"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Estoque Mínimo <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.001"
                value={estoqueMinimo}
                onChange={(e) => setEstoqueMinimo(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Localização</label>
            <select
              value={localizacaoId}
              onChange={(e) => setLocalizacaoId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">- Sem localização -</option>
              {localizacoes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.codigo} - {l.descricao}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Posições possíveis</label>
            <p className="mb-2 text-xs text-gray-500">Campo opcional. Marque as posições em que este material pode ser utilizado.</p>
            {posicoes.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhuma posição ativa cadastrada.</p>
            ) : (
              <div className="grid max-h-44 grid-cols-1 gap-2 overflow-y-auto rounded-md border border-gray-200 p-3 sm:grid-cols-2">
                {posicoes.map((posicao) => (
                  <label key={posicao.id} className="flex items-start gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={posicoesPossiveisIds.includes(posicao.id)}
                      onChange={() => togglePosicao(posicao.id)}
                      className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      <span className="font-mono">{posicao.codigo}</span>
                      <span className="text-gray-500"> - {posicao.descricao}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Observação</label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <AlertError message={error} />

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
