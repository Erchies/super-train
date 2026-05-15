"use client";

import { type FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { transferenciaTueAction } from "@/actions/movimento-equipamento.actions";
import { AlertError } from "@/components/shared/form-error";
import { PageHeader } from "@/components/shared/page-header";
import { SerialReferenceHelp } from "@/components/equipamentos/serial-reference-help";
import { CARROS_VALIDOS } from "@/domain/equipment/validations";

type Equip = {
  id: string;
  numeroSerie: string;
  descricao: string;
  status: string;
  tue?: { numero: string } | null;
};

type TUE = { id: string; numero: string; serie: string };
type PosicaoPossivel = { id: string; nomeEquipamento: string; serie: string; carro: string; posicao: string; ativo: boolean };

function TransferenciaTueForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const canExcecao = ["SUPERVISOR", "ADMIN"].includes(
    (session?.user as { perfil?: string })?.perfil ?? ""
  );

  const [equipamentos, setEquipamentos] = useState<Equip[]>([]);
  const [tues, setTues] = useState<TUE[]>([]);
  // Todas as posições possíveis para o contexto nomeEquipamento+serie do TUE destino
  const [posicoesPorContexto, setPosicoesPorContexto] = useState<PosicaoPossivel[]>([]);

  const [equipamentoId, setEquipamentoId] = useState(searchParams.get("equipamentoId") ?? "");
  const [tueDestinoId, setTueDestinoId] = useState("");
  const [carro, setCarro] = useState("");
  const [posicaoInstalada, setPosicaoInstalada] = useState("");
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
      fetch("/api/cadastros/tues").then((r) => r.json()),
    ]).then(([e, t]) => {
      setEquipamentos(Array.isArray(e) ? e : []);
      setTues(Array.isArray(t) ? t : []);
    });
  }, []);

  // Quando equipamento + TUE destino selecionados: busca posições por nomeEquipamento + serie
  useEffect(() => {
    if (!equipamentoId || !tueDestinoId) {
      setPosicoesPorContexto([]);
      setCarro("");
      setPosicaoInstalada("");
      return;
    }
    const equip = equipamentos.find((e) => e.id === equipamentoId);
    const tue = tues.find((t) => t.id === tueDestinoId);
    if (!equip || !tue) return;

    const params = new URLSearchParams({
      nomeEquipamento: equip.descricao,
      serie: tue.serie,
      apenasAtivos: "true",
    });
    fetch(`/api/cadastros/posicoes?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setPosicoesPorContexto(Array.isArray(data) ? data : []);
        setCarro("");
        setPosicaoInstalada("");
      });
  }, [equipamentoId, tueDestinoId, equipamentos, tues]);

  // Carros disponíveis: distintos das posições cadastradas, ou todos os válidos se nenhum configurado
  const carrosDisponiveis = posicoesPorContexto.length > 0
    ? Array.from(new Set(posicoesPorContexto.map((p) => p.carro))).sort()
    : (equipamentoId && tueDestinoId ? CARROS_VALIDOS.slice() : []);

  // Posições para o carro selecionado
  const posicoesDisponiveis = posicoesPorContexto.filter((p) => p.carro === carro);
  const equipSel = equipamentos.find((e) => e.id === equipamentoId);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const result = await transferenciaTueAction({
      equipamentoId,
      tueDestinoId,
      carro,
      posicaoInstalada,
      numeroOS,
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
        title="Transferência entre TUEs"
        breadcrumbs={[{ label: "Movimentações" }, { label: "Transferência TUE" }]}
      />

      <div className="max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Equipamento (Instalado) <span className="text-red-500">*</span>
            </label>
            <select
              value={equipamentoId}
              onChange={(e) => { setEquipamentoId(e.target.value); setTueDestinoId(""); setCarro(""); setPosicaoInstalada(""); }}
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

          <SerialReferenceHelp nomeEquipamento={equipSel?.descricao} />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              TUE de Destino <span className="text-red-500">*</span>
            </label>
            <select
              value={tueDestinoId}
              onChange={(e) => { setTueDestinoId(e.target.value); setCarro(""); setPosicaoInstalada(""); }}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">- Selecione -</option>
              {tues.map((t) => (
                <option key={t.id} value={t.id}>
                  TUE {t.numero} ({t.serie === "SERIE_100" ? "Série 100" : "Série 200"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Carro <span className="text-red-500">*</span>
            </label>
            <select
              value={carro}
              onChange={(e) => { setCarro(e.target.value); setPosicaoInstalada(""); }}
              required
              disabled={!equipamentoId || !tueDestinoId}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            >
              <option value="">- Selecione o Carro -</option>
              {carrosDisponiveis.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nova Posição <span className="text-red-500">*</span>
            </label>
            {posicoesDisponiveis.length > 0 ? (
              <select
                value={posicaoInstalada}
                onChange={(e) => setPosicaoInstalada(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">- Selecione a Posição -</option>
                {posicoesDisponiveis.map((p) => (
                  <option key={p.id} value={p.posicao}>{p.posicao}</option>
                ))}
              </select>
            ) : (
              <input
                value={posicaoInstalada}
                onChange={(e) => setPosicaoInstalada(e.target.value)}
                required
                placeholder={
                  equipamentoId && tueDestinoId && carro
                    ? "Nenhuma posição cadastrada — informe manualmente"
                    : "Selecione Equipamento, TUE destino e Carro primeiro"
                }
                disabled={!equipamentoId || !tueDestinoId || !carro}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            )}
            {equipamentoId && tueDestinoId && carro && posicoesDisponiveis.length === 0 && (
              <p className="mt-1 text-xs text-orange-500">
                Nenhuma posição cadastrada para esta combinação. Informe manualmente ou cadastre em Cadastros → Posições.
              </p>
            )}
          </div>

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
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Transferindo..." : "Confirmar Transferência"}
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

export default function TransferenciaTuePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
      <TransferenciaTueForm />
    </Suspense>
  );
}
