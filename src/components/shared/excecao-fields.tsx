"use client";

type Props = {
  ehExcecao: boolean;
  justificativa: string;
  onExcecaoChange: (v: boolean) => void;
  onJustificativaChange: (v: string) => void;
  canAuthorize: boolean;
};

export function ExcecaoFields({ ehExcecao, justificativa, onExcecaoChange, onJustificativaChange, canAuthorize }: Props) {
  if (!canAuthorize) return null;

  return (
    <div className="border border-orange-200 bg-orange-50 rounded-md p-4 space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="ehExcecao"
          checked={ehExcecao}
          onChange={(e) => onExcecaoChange(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="ehExcecao" className="text-sm font-medium text-orange-800">
          Movimentação em Exceção
        </label>
      </div>
      {ehExcecao && (
        <div>
          <label className="block text-sm font-medium text-orange-700 mb-1">
            Justificativa <span className="text-red-500">*</span>
          </label>
          <textarea
            value={justificativa}
            onChange={(e) => onJustificativaChange(e.target.value)}
            rows={3}
            placeholder="Descreva o motivo da movimentação em exceção..."
            className="w-full px-3 py-2 border border-orange-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      )}
    </div>
  );
}
