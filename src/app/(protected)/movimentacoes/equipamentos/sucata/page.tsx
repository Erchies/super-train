"use client";

import { type FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { baixaSucataAction } from "@/actions/movimento-equipamento.actions";
import { AlertError } from "@/components/shared/form-error";
import { PageHeader } from "@/components/shared/page-header";

type Equip = { id: string; numeroSerie: string; descricao: string; status: string };

const STATUS_LABELS: Record<string, string> = {
  EM_ESTOQUE: "Em Estoque",
  INSTALADO_TUE: "Instalado em TUE",
  AGUARDANDO_REPARO: "Aguardando Reparo",
  EM_REPARO: "Em Reparo",
};

function SucataForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [equipamentos, setEquipamentos] = useState<Equip[]>([]);
  const [equipamentoId, setEquipamentoId] = useState(searchParams.get("equipamentoId") ?? "");
  const [motivoSucata, setMotivoSucata] = useState("");
  const [realizadoEm, setRealizadoEm] = useState(new Date().toISOString().split("T")[0]);
  const [observacao, setObservacao] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/equipamentos")
      .then((r) => r.json())
      .then((equips: Equip[]) =>
        setEquipamentos((Array.isArray(equips) ? equips : []).filter((e) => e.status !== "SUCATA"))
      );
  }, []);

  const equipSel = equipamentos.find((e) => e.id === equipamentoId);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!confirmado) {
      setError("Confirme que deseja realizar a baixa para sucata.");
      return;
    }

    setSaving(true);
    setError("");

    const result = await baixaSucataAction({
      equipamentoId,
      motivoSucata,
      realizadoEm: new Date(`${realizadoEm}T12:00:00`),
      observacao: observacao || undefined,
      ehExcecao: false,
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
        title="Baixa para Sucata"
        breadcrumbs={[{ label: "Movimentações" }, { label: "Baixa para Sucata" }]}
      />

      <div className="mb-4 max-w-2xl rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-800">
          Atenção: esta operação é irreversível. O equipamento não poderá mais ser movimentado após a baixa para sucata.
        </p>
      </div>

      <div className="max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Equipamento <span className="text-red-500">*</span>
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
                  {e.numeroSerie} - {e.descricao} [{STATUS_LABELS[e.status] ?? e.status}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Motivo da Baixa <span className="text-red-500">*</span>
            </label>
            <input
              value={motivoSucata}
              onChange={(e) => setMotivoSucata(e.target.value)}
              required
              placeholder="Ex: dano irreparável, vida útil esgotada..."
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

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Observação</label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {equipSel && (
            <div className="rounded-md border border-red-300 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="confirmado"
                  checked={confirmado}
                  onChange={(e) => setConfirmado(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="confirmado" className="text-sm font-medium text-red-800">
                  Confirmo a baixa para sucata de <strong>{equipSel.numeroSerie}</strong>. Esta ação é irreversível.
                </label>
              </div>
            </div>
          )}

          <AlertError message={error} />

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || !confirmado}
              className="rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "Processando..." : "Confirmar Baixa para Sucata"}
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

export default function SucataPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
      <SucataForm />
    </Suspense>
  );
}
