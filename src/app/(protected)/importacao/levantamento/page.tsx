"use client";

import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { ImportResultTable } from "@/components/shared/import-result-table";
import { AlertCircle, Download, FileSpreadsheet, Info, Upload } from "lucide-react";

type RowResult = { linha: number; status: string; mensagem?: string; dados?: string };
type ImportResult = { materiais: RowResult[]; equipamentos: RowResult[] };

type Inspecao = Record<
  string,
  {
    colunas: string[];
    linhas: Record<string, { valor: unknown; tipo: string }>[];
  }
>;

export default function ImportacaoLevantamentoPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [colunas, setColunas] = useState<Inspecao | null>(null);
  const [limpando, setLimpando] = useState(false);
  const [limpezaResult, setLimpezaResult] = useState<{
    materiaisRemovidos: number;
    equipamentosRemovidos: number;
  } | null>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
    setError(null);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && (f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) {
      setFile(f);
      setResult(null);
      setError(null);
    }
  }

  async function handleLimparDuplicatas() {
    if (!confirm("Isso vai remover duplicatas mantendo apenas o primeiro registro de cada código/série. Continuar?")) {
      return;
    }

    setLimpando(true);
    const res = await fetch("/api/importacao/limpar-duplicatas", { method: "POST" });
    if (res.ok) {
      setLimpezaResult(await res.json());
    }
    setLimpando(false);
  }

  async function handleInspecionar() {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/importacao/inspecionar", { method: "POST", body: fd });
    if (res.ok) {
      setColunas(await res.json());
    }
  }

  async function handleImport() {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/importacao/levantamento", { method: "POST", body: fd });
    if (res.ok) {
      setResult(await res.json());
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Erro ao processar o arquivo.");
    }

    setLoading(false);
  }

  const counts = {
    criados:
      (result?.materiais.filter((r) => r.status === "criado").length ?? 0) +
      (result?.equipamentos.filter((r) => r.status === "criado").length ?? 0),
    atualizados:
      (result?.materiais.filter((r) => r.status === "atualizado").length ?? 0) +
      (result?.equipamentos.filter((r) => r.status === "atualizado").length ?? 0),
    erros:
      (result?.materiais.filter((r) => r.status === "erro").length ?? 0) +
      (result?.equipamentos.filter((r) => r.status === "erro").length ?? 0),
  };

  return (
    <div>
      <PageHeader
        title="Importar Levantamento de Estoque"
        breadcrumbs={[{ label: "Importação" }, { label: "Levantamento" }]}
      />

      <div className="max-w-3xl space-y-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="flex gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="mb-1 font-medium">Levantamento Inicial e Mensal</p>
              <ul className="list-inside list-disc space-y-0.5 text-amber-700">
                <li>Itens <strong>novos</strong> serão cadastrados automaticamente</li>
                <li>
                  Itens <strong>existentes</strong> terão quantidade/status atualizados e um ajuste registrado no histórico
                </li>
                <li>
                  O arquivo deve conter as abas <strong>Materiais</strong> e <strong>Equipamentos</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-white p-4 shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-900">Remover duplicatas</p>
            <p className="text-xs text-gray-500">Mantém o primeiro registro de cada código/série e remove os demais</p>
            {limpezaResult && (
              <p className="mt-1 text-xs text-green-700">
                Removidos: {limpezaResult.materiaisRemovidos} material(is), {limpezaResult.equipamentosRemovidos} equipamento(s)
              </p>
            )}
          </div>
          <button
            onClick={handleLimparDuplicatas}
            disabled={limpando}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {limpando ? "Removendo..." : "Limpar Duplicatas"}
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Template - Levantamento de Estoque</p>
              <p className="text-xs text-gray-500">Inclui abas de Materiais, Equipamentos e Referência</p>
            </div>
          </div>
          <a
            href="/api/importacao/template/levantamento"
            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            Baixar Template
          </a>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-medium text-gray-900">Selecionar arquivo</h3>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50"
          >
            <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            {file ? (
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-gray-600">Arraste o arquivo aqui ou clique para selecionar</p>
                <p className="mt-1 text-sm text-gray-400">Suporta .xlsx e .xls</p>
              </div>
            )}
            <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
          </div>

          {file && (
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleInspecionar}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Inspecionar colunas
              </button>
              <button
                onClick={handleImport}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {loading ? "Processando..." : "Importar"}
              </button>
            </div>
          )}

          {colunas && (
            <div className="mt-4 space-y-3 overflow-x-auto rounded-md border border-gray-200 bg-gray-50 p-3 text-xs font-mono">
              <p className="font-semibold text-gray-700">Diagnóstico (primeira linha de dados):</p>
              {Object.entries(colunas).map(([aba, info]) => (
                <div key={aba}>
                  <p className="mb-1 font-semibold text-blue-700">Aba: {aba}</p>
                  {info.linhas[0] && (
                    <table className="border-collapse text-xs">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 bg-gray-100 px-2 py-0.5 text-left">Coluna</th>
                          <th className="border border-gray-300 bg-gray-100 px-2 py-0.5 text-left">Tipo</th>
                          <th className="border border-gray-300 bg-gray-100 px-2 py-0.5 text-left">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(info.linhas[0]).map(([col, cell]) => (
                          <tr key={col}>
                            <td className="border border-gray-300 px-2 py-0.5 font-medium">{col}</td>
                            <td className="border border-gray-300 px-2 py-0.5 text-orange-700">{cell.tipo}</td>
                            <td className="border border-gray-300 px-2 py-0.5 text-green-700">{String(cell.valor)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex gap-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{counts.criados}</p>
                <p className="text-xs text-gray-600">Criados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{counts.atualizados}</p>
                <p className="text-xs text-gray-600">Atualizados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{counts.erros}</p>
                <p className="text-xs text-gray-600">Erros</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-700">
                  {counts.criados + counts.atualizados + counts.erros}
                </p>
                <p className="text-xs text-gray-600">Total linhas</p>
              </div>
            </div>

            <ImportResultTable title="Materiais" rows={result.materiais} />
            <ImportResultTable title="Equipamentos" rows={result.equipamentos} />
          </div>
        )}
      </div>
    </div>
  );
}
