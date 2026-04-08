"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/shared/page-header";
import { AlertError, AlertSuccess } from "@/components/shared/form-error";
import { Plus, Pencil, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { CARROS_VALIDOS } from "@/domain/equipment/validations";

type PosicaoPossivel = {
  id: string;
  nomeEquipamento: string;
  serie: string;
  carro: string;
  posicao: string;
  ativo: boolean;
};

function serieLegivel(serie: string) {
  return serie === "SERIE_100" ? "Série 100" : serie === "SERIE_200" ? "Série 200" : serie;
}

export default function PosicoesPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { perfil?: string })?.perfil === "ADMIN";

  const [items, setItems] = useState<PosicaoPossivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<PosicaoPossivel | null>(null);

  // Filtros de listagem
  const [filtroSerie, setFiltroSerie] = useState("");
  const [filtroCarro, setFiltroCarro] = useState("");

  // Campos do formulário (criação)
  const [nomeEquipamento, setNomeEquipamento] = useState("");
  const [serie, setSerie] = useState("SERIE_100");
  const [carrosSelecionados, setCarrosSelecionados] = useState<string[]>([]);
  const [posicoesTexto, setPosicoesTexto] = useState("");

  // Campo do formulário (edição — só posicao)
  const [posicaoEdit, setPosicaoEdit] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // Modal de confirmação de exclusão
  const [deleteTarget, setDeleteTarget] = useState<PosicaoPossivel | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    const params = new URLSearchParams({ apenasAtivos: "false" });
    if (filtroSerie) params.set("serie", filtroSerie);
    if (filtroCarro) params.set("carro", filtroCarro);
    const res = await fetch(`/api/cadastros/posicoes?${params}`);
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [filtroSerie, filtroCarro]);

  function openNew() {
    setEditItem(null);
    setNomeEquipamento(""); setSerie("SERIE_100"); setCarrosSelecionados([]); setPosicoesTexto("");
    setError(""); setShowForm(true);
  }

  function openEdit(item: PosicaoPossivel) {
    setEditItem(item);
    setPosicaoEdit(item.posicao);
    setError(""); setShowForm(true);
  }

  function toggleCarro(carro: string) {
    setCarrosSelecionados((prev) =>
      prev.includes(carro) ? prev.filter((c) => c !== carro) : [...prev, carro]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (editItem) {
      // Edição: só atualiza posicao e ativo
      const fd = new FormData();
      fd.append("posicao", posicaoEdit);
      fd.append("ativo", String(editItem.ativo));
      const res = await fetch(`/api/cadastros/posicoes/${editItem.id}`, { method: "PUT", body: fd });
      const data = await res.json();
      if (data.success) {
        setSuccess("Posição atualizada!");
        setShowForm(false);
        await load();
      } else {
        setError(data.error);
      }
    } else {
      // Criação: envia carros como vírgula-separados e posições como ponto-e-vírgula-separadas
      const fd = new FormData();
      fd.append("serie", serie);
      fd.append("nomeEquipamento", nomeEquipamento);
      fd.append("carros", carrosSelecionados.join(","));
      fd.append("posicoes", posicoesTexto);
      const res = await fetch("/api/cadastros/posicoes", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setSuccess(`${data.data.criados} posição(ões) criada(s)!`);
        setShowForm(false);
        await load();
      } else {
        setError(data.error);
      }
    }

    setSaving(false);
  }

  async function toggleAtivo(item: PosicaoPossivel) {
    const fd = new FormData();
    fd.append("posicao", item.posicao);
    fd.append("ativo", String(!item.ativo));
    await fetch(`/api/cadastros/posicoes/${item.id}`, { method: "PUT", body: fd });
    await load();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/cadastros/posicoes/${deleteTarget.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setSuccess("Posição excluída!");
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
        title="Posições Possíveis"
        description="Cadastro de posições por Série, Carro e Nome do Equipamento"
        breadcrumbs={[{ label: "Cadastros" }, { label: "Posições" }]}
        action={
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> Nova Posição
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
              Excluir a posição <strong>{deleteTarget.posicao}</strong>?
            </p>
            <p className="text-xs text-gray-500 mb-4">
              {deleteTarget.nomeEquipamento} / {serieLegivel(deleteTarget.serie)} / {deleteTarget.carro}
            </p>
            <p className="text-xs text-red-600 mb-4">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            {editItem ? "Editar Posição" : "Nova(s) Posição(ões)"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {editItem ? (
              /* Edição: só permite alterar o texto da posição */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 grid grid-cols-3 gap-4 text-sm text-gray-500 bg-gray-50 rounded-md p-3">
                  <div><span className="block font-medium text-gray-600">Equipamento</span>{editItem.nomeEquipamento}</div>
                  <div><span className="block font-medium text-gray-600">Série</span>{serieLegivel(editItem.serie)}</div>
                  <div><span className="block font-medium text-gray-600">Carro</span>{editItem.carro}</div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posição <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={posicaoEdit}
                    onChange={(e) => setPosicaoEdit(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              /* Criação: item + série + carros (checkboxes) + posições (textarea) */
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Equipamento <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={nomeEquipamento}
                      onChange={(e) => setNomeEquipamento(e.target.value)}
                      required
                      placeholder="ex: Inversor de Tração, Computador de Bordo..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Deve corresponder exatamente à descrição cadastrada nos equipamentos.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Série <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={serie}
                      onChange={(e) => setSerie(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="SERIE_100">Série 100 (TUEs 101–125)</option>
                      <option value="SERIE_200">Série 200 (TUEs 226–240)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carros <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4 flex-wrap">
                      {CARROS_VALIDOS.map((c) => (
                        <label key={c} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={carrosSelecionados.includes(c)}
                            onChange={() => toggleCarro(c)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm font-mono font-semibold">{c}</span>
                        </label>
                      ))}
                    </div>
                    {carrosSelecionados.length === 0 && (
                      <p className="mt-1 text-xs text-red-500">Selecione ao menos um carro</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posições <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={posicoesTexto}
                    onChange={(e) => setPosicoesTexto(e.target.value)}
                    required
                    rows={3}
                    placeholder="ex: 01; 02; 03  ou  Painel A; Painel B"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Separe múltiplas posições com <strong>;</strong> (ponto-e-vírgula).
                    Serão criadas combinações para cada Carro × Posição selecionado(a).
                  </p>
                  {carrosSelecionados.length > 0 && posicoesTexto.trim() && (
                    <p className="mt-1 text-xs text-blue-600">
                      Serão criadas até {carrosSelecionados.length} × {posicoesTexto.split(";").filter((p) => p.trim()).length} = {carrosSelecionados.length * posicoesTexto.split(";").filter((p) => p.trim()).length} combinação(ões).
                    </p>
                  )}
                </div>
              </>
            )}

            {error && <AlertError message={error} />}
            <div className="flex gap-3">
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

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Filtrar por Série</label>
          <select
            value={filtroSerie}
            onChange={(e) => setFiltroSerie(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            <option value="SERIE_100">Série 100</option>
            <option value="SERIE_200">Série 200</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Filtrar por Carro</label>
          <select
            value={filtroCarro}
            onChange={(e) => setFiltroCarro(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {CARROS_VALIDOS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Nome do Equipamento</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Série</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Carro</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Posição</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className={item.ativo ? "" : "opacity-50"}>
                  <td className="px-4 py-3 text-gray-700 text-xs max-w-xs truncate">{item.nomeEquipamento}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{serieLegivel(item.serie)}</td>
                  <td className="px-4 py-3 font-mono font-bold text-blue-700">{item.carro}</td>
                  <td className="px-4 py-3 font-mono font-semibold">{item.posicao}</td>
                  <td className="px-4 py-3">
                    {item.ativo
                      ? <span className="flex items-center gap-1 text-green-700 text-xs"><CheckCircle className="w-3 h-3" /> Ativo</span>
                      : <span className="flex items-center gap-1 text-red-500 text-xs"><XCircle className="w-3 h-3" /> Inativo</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar posição">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleAtivo(item)} className="text-gray-500 hover:text-gray-700 text-xs underline">
                        {item.ativo ? "Inativar" : "Ativar"}
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Excluir posição"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Nenhuma posição cadastrada.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <p className="mt-3 text-xs text-gray-400">
        Posições vinculadas à Série (não ao TUE individual). Série 100 = TUEs 101–125; Série 200 = TUEs 226–240.
      </p>
    </div>
  );
}
