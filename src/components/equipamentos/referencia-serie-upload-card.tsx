"use client";

import { ImageIcon, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Referencia = {
  id: string;
  nomeEquipamento: string;
  imagemUrl: string;
  nomeOriginal: string;
  mimeType: string;
  tamanhoBytes: number;
};

type ApiResponse = {
  success?: boolean;
  error?: string;
  referencia?: Referencia | null;
};

export function ReferenciaSerieUploadCard({ nomeEquipamento }: { nomeEquipamento: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [referencia, setReferencia] = useState<Referencia | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const modelo = nomeEquipamento.trim();

  async function load() {
    if (!modelo) {
      setReferencia(null);
      return;
    }
    setLoading(true);
    setError("");
    const response = await fetch(`/api/equipamentos/referencia-serie?nomeEquipamento=${encodeURIComponent(modelo)}`);
    const data = (await response.json()) as ApiResponse;
    setReferencia(data.referencia ?? null);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelo]);

  async function handleUpload(file: File | null) {
    if (!file || !modelo) return;
    setSaving(true);
    setError("");

    const formData = new FormData();
    formData.append("nomeEquipamento", modelo);
    formData.append("file", file);

    const response = await fetch("/api/equipamentos/referencia-serie", {
      method: "POST",
      body: formData,
    });
    const data = (await response.json()) as ApiResponse;

    if (!response.ok || !data.success) {
      setError(data.error ?? "Erro ao salvar imagem");
    } else {
      setReferencia(data.referencia ?? null);
      if (inputRef.current) inputRef.current.value = "";
    }
    setSaving(false);
  }

  async function remove() {
    if (!modelo) return;
    setSaving(true);
    setError("");
    const response = await fetch(`/api/equipamentos/referencia-serie?nomeEquipamento=${encodeURIComponent(modelo)}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as ApiResponse;
    if (!response.ok || data.success === false) {
      setError(data.error ?? "Erro ao remover imagem");
    } else {
      setReferencia(null);
    }
    setSaving(false);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Referência do número de série</h2>
          <p className="mt-1 text-xs text-gray-500">
            Imagem vinculada ao tipo/modelo: <span className="font-medium text-gray-700">{modelo || "Informe a descrição"}</span>
          </p>
        </div>
        <ImageIcon className="h-5 w-5 text-gray-400" />
      </div>

      {loading ? (
        <div className="rounded-md border border-dashed border-gray-200 p-4 text-sm text-gray-500">Carregando imagem...</div>
      ) : referencia ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="block overflow-hidden rounded-md border border-gray-200 bg-gray-50"
          >
            <img src={referencia.imagemUrl} alt="Referência do número de série" className="max-h-64 w-full object-contain" />
          </button>
          <p className="text-xs text-gray-500">{referencia.nomeOriginal}</p>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-gray-200 p-4 text-sm text-gray-500">
          Nenhuma imagem de referência cadastrada para este equipamento.
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => handleUpload(event.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={saving || !modelo}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {referencia ? "Substituir imagem" : "Enviar imagem"}
        </button>
        {referencia && (
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Remover
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <p className="mt-3 text-xs text-gray-400">Formatos aceitos: JPG, JPEG, PNG e WEBP. Limite: 5 MB.</p>

      {previewOpen && referencia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewOpen(false)}>
          <div className="max-h-full max-w-5xl overflow-hidden rounded-lg bg-white p-2" onClick={(event) => event.stopPropagation()}>
            <img src={referencia.imagemUrl} alt="Referência ampliada do número de série" className="max-h-[85vh] w-full object-contain" />
            <div className="flex justify-end p-2">
              <button type="button" onClick={() => setPreviewOpen(false)} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
