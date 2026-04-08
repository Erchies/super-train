"use client";

import { type FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/shared/page-header";
import { AlertError } from "@/components/shared/form-error";
import { registrarMovimentacaoConsumivelAction } from "@/actions/movimento-consumivel.actions";

type Material = {
  id: string;
  codigoTrensurb: string;
  descricao: string;
  quantidadeAtual: number;
  unidade: string;
};

type Atividade = { id: string; codigo: string; descricao: string };

function NovaMovimentacaoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const perfil = (session?.user as { perfil?: string })?.perfil ?? "OPERADOR";
  const canExcecao = perfil === "SUPERVISOR" || perfil === "ADMIN";

  const [materiais, setMateriais] = useState<Material[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);

  const [materialId, setMaterialId] = useState(searchParams.get("materialId") ?? "");
  const [tipo, setTipo] = useState("SAIDA");
  const [quantidade, setQuantidade] = useState("");
  const [numeroOS, setNumeroOS] = useState("");
  const [numeroChamado, setNumeroChamado] = useState("");
  const [atividadeId, setAtividadeId] = useState("");
  const [observacao, setObservacao] = useState("");
  const [realizadoEm, setRealizadoEm] = useState(new Date().toISOString().split("T")[0]);

  const [ehExcecao, setEhExcecao] = useState(false);
  const [justificativa, setJustificativa] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/materiais").then((r) => r.json()),
      fetch("/api/cadastros/atividades").then((r) => r.json()),
    ]).then(([mats, ativs]) => {
      setMateriais(Array.isArray(mats) ? mats : []);
      setAtividades(Array.isArray(ativs) ? ativs : []);
    });
  }, []);

  useEffect(() => {
    if (tipo === "AJUSTE_POSITIVO" || tipo === "AJUSTE_NEGATIVO") {
      setEhExcecao(true);
    }
  }, [tipo]);

  const materialSelecionado = materiais.find((m) => m.id === materialId);
  const isSaida = tipo === "SAIDA";
  const isAjuste = tipo === "AJUSTE_POSITIVO" || tipo === "AJUSTE_NEGATIVO";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const result = await registrarMovimentacaoConsumivelAction({
      materialId,
      tipo,
      quantidade: Number(quantidade),
      numeroOS: numeroOS || null,
      numeroChamado: numeroChamado || null,
      atividadeId: atividadeId || null,
      observacao: observacao || null,
      realizadoEm: new Date(`${realizadoEm}T12:00:00`),
      ehExcecao,
      justificativa: justificativa || null,
    });

    if (result.success) {
      router.push(materialId ? `/materiais/${materialId}` : "/materiais");
    } else {
      setError(result.error);
    }

    setSaving(false);
  }

  return (
    <div>
      <PageHeader
        title="Registrar Movimentação de Material"
        breadcrumbs={[{ label: "Materiais", href: "/materiais" }, { label: "Nova Movimentação" }]}
      />

      <div className="max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Material <span className="text-red-500">*</span>
            </label>
            <select
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">- Selecione um material -</option>
              {materiais.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.codigoTrensurb} - {m.descricao} (Saldo: {m.quantidadeAtual} {m.unidade})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
                {canExcecao && <option value="AJUSTE_POSITIVO">Ajuste Positivo</option>}
                {canExcecao && <option value="AJUSTE_NEGATIVO">Ajuste Negativo</option>}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Quantidade <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  required
                  placeholder="0"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {materialSelecionado && (
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400">{materialSelecionado.unidade}</span>
                )}
              </div>
              {isSaida && materialSelecionado && (
                <p className="mt-1 text-xs text-gray-500">
                  Saldo disponível: <span className="font-medium">{materialSelecionado.quantidadeAtual} {materialSelecionado.unidade}</span>
                </p>
              )}
            </div>
          </div>

          {isSaida && (
            <div className="space-y-3 rounded-md border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-medium text-blue-800">Rastreabilidade - informe pelo menos um dos campos abaixo:</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">N° OS</label>
                  <input
                    value={numeroOS}
                    onChange={(e) => setNumeroOS(e.target.value)}
                    placeholder="ex: OS-2024-001"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">N° Chamado</label>
                  <input
                    value={numeroChamado}
                    onChange={(e) => setNumeroChamado(e.target.value)}
                    placeholder="ex: CHM-001"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Atividade</label>
                <select
                  value={atividadeId}
                  onChange={(e) => setAtividadeId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">- Selecionar atividade -</option>
                  {atividades.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.codigo} - {a.descricao}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Data da Movimentação <span className="text-red-500">*</span>
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

          {(canExcecao || isAjuste) && (
            <div className="space-y-3 rounded-md border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ehExcecao"
                  checked={ehExcecao}
                  onChange={(e) => setEhExcecao(e.target.checked)}
                  disabled={isAjuste}
                  className="h-4 w-4"
                />
                <label htmlFor="ehExcecao" className="text-sm font-medium text-orange-800">
                  Movimentação em Exceção {isAjuste && "(obrigatório para ajustes)"}
                </label>
              </div>
              {ehExcecao && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-orange-700">
                    Justificativa <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    rows={3}
                    required={ehExcecao}
                    placeholder="Descreva o motivo da movimentação em exceção..."
                    className="w-full rounded-md border border-orange-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              )}
            </div>
          )}

          <AlertError message={error} />

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Registrando..." : "Registrar Movimentação"}
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

export default function NovaMovimentacaoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
      <NovaMovimentacaoForm />
    </Suspense>
  );
}
