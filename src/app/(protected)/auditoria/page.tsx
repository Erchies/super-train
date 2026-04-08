"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";

type AuditoriaItem = {
  id: string;
  origem: "CONSUMIVEL" | "EQUIPAMENTO";
  tipo: string;
  descricao: string;
  ehExcecao: boolean;
  justificativa?: string | null;
  autorizadoPor?: string | null;
  realizadoPor: string;
  realizadoEm: string;
  criadoEm: string;
};

type Resumo = {
  totalConsumivel: number;
  totalEquipamento: number;
  totalExcecoes: number;
};

export default function AuditoriaPage() {
  const [items, setItems] = useState<AuditoriaItem[]>([]);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auditoria?page=1&pageSize=50")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? []);
        setResumo(d.resumo ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Auditoria" breadcrumbs={[{ label: "Auditoria" }]} />

      {resumo && (
        <div className="grid grid-cols-3 gap-4 mb-6 max-w-3xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{resumo.totalConsumivel}</p>
            <p className="text-sm text-gray-600 mt-1">Mov. Consumíveis</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{resumo.totalEquipamento}</p>
            <p className="text-sm text-gray-600 mt-1">Mov. Equipamentos</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{resumo.totalExcecoes}</p>
            <p className="text-sm text-gray-600 mt-1">Exceções</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-700">
          {loading ? "Carregando..." : `${items.length} registro(s)`}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-4 py-2 font-medium text-gray-700">Data/Hora</th>
                <th className="px-4 py-2 font-medium text-gray-700">Tipo</th>
                <th className="px-4 py-2 font-medium text-gray-700">Descrição</th>
                <th className="px-4 py-2 font-medium text-gray-700">Origem</th>
                <th className="px-4 py-2 font-medium text-gray-700">Realizado por</th>
                <th className="px-4 py-2 font-medium text-gray-700">Exceção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Carregando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Nenhum registro encontrado.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={`${item.origem}-${item.id}`} className={item.ehExcecao ? "bg-orange-50" : "hover:bg-gray-50"}>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-600 text-xs">{new Date(item.realizadoEm).toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-2 text-gray-700">{item.tipo}</td>
                    <td className="px-4 py-2 text-gray-700 max-w-xs truncate">{item.descricao}</td>
                    <td className="px-4 py-2 text-gray-600">{item.origem === "CONSUMIVEL" ? "Consumível" : "Equipamento"}</td>
                    <td className="px-4 py-2 text-gray-600">{item.realizadoPor}</td>
                    <td className="px-4 py-2">{item.ehExcecao ? "SIM" : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
