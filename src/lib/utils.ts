import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function formatQuantidade(value: number): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(value);
}

export const LABELS_STATUS_EQUIPAMENTO: Record<string, string> = {
  EM_ESTOQUE: "Em Estoque",
  INSTALADO_TUE: "Instalado em TUE",
  AGUARDANDO_REPARO: "Aguardando Reparo",
  EM_REPARO: "Em Reparo",
  SUCATA: "Sucata",
};

export const LABELS_TIPO_MOV_CONSUMIVEL: Record<string, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  AJUSTE_POSITIVO: "Ajuste Positivo",
  AJUSTE_NEGATIVO: "Ajuste Negativo",
};

export const LABELS_TIPO_MOV_EQUIPAMENTO: Record<string, string> = {
  ENTRADA_ESTOQUE: "Entrada no Estoque",
  INSTALACAO_TUE: "Instalação em TUE",
  RETIRADA_TUE_ESTOQUE: "Retirada de TUE → Estoque",
  RETIRADA_TUE_REPARO: "Retirada de TUE → Reparo",
  TRANSFERENCIA_TUE: "Transferência entre TUEs",
  ENVIO_REPARO: "Envio para Reparo",
  RETORNO_REPARO_ESTOQUE: "Retorno de Reparo → Estoque",
  RETORNO_REPARO_INSTALACAO: "Retorno de Reparo → Instalação",
  TRANSFERENCIA_LOCALIZACAO: "Transferência de Localização",
  BAIXA_SUCATA: "Baixa para Sucata",
  REGULARIZACAO: "Regularização de Inventário",
  EXCECAO: "Movimentação em Exceção",
};

export const LABELS_COMPATIBILIDADE: Record<string, string> = {
  SERIE_100: "Série 100",
  SERIE_200: "Série 200",
  AMBAS: "Ambas as Séries",
};

export const LABELS_PERFIL: Record<string, string> = {
  OPERADOR: "Operador",
  SUPERVISOR: "Supervisor",
  ADMIN: "Administrador",
};
