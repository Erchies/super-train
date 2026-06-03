"use client";

import { RelatorioTurnoForm } from "@/components/relatorios-turno/relatorio-turno-form";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NovoRelatorioTurnoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(data: Parameters<NonNullable<Parameters<typeof RelatorioTurnoForm>[0]["onSave"]>>[0]) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/relatorios-turno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Erro ao salvar relatório");
        return;
      }

      router.push("/relatorios-turno");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-3 font-medium underline">
            Fechar
          </button>
        </div>
      )}
      <RelatorioTurnoForm onSave={handleSave} saving={saving} />
    </div>
  );
}
