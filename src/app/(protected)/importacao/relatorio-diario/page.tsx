"use client";

import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import { AlertCircle, Download, FileSpreadsheet, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ImportResultTable } from "@/components/shared/import-result-table";

type RowResult = { linha: number; status: string; mensagem?: string; dados?: string };
type ImportResult = { consumiveis: RowResult[]; equipamentos: RowResult[] };

export default function ImportacaoRelatorioDiarioPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  async function handleImport() {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/importacao/relatorio-diario", {
      method: "POST",
      body: fd,
    });

    if (res.ok) {
      setResult(await res.json());
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Erro ao processar o arquivo.");
    }

    setLoading(false);
  }

  const totalOk =
    (result?.consumiveis.filter((r) => r.status === "ok").length ?? 0) +
    (result?.equipamentos.filter((r) => r.status === "ok").length ?? 0);

  const totalErro =
    (result?.consumiveis.filter((r) => r.status === "erro").length ?? 0) +
    (result?.equipamentos.filter((r) => r.status === "erro").length ?? 0);

  return (
    <div>
      <PageHeader
        title="Importar Relatório Diário"
        breadcrumbs={[{ label: "Importação" }, { label: "Relatório Diário" }]}
      />

      <div className="max-w-3xl space-y-6">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <p className="mb-1 font-medium">Formato esperado</p>
          <p>
            O arquivo Excel deve conter duas abas: <strong>Consumíveis</strong> e <strong>Equipamentos</strong>. Baixe o template para ver o formato correto.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Template - Relatório Diário</p>
              <p className="text-xs text-gray-500">Planilha com exemplos e referência de tipos válidos</p>
            </div>
          </div>
          <a
            href="/api/importacao/template/relatorio-diario"
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
            <div className="mt-4 flex justify-end">
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
                <p className="text-2xl font-bold text-green-600">{totalOk}</p>
                <p className="text-xs text-gray-600">Importados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{totalErro}</p>
                <p className="text-xs text-gray-600">Erros</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-700">{totalOk + totalErro}</p>
                <p className="text-xs text-gray-600">Total linhas</p>
              </div>
            </div>

            <ImportResultTable title="Consumíveis" rows={result.consumiveis} />
            <ImportResultTable title="Equipamentos" rows={result.equipamentos} />
          </div>
        )}
      </div>
    </div>
  );
}
