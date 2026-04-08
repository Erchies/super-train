"use client";

type RowResult = { linha: number; status: string; mensagem?: string; dados?: string };

const STATUS_STYLE: Record<string, string> = {
  ok: "bg-green-100 text-green-800",
  criado: "bg-green-100 text-green-800",
  atualizado: "bg-blue-100 text-blue-800",
  erro: "bg-red-100 text-red-800",
};

const STATUS_LABEL: Record<string, string> = {
  ok: "OK",
  criado: "Criado",
  atualizado: "Atualizado",
  erro: "Erro",
};

export function ImportResultTable({ title, rows }: { title: string; rows: RowResult[] }) {
  if (rows.length === 0) return null;

  const erros = rows.filter((r) => r.status === "erro").length;
  const ok = rows.length - erros;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <div className="flex gap-3 text-xs">
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800">{ok} sucesso</span>
          {erros > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-800">{erros} erro(s)</span>
          )}
        </div>
      </div>

      <div className="max-h-64 overflow-x-auto overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50">
            <tr className="border-b border-gray-200 text-left">
              <th className="w-16 px-3 py-2 font-medium text-gray-700">Linha</th>
              <th className="w-24 px-3 py-2 font-medium text-gray-700">Status</th>
              <th className="px-3 py-2 font-medium text-gray-700">Item</th>
              <th className="px-3 py-2 font-medium text-gray-700">Detalhe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.linha} className={r.status === "erro" ? "bg-red-50" : ""}>
                <td className="px-3 py-1.5 text-gray-500">{r.linha}</td>
                <td className="px-3 py-1.5">
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${
                      STATUS_STYLE[r.status] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </td>
                <td className="px-3 py-1.5 font-mono text-xs text-gray-700">{r.dados ?? "-"}</td>
                <td className="px-3 py-1.5 text-xs text-gray-600">{r.mensagem ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
