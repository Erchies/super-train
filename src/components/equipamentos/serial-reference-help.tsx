"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

type Referencia = {
  id: string;
  nomeEquipamento: string;
  imagemUrl: string;
};

export function SerialReferenceHelp({ nomeEquipamento }: { nomeEquipamento?: string | null }) {
  const modelo = nomeEquipamento?.trim() ?? "";
  const [referencia, setReferencia] = useState<Referencia | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!modelo) {
        setReferencia(null);
        return;
      }
      setLoading(true);
      const response = await fetch(`/api/equipamentos/referencia-serie?nomeEquipamento=${encodeURIComponent(modelo)}`);
      const data = await response.json();
      if (!cancelled) {
        setReferencia(data.referencia ?? null);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [modelo]);

  if (!modelo) return null;

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Search className="h-4 w-4 text-blue-700" />
        <h3 className="text-sm font-semibold text-blue-900">Onde encontrar o número de série?</h3>
      </div>

      {loading ? (
        <p className="text-sm text-blue-700">Buscando imagem de referência...</p>
      ) : referencia ? (
        <div>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="block overflow-hidden rounded-md border border-blue-200 bg-white"
          >
            <img src={referencia.imagemUrl} alt={`Referência do número de série de ${modelo}`} className="max-h-72 w-full object-contain" />
          </button>
          <p className="mt-2 text-xs text-blue-700">Toque na imagem para ampliar.</p>
        </div>
      ) : (
        <p className="text-sm text-blue-700">Nenhuma imagem de referência cadastrada para este equipamento.</p>
      )}

      {previewOpen && referencia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewOpen(false)}>
          <div className="max-h-full max-w-5xl overflow-hidden rounded-lg bg-white p-2" onClick={(event) => event.stopPropagation()}>
            <img src={referencia.imagemUrl} alt={`Referência ampliada do número de série de ${modelo}`} className="max-h-[85vh] w-full object-contain" />
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
