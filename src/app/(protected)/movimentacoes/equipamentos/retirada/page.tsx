"use client";

import { type FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  retiradaTueEstoqueAction,
  retiradaTueReparoAction,
} from "@/actions/movimento-equipamento.actions";
import { AlertError } from "@/components/shared/form-error";
import { PageHeader } from "@/components/shared/page-header";

type Equip = {
  id: string;
  numeroSerie: string;
  descricao: string;
  status: string;
  tue?: { numero: string } | null;
};

type Localizacao = { id: string; codigo: string; descricao: string };

function RetiradaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const canExcecao = ["SUPERVISOR", "ADMIN"].includes(
    (session?.user as { perfil?: string })?.perfil ?? ""
  );

  const [equipamentos, setEquipamentos] = useState<Equip[]>([]);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);

  const [equipamentoId, setEquipamentoId] = useState(searchParams.get("equipamentoId") ?? "");
  const [tipoRetirada, setTipoRetirada] = useState<"ESTOQUE" | "REPARO">("ESTOQUE");
  const [localizacaoId, setLocalizacaoId] = useState("");
  const [motivoReparo, setMotivoReparo] = useState("");
  const [numeroOS, setNumeroOS] = useState("");
  const [realizadoEm, setRealizadoEm] = useState(new Date().toISOString().split("T")[0]);
  const [observacao, setObservacao] = useState("");

  const [ehExcecao, setEhExcecao] = useState(false);
  const [justificativa, setJustificativa] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/equipamentos?status=INSTALADO_TUE").then((r) => r.json()),
      fetch("/api/cadastros/localizacoes").then((r) => r.json()),
    ]).then(([equips, locs]) => {
      setEquipamentos(Array.isArray(equips) ? equips : []);
      setLocalizacoes(Array.isArray(locs) ? locs : []);
    });
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const base = {
      equipamentoId,
      numeroOS,
      realizadoEm: new Date(`${realizadoEm}T12:00:00`),
      observacao: observacao || undefined,
      ehExcecao,
      justificativa: justificativa || undefined,
    };

    const result =
      tipoRetirada === "ESTOQUE"
        ? await retiradaTueEstoqueAction({ ...base, localizacaoId })
        : await retiradaTueReparoAction({ ...base, motivoReparo });

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
        title="Retirar Equipamento de TUE"
        breadcrumbs={[{ label: "Movimentações" }, { label: "Retirada de TUE" }]}
      />

      <div className="max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Equipamento (Instalado) <span className="text-red-500">*</span>
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
                  {e.tue ? ` (TUE ${e.tue.numero})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Destino após retirada <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  value="ESTOQUE"
                  checked={tipoRetirada === "ESTOQUE"}
                  onChange={() => setTipoRetirada("ESTOQUE")}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-700">Para o Estoque</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  value="REPARO"
                  checked={tipoRetirada === "REPARO"}
                  onChange={() => setTipoRetirada("REPARO")}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-700">Para Reparo (Aguardando)</span>
              </label>
            </div>
          </div>

          {tipoRetirada === "ESTOQUE" ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Localização de Destino <span className="text-red-500">*</span>
              </label>
              <select
                value={localizacaoId}
                onChange={(e) => setLocalizacaoId(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">- Selecione a localização -</option>
                {localizacoes.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.codigo} - {l.descricao}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Motivo do Reparo <span className="text-red-500">*</span>
              </label>
              <input
                value={motivoReparo}
                onChange={(e) => setMotivoReparo(e.target.value)}
                required
                placeholder="Descreva a falha ou motivo"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                N° OS <span className="text-red-500">*</span>
              </label>
              <input
                value={numeroOS}
                onChange={(e) => setNumeroOS(e.target.value)}
                required
                placeholder="ex: OS-2024-001"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Data <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={realizadoEm}
                onChange={(e) => setRealizadoEm(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
              className="rounded-md bg-yellow-600 px-5 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
            >
              {saving ? "Processando..." : "Confirmar Retirada"}
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

export default function RetiradaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
      <RetiradaForm />
    </Suspense>
  );
}
