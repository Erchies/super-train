"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/shared/page-header";
import { AlertError, AlertSuccess } from "@/components/shared/form-error";
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { CARROS_VALIDOS } from "@/domain/equipment/validations";

type Item = { id: string; codigo: string; descricao: string; ativo: boolean };

export default function CarrosPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { perfil?: string })?.perfil === "ADMIN";

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    const res = await fetch("/api/cadastros/carros?apenasAtivos=false");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditItem(null); setCodigo(""); setDescricao("");
    setError(""); setShowForm(true);
  }

  function openEdit(item: Item) {
    setEditItem(item); setCodigo(item.codigo); setDescricao(item.descricao);
    setError(""); setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    const fd = new FormData();
    fd.append("codigo", codigo);
    fd.append("descricao", descricao);
    if (editItem) fd.append("ativo", String(editItem.ativo));

    const url = editItem ? `/api/cadastros/carros/${editItem.id}` : "/api/cadastros/carros";
    const res = await fetch(url, { method: editItem ? "PUT" : "POST", body: fd });
    const data = await res.json();
    if (data.success) {
      setSuccess(editItem ? "Carro atualizado!" : "Carro criado!");
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
    await fetch(`/api/cadastros/carros/${item.id}`, { method: "PUT", body: fd });
    await load();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/cadastros/carros/${deleteTarget.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setSuccess("Carro excluído!");
      setDeleteTarget(null);
      await load();
    } else {
      setError(data.error);
      setDeleteTarget(null);
    }
    setDeleting(false);
  }

  return (
    <div>
      <PageHeader
        title="Carros"
        description="Carros válidos para instalação nos TUEs: MA, MB, RA e RB"
        breadcrumbs={[{ label: "Cadastros" }, { label: "Carros" }]}
        action={
          <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Novo Carro
          </button>
        }
      />
      <AlertSuccess message={success} />
      {error && !showForm && <AlertError message={error} />}

      {/* Modal de confirmação de exclusão */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Confirmar exclusão</h3>
            <p className="text-sm text-gray-600 mb-1">
              Excluir o carro <strong>{deleteTarget.codigo}</strong> — {deleteTarget.descricao}?
            </p>
            <p className="text-xs text-red-600 mb-4">
              Só é possível excluir carros sem referências em movimentações ou materiais.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting} className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">{editItem ? "Editar Carro" : "Novo Carro"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código <span className="text-red-500">*</span>
              </label>
              <select
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
                disabled={!!editItem}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              >
                <option value="">- Selecione -</option>
                {CARROS_VALIDOS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição <span className="text-red-500">*</span>
              </label>
              <input
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
                placeholder="ex: Carro MA"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <div className="col-span-2"><AlertError message={error} /></div>}
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {saving ? "Salvando..." : "Salvar"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
                Cancelar
              </button>
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
                  <td className="px-4 py-3 font-mono font-bold text-blue-700">{item.codigo}</td>
                  <td className="px-4 py-3 text-gray-700">{item.descricao}</td>
                  <td className="px-4 py-3">
                    {item.ativo
                      ? <span className="flex items-center gap-1 text-green-700 text-xs"><CheckCircle className="w-3 h-3" /> Ativo</span>
                      : <span className="flex items-center gap-1 text-red-500 text-xs"><XCircle className="w-3 h-3" /> Inativo</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar descrição">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleAtivo(item)} className="text-gray-500 hover:text-gray-700 text-xs underline">
                        {item.ativo ? "Inativar" : "Ativar"}
                      </button>
                      {isAdmin && (
                        <button onClick={() => setDeleteTarget(item)} className="text-red-500 hover:text-red-700 p-1" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Nenhum carro cadastrado. Execute o seed para popular os dados iniciais.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Carros válidos: {CARROS_VALIDOS.join(", ")}. Estes são os únicos carros aceitos nas movimentações de equipamentos.
      </p>
    </div>
  );
}
