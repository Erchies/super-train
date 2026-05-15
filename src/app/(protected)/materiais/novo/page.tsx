"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { criarMaterialAction } from "@/actions/material.actions";
import { UNIDADES_MEDIDA } from "@/lib/catalogos";

interface Localizacao {
  id: string;
  codigo: string;
  descricao: string;
}

interface Posicao {
  id: string;
  codigo: string;
  descricao: string;
}

export default function NovoMaterialPage() {
  const router = useRouter();
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [posicoes, setPosicoes] = useState<Posicao[]>([]);
  const [loadingLocs, setLoadingLocs] = useState(true);
  const [loadingPos, setLoadingPos] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetch("/api/cadastros/localizacoes")
      .then((r) => r.json())
      .then((d) => setLocalizacoes(Array.isArray(d) ? d : []))
      .catch(() => setLocalizacoes([]))
      .finally(() => setLoadingLocs(false));

    fetch("/api/cadastros/posicoes")
      .then((r) => r.json())
      .then((d) => setPosicoes(Array.isArray(d) ? d : []))
      .catch(() => setPosicoes([]))
      .finally(() => setLoadingPos(false));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      codigoTrensurb: String(formData.get("codigoTrensurb") ?? ""),
      descricao: String(formData.get("descricao") ?? ""),
      unidade: String(formData.get("unidade") ?? ""),
      estoqueMinimo: String(formData.get("estoqueMinimo") ?? "0"),
      localizacaoId: formData.get("localizacaoId") ? String(formData.get("localizacaoId")) : null,
      posicoesPossiveisIds: formData
        .getAll("posicoesPossiveisIds")
        .map((v) => String(v))
        .filter(Boolean),
      observacao: formData.get("observacao") ? String(formData.get("observacao")) : null,
    };

    const result = await criarMaterialAction(data);

    if (result.success) {
      router.push(`/materiais/${result.data.id}`);
      return;
    }

    setError(result.error);
    setFieldErrors(result.fieldErrors ?? {});
    setIsPending(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Novo Material"
        description="Cadastre um novo material consumível no estoque."
        action={
          <Link
            href="/materiais"
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        }
      />

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
          <div className="space-y-5 p-6">
            <div>
              <label htmlFor="codigoTrensurb" className="mb-1 block text-sm font-medium text-gray-700">
                Código Trensurb <span className="text-red-500">*</span>
              </label>
              <input
                id="codigoTrensurb"
                name="codigoTrensurb"
                type="text"
                required
                placeholder="Ex: MT-0001"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {fieldErrors.codigoTrensurb && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.codigoTrensurb[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="descricao" className="mb-1 block text-sm font-medium text-gray-700">
                Descrição <span className="text-red-500">*</span>
              </label>
              <input
                id="descricao"
                name="descricao"
                type="text"
                required
                placeholder="Descrição completa do material"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {fieldErrors.descricao && <p className="mt-1 text-xs text-red-600">{fieldErrors.descricao[0]}</p>}
            </div>

            <div>
              <label htmlFor="unidade" className="mb-1 block text-sm font-medium text-gray-700">
                Unidade de Medida <span className="text-red-500">*</span>
              </label>
              <select
                id="unidade"
                name="unidade"
                required
                defaultValue="UN"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {UNIDADES_MEDIDA.map((unidade) => (
                  <option key={unidade} value={unidade}>
                    {unidade}
                  </option>
                ))}
              </select>
              {fieldErrors.unidade && <p className="mt-1 text-xs text-red-600">{fieldErrors.unidade[0]}</p>}
            </div>

            <div>
              <label htmlFor="estoqueMinimo" className="mb-1 block text-sm font-medium text-gray-700">
                Estoque Mínimo
              </label>
              <input
                id="estoqueMinimo"
                name="estoqueMinimo"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Quantidade mínima antes de alertar reposição.</p>
              {fieldErrors.estoqueMinimo && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.estoqueMinimo[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="localizacaoId" className="mb-1 block text-sm font-medium text-gray-700">
                Localização
              </label>
              <select
                id="localizacaoId"
                name="localizacaoId"
                disabled={loadingLocs}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">{loadingLocs ? "Carregando..." : "Selecione uma localização"}</option>
                {localizacoes.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.codigo} - {loc.descricao}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Posições possíveis</label>
              <p className="mb-2 text-xs text-gray-500">Campo opcional. Marque as posições em que este material pode ser utilizado.</p>
              {loadingPos ? (
                <p className="text-xs text-gray-400">Carregando posições...</p>
              ) : posicoes.length === 0 ? (
                <p className="text-xs text-gray-400">Nenhuma posição ativa cadastrada.</p>
              ) : (
                <div className="grid max-h-44 grid-cols-1 gap-2 overflow-y-auto rounded-md border border-gray-200 p-3 sm:grid-cols-2">
                  {posicoes.map((posicao) => (
                    <label key={posicao.id} className="flex items-start gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        name="posicoesPossiveisIds"
                        value={posicao.id}
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
              {fieldErrors.posicoesPossiveisIds && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.posicoesPossiveisIds[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="observacao" className="mb-1 block text-sm font-medium text-gray-700">
                Observação
              </label>
              <textarea
                id="observacao"
                name="observacao"
                rows={3}
                placeholder="Informações adicionais..."
                className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 rounded-b-lg bg-gray-50 px-6 py-4">
            <Link
              href="/materiais"
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isPending ? "Salvando..." : "Salvar Material"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
