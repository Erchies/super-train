"use client";

import { type FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { retornoReparoEstoqueAction } from "@/actions/movimento-equipamento.actions";
import { AlertError } from "@/components/shared/form-error";
import { PageHeader } from "@/components/shared/page-header";
import { SerialReferenceHelp } from "@/components/equipamentos/serial-reference-help";

type Equip = { id: string; numeroSerie: string; descricao: string; status: string };
type Localizacao = { id: string; codigo: string; descricao: string };

function RetornoReparoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const canExcecao = ["SUPERVISOR", "ADMIN"].includes(
    (session?.user as { perfil?: string })?.perfil ?? ""
  );

  const [equipamentos, setEquipamentos] = useState<Equip[]>([]);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);

  const [equipamentoId, setEquipamentoId] = useState(searchParams.get("equipamentoId") ?? "");
  const [localizacaoId, setLocalizacaoId] = useState("");
  const [realizadoEm, setRealizadoEm] = useState(new Date().toISOString().split("T")[0]);
  const [observacao, setObservacao] = useState("");

  const [ehExcecao, setEhExcecao] = useState(false);
  const [justificativa, setJustificativa] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/equipamentos?status=EM_REPARO").then((r) => r.json()),
      fetch("/api/cadastros/localizacoes").then((r) => r.json()),
    ]).then(([equips, locs]) => {
      setEquipamentos(Array.isArray(equips) ? equips : []);
      setLocalizacoes(Array.isArray(locs) ? locs : []);
    });
  }, []);
  const equipSel = equipamentos.find((e) => e.id === equipamentoId);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const result = await retornoReparoEstoqueAction({
      equipamentoId,
      localizacaoId,
      realizadoEm: new Date(`${realizadoEm}T12:00:00`),
      observacao: observacao || undefined,
      ehExcecao,
      justificativa: justificativa || undefined,
    });

    if (result.success) {
      router.push(`/equipamentos/${equipamentoId}`);
    } else {
      setError(result.error);
    }

    setSaving(false);
  }

  return (
    <div>
      <PageHeader
        title="Retorno de Reparo para Estoque"
        breadcrumbs={[{ label: "Movimentações" }, { label: "Retorno de Reparo" }]}
      />

      <div className="max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Equipamento (Em Reparo) <span className="text-red-500">*</span>
            </label>
            <select
              value={equipamentoId}
              onChange={(e) => setEquipamentoId(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">- Selecione -</option>
              {equipamentos.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.numeroSerie} - {e.descricao}
                </option>
              ))}
            </select>
          </div>

          <SerialReferenceHelp nomeEquipamento={equipSel?.descricao} />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Localização de Destino (Estoque) <span className="text-red-500">*</span>
            </label>
            <select
              value={localizacaoId}
              onChange={(e) => setLocalizacaoId(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">- Selecione -</option>
              {localizacoes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.codigo} - {l.descricao}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Data de Retorno <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={realizadoEm}
              onChange={(e) => setRealizadoEm(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Observação</label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {canExcecao && (
            <div className="space-y-3 rounded-md border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="exc"
                  checked={ehExcecao}
                  onChange={(e) => setEhExcecao(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="exc" className="text-sm font-medium text-orange-800">
                  Movimentação em Exceção
                </label>
              </div>
              {ehExcecao && (
                <textarea
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  rows={3}
                  required={ehExcecao}
                  placeholder="Justificativa obrigatória..."
                  className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              )}
            </div>
          )}

          <AlertError message={error} />

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? "Processando..." : "Confirmar Retorno"}
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

export default function RetornoReparoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
      <RetornoReparoForm />
    </Suspense>
  );
}
