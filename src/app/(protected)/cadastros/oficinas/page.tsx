"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { AlertError, AlertSuccess } from "@/components/shared/form-error";
import { Plus, Pencil, CheckCircle, XCircle } from "lucide-react";

type Item = { id: string; nome: string; tipo: string; contato?: string | null; ativo: boolean };

export default function OficinasPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("INTERNA");
  const [contato, setContato] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/cadastros/oficinas");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditItem(null); setNome(""); setTipo("INTERNA"); setContato(""); setError(""); setShowForm(true); }
  function openEdit(item: Item) { setEditItem(item); setNome(item.nome); setTipo(item.tipo); setContato(item.contato ?? ""); setError(""); setShowForm(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const fd = new FormData();
    fd.append("nome", nome);
    fd.append("tipo", tipo);
    fd.append("contato", contato);
    if (editItem) fd.append("ativo", String(editItem.ativo));

    const url = editItem ? `/api/cadastros/oficinas/${editItem.id}` : "/api/cadastros/oficinas";
    const res = await fetch(url, { method: editItem ? "PUT" : "POST", body: fd });
    const data = await res.json();

    if (data.success) {
      setSuccess(editItem ? "Oficina atualizada!" : "Oficina criada!");
      setShowForm(false);
      await load();
    } else {
      setError(data.error);
    }

    setSaving(false);
  }

  async function toggleAtivo(item: Item) {
    const fd = new FormData();
    fd.append("nome", item.nome);
    fd.append("tipo", item.tipo);
    fd.append("contato", item.contato ?? "");
    fd.append("ativo", String(!item.ativo));
    await fetch(`/api/cadastros/oficinas/${item.id}`, { method: "PUT", body: fd });
    await load();
  }

  return (
    <div>
      <PageHeader title="Oficinas" description="Oficinas internas e externas" breadcrumbs={[{ label: "Cadastros" }, { label: "Oficinas" }]} action={<button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"><Plus className="w-4 h-4" /> Nova Oficina</button>} />
      <AlertSuccess message={success} />

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">{editItem ? "Editar Oficina" : "Nova Oficina"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label><input value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Nome da oficina" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label><select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="INTERNA">Interna</option><option value="EXTERNA">Externa</option><option value="FABRICANTE">Fabricante</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Contato</label><input value={contato} onChange={(e) => setContato(e.target.value)} placeholder="Email ou telefone" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            {error && <div className="col-span-3"><AlertError message={error} /></div>}
            <div className="col-span-3 flex gap-3"><button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button><button type="button" onClick={() => setShowForm(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">Cancelar</button></div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-500">Carregando...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="px-4 py-3 text-left font-medium text-gray-600">Nome</th><th className="px-4 py-3 text-left font-medium text-gray-600">Tipo</th><th className="px-4 py-3 text-left font-medium text-gray-600">Contato</th><th className="px-4 py-3 text-left font-medium text-gray-600">Status</th><th className="px-4 py-3 text-right font-medium text-gray-600">Ações</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className={item.ativo ? "" : "opacity-50"}><td className="px-4 py-3 font-medium">{item.nome}</td><td className="px-4 py-3 text-gray-700">{item.tipo}</td><td className="px-4 py-3 text-gray-700">{item.contato ?? "—"}</td><td className="px-4 py-3">{item.ativo ? <span className="flex items-center gap-1 text-green-700 text-xs"><CheckCircle className="w-3 h-3" /> Ativa</span> : <span className="flex items-center gap-1 text-red-500 text-xs"><XCircle className="w-3 h-3" /> Inativa</span>}</td><td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 p-1"><Pencil className="w-4 h-4" /></button><button onClick={() => toggleAtivo(item)} className="text-gray-500 hover:text-gray-700 text-xs underline">{item.ativo ? "Inativar" : "Ativar"}</button></div></td></tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Nenhuma oficina cadastrada.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
