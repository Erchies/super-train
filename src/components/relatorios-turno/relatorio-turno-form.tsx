"use client";

import { useState } from "react";
import { Plus, Trash2, Printer, Save } from "lucide-react";

/* ───── Tipos locais ───────────────────────────────────────────────── */

type Atendimento = {
  tueNumero: string;
  ticket: string;
  nivel: string;
  dataPi: string;
  sintoma: string;
  constatacao: string;
  intervencao: string;
  informacaoRepasse: string;
};

type FormData = {
  data: string;
  turno: string;
  horarioInicio: string;
  horarioFinal: string;
  equipe: string;
  responsavelNome: string;
  condicoesGeraisTurno: string;
  atendimentos: Atendimento[];
  outros: string;
  supervisorTurno: string;
  supervisorCorretiva: string;
  engenharia: string;
  dataSupervisorTurno: string;
  reSupervisorTurno: string;
  dataSupervisorCorretiva: string;
  reSupervisorCorretiva: string;
  dataEngenharia: string;
  reEngenharia: string;
};

const emptyAtendimento = (): Atendimento => ({
  tueNumero: "",
  ticket: "",
  nivel: "",
  dataPi: "",
  sintoma: "",
  constatacao: "",
  intervencao: "",
  informacaoRepasse: "",
});

export function RelatorioTurnoForm({
  onSave,
  saving,
}: {
  onSave?: (data: FormData) => void;
  saving?: boolean;
}) {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState<FormData>({
    data: today,
    turno: "",
    horarioInicio: "",
    horarioFinal: "",
    equipe: "",
    responsavelNome: "",
    condicoesGeraisTurno: "",
    atendimentos: [emptyAtendimento()],
    outros: "",
    supervisorTurno: "",
    supervisorCorretiva: "",
    engenharia: "",
    dataSupervisorTurno: today,
    reSupervisorTurno: "",
    dataSupervisorCorretiva: "",
    reSupervisorCorretiva: "",
    dataEngenharia: "",
    reEngenharia: "",
  });

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setAtendimento(index: number, key: keyof Atendimento, value: string) {
    setForm((prev) => {
      const atendimentos = [...prev.atendimentos];
      atendimentos[index] = { ...atendimentos[index], [key]: value };
      return { ...prev, atendimentos };
    });
  }

  function addAtendimento() {
    setForm((prev) => ({ ...prev, atendimentos: [...prev.atendimentos, emptyAtendimento()] }));
  }

  function removeAtendimento(index: number) {
    setForm((prev) => ({
      ...prev,
      atendimentos: prev.atendimentos.filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="space-y-4">
      {/* Botões de ação acima do formulário */}
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-xl font-bold text-gray-900">Novo Relatório de Turno</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => onSave?.(form)}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Relatório"}
          </button>
        </div>
      </div>

      {/* ═══════════ DOCUMENTO ═══════════ */}
      <div className="relatorio-turno-doc bg-white border-2 border-black mx-auto max-w-[900px] font-['Arial',sans-serif] text-[13px] leading-tight text-black print:border-[1.5px] print:max-w-full print:shadow-none shadow-lg">

        {/* ─── CABEÇALHO ─── */}
        <div className="border-b-2 border-black">
          {/* Linha 1: Logo + GEMAN + Equipe */}
          <div className="flex border-b border-black">
            {/* Logo TRENSURB */}
            <div className="w-[160px] flex items-center justify-center border-r border-black px-2 py-1.5 bg-[#1a1a2e]">
              <div className="flex items-center gap-1">
                <div className="flex flex-col items-center">
                  <div className="flex gap-[1px]">
                    <div className="w-[3px] h-[10px] bg-red-500"></div>
                    <div className="w-[3px] h-[10px] bg-red-500"></div>
                    <div className="w-[3px] h-[10px] bg-red-500"></div>
                  </div>
                  <div className="w-[14px] h-[2px] bg-red-500 mt-[1px]"></div>
                </div>
                <span className="text-white font-bold text-[14px] tracking-wider">TRENSURB</span>
              </div>
            </div>
            {/* GEMAN info */}
            <div className="flex-1 flex items-center justify-center border-r border-black px-2 py-1.5 text-center">
              <div>
                <div className="font-bold text-[12px] tracking-wide">GEMAN - GERÊNCIA DE MANUTENÇÃO&nbsp;&nbsp;&nbsp;SEOFI -</div>
                <div className="font-bold text-[11px]">Manutenção Leve</div>
              </div>
            </div>
            {/* Equipe */}
            <div className="w-[140px] flex items-center px-3 py-1.5">
              <span className="font-bold text-[12px] mr-2">Equipe:</span>
              <input
                type="text"
                value={form.equipe}
                onChange={(e) => set("equipe", e.target.value)}
                className="relatorio-input w-16 text-center font-bold text-[14px]"
                placeholder="F/H"
              />
            </div>
          </div>

          {/* Linha 2: Turno | Horário Início | Horário Final | Data */}
          <div className="flex">
            <div className="flex items-center border-r border-black px-3 py-1.5">
              <span className="font-bold text-[12px] mr-1">Turno:</span>
              <input
                type="text"
                value={form.turno}
                onChange={(e) => set("turno", e.target.value)}
                className="relatorio-input w-10 text-center font-bold"
                placeholder="III"
              />
            </div>
            <div className="flex items-center border-r border-black px-2 py-1.5">
              <span className="text-[11px] mr-1">Horário de Início:</span>
              <input
                type="text"
                value={form.horarioInicio}
                onChange={(e) => set("horarioInicio", e.target.value)}
                className="relatorio-input w-14 text-center font-bold"
                placeholder="22:00"
              />
            </div>
            <div className="flex items-center border-r border-black px-2 py-1.5">
              <span className="text-[11px] mr-1">Horário do Final:</span>
              <input
                type="text"
                value={form.horarioFinal}
                onChange={(e) => set("horarioFinal", e.target.value)}
                className="relatorio-input w-14 text-center font-bold"
                placeholder="06:15"
              />
            </div>
            <div className="flex-1 flex items-center px-3 py-1.5">
              <span className="font-bold text-[12px] mr-2">Data:</span>
              <input
                type="date"
                value={form.data}
                onChange={(e) => set("data", e.target.value)}
                className="relatorio-input font-bold"
              />
            </div>
          </div>
        </div>

        {/* ─── TÍTULO ─── */}
        <div className="border-b-2 border-black py-2 text-center">
          <h2 className="font-bold text-[15px] tracking-wide">RELATÓRIO DE TURNO MANUTENÇÃO CORRETIVA</h2>
        </div>

        {/* ─── CONDIÇÕES GERAIS DO TURNO (área de texto livre) ─── */}
        <div className="border-b-2 border-black">
          <textarea
            value={form.condicoesGeraisTurno}
            onChange={(e) => set("condicoesGeraisTurno", e.target.value)}
            className="relatorio-textarea w-full min-h-[200px] px-3 py-2 text-[13px]"
            placeholder="TUE 102 entrou na VP08N às 23h35min com 128656 Km.&#10;&#10;Descreva aqui as condições gerais do turno, movimentações de TUEs, etc."
          />
        </div>

        {/* ─── ATENDIMENTOS ─── */}
        {form.atendimentos.map((atend, idx) => (
          <div key={idx} className="border-b-2 border-black">
            {/* Linha do cabeçalho do atendimento */}
            <div className="flex border-b border-black">
              <div className="flex items-center border-r border-black px-3 py-1.5">
                <span className="font-bold text-[12px] mr-1">TUE:</span>
                <input
                  type="text"
                  value={atend.tueNumero}
                  onChange={(e) => setAtendimento(idx, "tueNumero", e.target.value)}
                  className="relatorio-input w-12 font-bold"
                  placeholder="102"
                />
              </div>
              <div className="flex items-center border-r border-black px-3 py-1.5">
                <span className="font-bold text-[12px] mr-1">Ticket:</span>
                <input
                  type="text"
                  value={atend.ticket}
                  onChange={(e) => setAtendimento(idx, "ticket", e.target.value)}
                  className="relatorio-input w-20 font-bold"
                  placeholder="154167"
                />
              </div>
              <div className="flex items-center border-r border-black px-3 py-1.5">
                <span className="font-bold text-[12px] mr-1">Nível:</span>
                <input
                  type="text"
                  value={atend.nivel}
                  onChange={(e) => setAtendimento(idx, "nivel", e.target.value)}
                  className="relatorio-input w-8 text-center font-bold"
                  placeholder="B"
                />
              </div>
              <div className="flex-1 flex items-center px-3 py-1.5">
                <span className="font-bold text-[12px] mr-1">Data do PI:</span>
                <input
                  type="text"
                  value={atend.dataPi}
                  onChange={(e) => setAtendimento(idx, "dataPi", e.target.value)}
                  className="relatorio-input w-24 font-bold"
                  placeholder="30/05/2026"
                />
              </div>
              {form.atendimentos.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAtendimento(idx)}
                  className="px-2 text-red-400 hover:text-red-600 print:hidden"
                  title="Remover atendimento"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Campos de texto do atendimento */}
            <div className="px-3 py-1">
              <div className="flex py-0.5">
                <span className="font-bold text-[12px] w-[80px] shrink-0">Sintoma:</span>
                <input
                  type="text"
                  value={atend.sintoma}
                  onChange={(e) => setAtendimento(idx, "sintoma", e.target.value)}
                  className="relatorio-input flex-1"
                  placeholder="Código 32 na UCE do MB"
                />
              </div>
              <div className="flex py-0.5">
                <span className="font-bold text-[12px] w-[100px] shrink-0">Constatação:</span>
                <input
                  type="text"
                  value={atend.constatacao}
                  onChange={(e) => setAtendimento(idx, "constatacao", e.target.value)}
                  className="relatorio-input flex-1"
                  placeholder="Código 30 e 32 nas UCE's MB, RB, RA e MA gerados durante PT - freio normal"
                />
              </div>
              <div className="flex py-0.5">
                <span className="font-bold text-[12px] w-[100px] shrink-0">Intervenção:</span>
                <input
                  type="text"
                  value={atend.intervencao}
                  onChange={(e) => setAtendimento(idx, "intervencao", e.target.value)}
                  className="relatorio-input flex-1"
                  placeholder="Testes e substituições de placas, continua registrando códigos durante PT"
                />
              </div>
              <div className="flex py-0.5 pb-1.5">
                <span className="font-bold text-[12px] w-[160px] shrink-0">Informação do repasse:</span>
                <textarea
                  value={atend.informacaoRepasse}
                  onChange={(e) => setAtendimento(idx, "informacaoRepasse", e.target.value)}
                  className="relatorio-textarea flex-1 min-h-[40px]"
                  placeholder="liberado para operação - solicito programação para inspeção junto ao Laboratório, placas de freio em teste segundo anotação."
                />
              </div>
            </div>
          </div>
        ))}

        {/* Botão adicionar atendimento */}
        <div className="border-b-2 border-black print:hidden">
          <button
            type="button"
            onClick={addAtendimento}
            className="w-full flex items-center justify-center gap-2 py-2 text-[12px] font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Atendimento
          </button>
        </div>

        {/* ─── OUTROS ─── */}
        <div className="border-b-2 border-black">
          <div className="px-3 py-1.5">
            <span className="font-bold text-[12px]">Outros:</span>
          </div>
          <textarea
            value={form.outros}
            onChange={(e) => set("outros", e.target.value)}
            className="relatorio-textarea w-full min-h-[80px] px-3 pb-2"
            placeholder=""
          />
        </div>

        {/* ─── RODAPÉ — ASSINATURAS ─── */}
        <div className="border-b border-black">
          <div className="flex">
            {/* Supervisor Turno */}
            <div className="flex-1 border-r border-black px-3 py-2">
              <div className="flex">
                <span className="font-bold text-[11px] whitespace-nowrap mr-1">SUPERVISOR TURNO:</span>
                <input
                  type="text"
                  value={form.supervisorTurno}
                  onChange={(e) => set("supervisorTurno", e.target.value)}
                  className="relatorio-input flex-1 text-[11px]"
                  placeholder="Vagner / Derci"
                />
              </div>
            </div>
            {/* Supervisor Corretiva */}
            <div className="flex-1 border-r border-black px-3 py-2">
              <div className="flex">
                <span className="font-bold text-[11px] whitespace-nowrap mr-1">SUPERVISOR CORRETIVA:</span>
                <input
                  type="text"
                  value={form.supervisorCorretiva}
                  onChange={(e) => set("supervisorCorretiva", e.target.value)}
                  className="relatorio-input flex-1 text-[11px]"
                />
              </div>
            </div>
            {/* Engenharia */}
            <div className="flex-1 px-3 py-2">
              <div className="flex">
                <span className="font-bold text-[11px] whitespace-nowrap mr-1">ENGENHARIA:</span>
                <input
                  type="text"
                  value={form.engenharia}
                  onChange={(e) => set("engenharia", e.target.value)}
                  className="relatorio-input flex-1 text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── RODAPÉ — DATA / RE ─── */}
        <div>
          <div className="flex">
            {/* Col 1 */}
            <div className="flex-1 border-r border-black px-3 py-1.5 flex items-center gap-2">
              <span className="text-[11px] font-bold whitespace-nowrap">DATA:</span>
              <input
                type="text"
                value={form.dataSupervisorTurno}
                onChange={(e) => set("dataSupervisorTurno", e.target.value)}
                className="relatorio-input w-24 text-[11px]"
                placeholder="02/06/2026"
              />
              <span className="text-[11px] font-bold whitespace-nowrap ml-2">RE:</span>
              <input
                type="text"
                value={form.reSupervisorTurno}
                onChange={(e) => set("reSupervisorTurno", e.target.value)}
                className="relatorio-input flex-1 text-[11px]"
                placeholder="3860 / 2867"
              />
            </div>
            {/* Col 2 */}
            <div className="flex-1 border-r border-black px-3 py-1.5 flex items-center gap-2">
              <span className="text-[11px] font-bold whitespace-nowrap">DATA:</span>
              <input
                type="text"
                value={form.dataSupervisorCorretiva}
                onChange={(e) => set("dataSupervisorCorretiva", e.target.value)}
                className="relatorio-input w-20 text-[11px]"
              />
              <span className="text-[11px] font-bold whitespace-nowrap ml-2">RE:</span>
              <input
                type="text"
                value={form.reSupervisorCorretiva}
                onChange={(e) => set("reSupervisorCorretiva", e.target.value)}
                className="relatorio-input flex-1 text-[11px]"
              />
            </div>
            {/* Col 3 */}
            <div className="flex-1 px-3 py-1.5 flex items-center gap-2">
              <span className="text-[11px] font-bold whitespace-nowrap">DATA:</span>
              <input
                type="text"
                value={form.dataEngenharia}
                onChange={(e) => set("dataEngenharia", e.target.value)}
                className="relatorio-input w-20 text-[11px]"
              />
              <span className="text-[11px] font-bold whitespace-nowrap ml-2">RE:</span>
              <input
                type="text"
                value={form.reEngenharia}
                onChange={(e) => set("reEngenharia", e.target.value)}
                className="relatorio-input flex-1 text-[11px]"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
