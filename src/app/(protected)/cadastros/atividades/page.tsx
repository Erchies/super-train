"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { AlertError, AlertSuccess } from "@/components/shared/form-error";
import { Plus, Pencil, CheckCircle, XCircle } from "lucide-react";

type Item = { id: string; codigo: string; descricao: string; ativo: boolean };

export default function AtividadesPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/cadastros/atividades");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setEditItem(null);
    setCodigo("");
    setDescricao("");
    setError("");
    setShowForm(true);
  }

  function openEdit(item: Item) {
    setEditItem(item);
    setCodigo(item.codigo);
    setDescricao(item.descricao);
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const fd = new FormData();
    fd.append("codigo", codigo);
    fd.append("descricao", descricao);
    if (editItem) fd.append("ativo", String(editItem.ativo));

    const url = editItem ? `/api/cadastros/atividades/${editItem.id}` : "/api/cadastros/atividades";
    const res = await fetch(url, { method: editItem ? "PUT" : "POST", body: fd });
    const data = await res.json();

    if (data.success) {
      setSuccess(editItem ? "Atividade atualizada!" : "Atividade criada!");
      setShowForm(false);
      await load();
    } else {
      setError(data.error);
    }

    setSaving(false);
  }

  async function toggleAtivo(item: Item) {
    const fd = new FormData();
    fd.append("codigo", item.codigo);
    fd.append("descricao", item.descricao);
    fd.append("ativo", String(!item.ativo));
    await fetch(`/api/cadastros/atividades/${item.id}`, { method: "PUT", body: fd });
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Atividades"
        description="Atividades padronizadas para rastreabilidade de consumíveis"
        breadcrumbs={[{ label: "Cadastros" }, { label: "Atividades" }]}
        action={
          <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Nova Atividade
          </button>
        }
      />

      <AlertSuccess message={success} />

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">{editItem ? "Editar Atividade" : "Nova Atividade"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código <span className="text-red-500">*</span></label>
              <input value={codigo} onChange={(e) => setCodigo(e.target.value)} required placeholder="ex: MANUT-PREV" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição <span className="text-red-500">*</span></label>
              <input value={descricao} onChange={(e) => setDescricao(e.target.value)} required placeholder="ex: Manutenção Preventiva" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {error && <div className="col-span-2"><AlertError message={error} /></div>}
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Código</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Descrição</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className={item.ativo ? "" : "opacity-50"}>
                  <td className="px-4 py-3 font-mono font-medium">{item.codigo}</td>
                  <td className="px-4 py-3 text-gray-700">{item.descricao}</td>
                  <td className="px-4 py-3">
                    {item.ativo ? (
                      <span className="flex items-center gap-1 text-green-700 text-xs"><CheckCircle className="w-3 h-3" /> Ativo</span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 text-xs"><XCircle className="w-3 h-3" /> Inativo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 p-1"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => toggleAtivo(item)} className="text-gray-500 hover:text-gray-700 text-xs underline">{item.ativo ? "Inativar" : "Ativar"}</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Nenhuma atividade cadastrada.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
