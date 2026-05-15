export const UNIDADES_MEDIDA = [
  "UN",
  "PÇ",
  "CJ",
  "KIT",
  "PAR",
  "M",
  "CM",
  "MM",
  "KG",
  "G",
  "L",
  "ML",
  "ROLO",
  "CAIXA",
  "PACOTE",
  "OUTROS",
] as const;

export const SISTEMAS_EQUIPAMENTO = [
  "TRACAO",
  "FREIO",
  "PORTAS",
  "HVAC",
  "AUXILIAR",
  "COMUNICACAO",
  "SINALIZACAO",
  "PANTOGRAFO",
  "ILUMINACAO",
  "CONTROLE",
  "OUTROS",
] as const;

export const LABELS_SISTEMA_EQUIPAMENTO: Record<string, string> = {
  TRACAO: "Tração",
  FREIO: "Freio",
  PORTAS: "Portas",
  HVAC: "HVAC",
  AUXILIAR: "Auxiliar",
  COMUNICACAO: "Comunicação",
  SINALIZACAO: "Sinalização",
  PANTOGRAFO: "Pantógrafo",
  ILUMINACAO: "Iluminação",
  CONTROLE: "Controle",
  OUTROS: "Outros",
};

export function withValorAtual<T extends readonly string[]>(opcoes: T, valorAtual?: string | null): string[] {
  const valor = valorAtual?.trim();
  if (!valor || opcoes.includes(valor as T[number])) return [...opcoes];
  return [valor, ...opcoes];
}

export type UnidadeMedida = (typeof UNIDADES_MEDIDA)[number];
export type SistemaEquipamento = (typeof SISTEMAS_EQUIPAMENTO)[number];
