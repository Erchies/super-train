export type DomainErrorCode =
  | "TRANSICAO_INVALIDA"
  | "ESTADO_TERMINAL"
  | "SLOT_OCUPADO"
  | "INCOMPATIBILIDADE_SERIE"
  | "POSICAO_NAO_CADASTRADA"
  | "CAMPO_OBRIGATORIO"
  | "ESTOQUE_INSUFICIENTE"
  | "EXCECAO_NAO_AUTORIZADA"
  | "ORIGEM_INVALIDA"
  | "NAO_AUTENTICADO"
  | "SEM_PERMISSAO";

export type DomainErrorPayload =
  | { code: "TRANSICAO_INVALIDA"; de: string; para: string }
  | { code: "ESTADO_TERMINAL"; status: string }
  | { code: "SLOT_OCUPADO"; tueNumero: string; posicaoCodigo: string; funcaoCodigo: string }
  | { code: "INCOMPATIBILIDADE_SERIE"; equipSerie: string; tueSerie: string }
  | { code: "POSICAO_NAO_CADASTRADA"; posicao: string }
  | { code: "CAMPO_OBRIGATORIO"; campo: string }
  | { code: "ESTOQUE_INSUFICIENTE"; disponivel: number; solicitado: number }
  | { code: "EXCECAO_NAO_AUTORIZADA" }
  | { code: "ORIGEM_INVALIDA"; esperado: string; atual: string }
  | { code: "NAO_AUTENTICADO" }
  | { code: "SEM_PERMISSAO" };

export class DomainError extends Error {
  constructor(public readonly payload: DomainErrorPayload) {
    super(formatDomainError(payload));
    this.name = "DomainError";
  }
}

export function formatDomainError(payload: DomainErrorPayload): string {
  switch (payload.code) {
    case "TRANSICAO_INVALIDA":
      return `Transição inválida: não é possível ir de "${payload.de}" para "${payload.para}"`;
    case "ESTADO_TERMINAL":
      return `Equipamento em "${payload.status}" é estado terminal e não aceita movimentações`;
    case "SLOT_OCUPADO":
      return `Posição já ocupada: TUE ${payload.tueNumero} / ${payload.posicaoCodigo} / ${payload.funcaoCodigo}`;
    case "INCOMPATIBILIDADE_SERIE":
      return `Incompatibilidade: equipamento é ${payload.equipSerie} e TUE é ${payload.tueSerie}`;
    case "POSICAO_NAO_CADASTRADA":
      return `Posição não cadastrada para este contexto: ${payload.posicao}`;
    case "CAMPO_OBRIGATORIO":
      return `Campo obrigatório: ${payload.campo}`;
    case "ESTOQUE_INSUFICIENTE":
      return `Estoque insuficiente: disponível ${payload.disponivel}, solicitado ${payload.solicitado}`;
    case "EXCECAO_NAO_AUTORIZADA":
      return "Movimentações de exceção requerem perfil Supervisor ou Admin";
    case "ORIGEM_INVALIDA":
      return `Origem inválida: esperado "${payload.esperado}", situação atual "${payload.atual}"`;
    case "NAO_AUTENTICADO":
      return "Usuário não autenticado";
    case "SEM_PERMISSAO":
      return "Sem permissão para esta operação";
  }
}

export function isPrismaUniqueError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: string }).code === "P2002"
  );
}
