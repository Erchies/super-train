import { cn, LABELS_STATUS_EQUIPAMENTO } from "@/lib/utils";

const statusColors: Record<string, string> = {
  EM_ESTOQUE: "bg-green-100 text-green-800 border-green-200",
  INSTALADO_TUE: "bg-blue-100 text-blue-800 border-blue-200",
  AGUARDANDO_REPARO: "bg-yellow-100 text-yellow-800 border-yellow-200",
  EM_REPARO: "bg-orange-100 text-orange-800 border-orange-200",
  SUCATA: "bg-red-100 text-red-800 border-red-200",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusColors[status] ?? "bg-gray-100 text-gray-800"
      )}
    >
      {label ?? LABELS_STATUS_EQUIPAMENTO[status] ?? status}
    </span>
  );
}

export function StockBadge({
  atual,
  minimo,
  estoqueMinimo,
}: {
  atual: number;
  minimo?: number;
  estoqueMinimo?: number;
}) {
  const qtd = atual ?? 0;
  const limite = minimo ?? estoqueMinimo ?? 0;
  const abaixo = qtd <= limite;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        abaixo ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
      )}
    >
      {abaixo && <span>!</span>}
      {qtd.toLocaleString("pt-BR")}
    </span>
  );
}
