"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertError } from "@/components/shared/form-error";
import { PageHeader } from "@/components/shared/page-header";

type Localizacao = { id: string; codigo: string; descricao: string };

export default function EditarEquipamentoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);

  const [numeroSerie, setNumeroSerie] = useState("");
  const [codigoTrensurb, setCodigoTrensurb] = useState("");
  const [descricao, setDescricao] = useState("");
  const [compatibilidade, setCompatibilidade] = useState("SERIE_100");
  const [localizacaoId, setLocalizacaoId] = useState("");
  const [observacao, setObservacao] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function load() {
      const [equipRes, locRes] = await Promise.all([
        fetch(`/api/equipamentos/${params.id}`),
        fetch("/api/cadastros/localizacoes"),
      ]);

      const equip = await equipRes.json();
      const locs = await locRes.json();

      setNumeroSerie(equip.numeroSerie ?? "");
      setCodigoTrensurb(equip.codigoTrensurb ?? "");
      setDescricao(equip.descricao ?? "");
      setCompatibilidade(equip.compatibilidade ?? "SERIE_100");
      setLocalizacaoId(equip.localizacaoId ?? "");
      setObservacao(equip.observacao ?? "");
      setStatus(equip.status ?? "");

      setLocalizacoes(Array.isArray(locs) ? locs : []);
      setLoading(false);
    }

    load();
  }, [params.id]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/equipamentos/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigoTrensurb,
        descricao,
        compatibilidade,
        localizacaoId: localizacaoId || null,
        observacao,
      }),
    });

    const data = await res.json();
    if (data.success) {
      router.push(`/equipamentos/${params.id}`);
    } else {
      setError(data.error ?? "Erro ao atualizar");
    }

    setSaving(false);
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Editar Equipamento"
        breadcrumbs={[
          { label: "Equipamentos", href: "/equipamentos" },
          { label: numeroSerie, href: `/equipamentos/${params.id}` },
          { label: "Editar" },
        ]}
      />

      <div className="max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Número de Série</label>
            <input
              value={numeroSerie}
              readOnly
              className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Código Trensurb <span className="text-red-500">*</span>
            </label>
            <input
              value={codigoTrensurb}
              onChange={(e) => setCodigoTrensurb(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Compatibilidade <span className="text-red-500">*</span>
            </label>
            <select
              value={compatibilidade}
              onChange={(e) => setCompatibilidade(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SERIE_100">Série 100</option>
              <option value="SERIE_200">Série 200</option>
              <option value="AMBAS">Ambas as Séries</option>
            </select>
          </div>

          {status === "EM_ESTOQUE" && (
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
          )}

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
