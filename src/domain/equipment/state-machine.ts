export type StatusEquipamento = string;
export type TipoMovEquipamento = string;

// Transições permitidas por status atual
export const TRANSICOES_PERMITIDAS: Record<StatusEquipamento, StatusEquipamento[]> = {
  EM_ESTOQUE:        ["INSTALADO_TUE", "AGUARDANDO_REPARO", "SUCATA"],
  INSTALADO_TUE:     ["EM_ESTOQUE", "AGUARDANDO_REPARO", "INSTALADO_TUE"],
  AGUARDANDO_REPARO: ["EM_REPARO", "EM_ESTOQUE", "SUCATA"],
  EM_REPARO:         ["EM_ESTOQUE", "INSTALADO_TUE", "SUCATA"],
  SUCATA:            [],
};

// Tipos de movimentação mapeados para o status resultante
export const STATUS_POR_TIPO_MOV: Partial<Record<TipoMovEquipamento, StatusEquipamento>> = {
  ENTRADA_ESTOQUE:           "EM_ESTOQUE",
  INSTALACAO_TUE:            "INSTALADO_TUE",
  RETIRADA_TUE_ESTOQUE:      "EM_ESTOQUE",
  RETIRADA_TUE_REPARO:       "AGUARDANDO_REPARO",
  TRANSFERENCIA_TUE:         "INSTALADO_TUE",
  ENVIO_REPARO:              "EM_REPARO",
  RETORNO_REPARO_ESTOQUE:    "EM_ESTOQUE",
  RETORNO_REPARO_INSTALACAO: "INSTALADO_TUE",
  TRANSFERENCIA_LOCALIZACAO: undefined, // status não muda
  BAIXA_SUCATA:              "SUCATA",
  REGULARIZACAO:             undefined, // definido pelo formulário
  EXCECAO:                   undefined, // definido pelo formulário
};

// Status de origem exigido por tipo de movimentação
export const ORIGEM_EXIGIDA: Partial<Record<TipoMovEquipamento, StatusEquipamento[]>> = {
  INSTALACAO_TUE:            ["EM_ESTOQUE"],
  RETIRADA_TUE_ESTOQUE:      ["INSTALADO_TUE"],
  RETIRADA_TUE_REPARO:       ["INSTALADO_TUE"],
  TRANSFERENCIA_TUE:         ["INSTALADO_TUE"],
  ENVIO_REPARO:              ["AGUARDANDO_REPARO"],
  RETORNO_REPARO_ESTOQUE:    ["EM_REPARO"],
  RETORNO_REPARO_INSTALACAO: ["EM_REPARO"],
  TRANSFERENCIA_LOCALIZACAO: ["EM_ESTOQUE"],
  BAIXA_SUCATA:              ["EM_ESTOQUE", "AGUARDANDO_REPARO", "EM_REPARO"],
};

export function podeTransicionar(
  statusAtual: StatusEquipamento,
  statusDestino: StatusEquipamento
): boolean {
  return TRANSICOES_PERMITIDAS[statusAtual].includes(statusDestino);
}

export function validarOrigem(
  tipo: TipoMovEquipamento,
  statusAtual: StatusEquipamento
): { valido: boolean; esperado?: StatusEquipamento[] } {
  const origensValidas = ORIGEM_EXIGIDA[tipo];
  if (!origensValidas) return { valido: true };
  const valido = origensValidas.includes(statusAtual);
  return { valido, esperado: origensValidas };
}

export function isCompativel(
  equipCompat: string,
  tueSerie: string
): boolean {
  if (equipCompat === "AMBAS") return true;
  return equipCompat === tueSerie;
}

export function isEstadoTerminal(status: StatusEquipamento): boolean {
  return status === "SUCATA";
}

// Retorna os tipos de movimentação disponíveis a partir de um status
export function movimentacoesDisponiveisPara(
  status: StatusEquipamento
): TipoMovEquipamento[] {
  switch (status) {
    case "EM_ESTOQUE":
      return ["INSTALACAO_TUE", "ENVIO_REPARO", "TRANSFERENCIA_LOCALIZACAO", "BAIXA_SUCATA", "REGULARIZACAO"];
    case "INSTALADO_TUE":
      return ["RETIRADA_TUE_ESTOQUE", "RETIRADA_TUE_REPARO", "TRANSFERENCIA_TUE"];
    case "AGUARDANDO_REPARO":
      return ["ENVIO_REPARO", "BAIXA_SUCATA"];
    case "EM_REPARO":
      return ["RETORNO_REPARO_ESTOQUE", "RETORNO_REPARO_INSTALACAO", "BAIXA_SUCATA"];
    case "SUCATA":
      return [];
    default:
      return [];
  }
}
