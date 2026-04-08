import { prisma } from "@/lib/prisma";
export { listarPosicoesDisponiveisPorContexto } from "@/repositories/cadastros.repository";

export interface FiltrosEquipamento {
  busca?: string;
  status?: string;
  tueId?: string;
  compatibilidade?: string;
  ativo?: boolean;
}

export async function listarEquipamentos(filtros: FiltrosEquipamento = {}) {
  return prisma.equipamento.findMany({
    where: {
      ativo: filtros.ativo ?? true,
      ...(filtros.status && { status: filtros.status }),
      ...(filtros.tueId && { tueId: filtros.tueId }),
      ...(filtros.compatibilidade && {
        OR: [
          { compatibilidade: filtros.compatibilidade as "SERIE_100" | "SERIE_200" | "AMBAS" },
          { compatibilidade: "AMBAS" },
        ],
      }),
      ...(filtros.busca && {
        OR: [
          { numeroSerie: { contains: filtros.busca } },
          { codigoTrensurb: { contains: filtros.busca } },
          { descricao: { contains: filtros.busca } },
        ],
      }),
    },
    include: {
      localizacao: true,
      tue: true,
    },
    orderBy: { numeroSerie: "asc" },
  });
}

export async function buscarEquipamentoPorId(id: string) {
  return prisma.equipamento.findUnique({
    where: { id },
    include: {
      localizacao: true,
      tue: true,
      movimentacoes: {
        include: {
          tue: true,
          posicao: true,
          funcao: true,
          oficina: true,
          usuario: { select: { nome: true } },
          autorizador: { select: { nome: true } },
        },
        orderBy: { realizadoEm: "desc" },
      },
    },
  });
}

export async function buscarEquipamentoPorSerie(numeroSerie: string) {
  return prisma.equipamento.findUnique({
    where: { numeroSerie },
    include: { tue: true },
  });
}

export async function listarEquipamentosPorTUE(tueId: string) {
  return prisma.equipamento.findMany({
    where: { tueId, status: "INSTALADO_TUE", ativo: true },
    orderBy: [{ carro: "asc" }, { posicaoInstalada: "asc" }],
  });
}

export async function contarEquipamentosPorStatus() {
  return prisma.equipamento.groupBy({
    by: ["status"],
    where: { ativo: true },
    _count: { id: true },
  });
}

export async function criarEquipamento(data: {
  numeroSerie: string;
  codigoTrensurb: string;
  descricao: string;
  compatibilidade: "SERIE_100" | "SERIE_200" | "AMBAS";
  localizacaoId?: string | null;
  observacao?: string | null;
}) {
  return prisma.equipamento.create({ data });
}

export async function atualizarEquipamento(
  id: string,
  data: {
    codigoTrensurb?: string;
    descricao?: string;
    compatibilidade?: "SERIE_100" | "SERIE_200" | "AMBAS";
    status?: string;
    localizacaoId?: string | null;
    tueId?: string | null;
    carro?: string | null;
    posicaoInstalada?: string | null;
    observacao?: string | null;
    ativo?: boolean;
  }
) {
  return prisma.equipamento.update({ where: { id }, data });
}

// Verifica se um slot TUE + Carro + Posição já está ocupado (por outro equipamento)
export async function verificarSlotOcupado(
  tueId: string,
  carro: string,
  posicaoInstalada: string,
  excluirEquipamentoId?: string
) {
  return prisma.equipamento.findFirst({
    where: {
      tueId,
      carro,
      posicaoInstalada,
      status: "INSTALADO_TUE",
      ativo: true,
      ...(excluirEquipamentoId && { id: { not: excluirEquipamentoId } }),
    },
    include: { tue: true },
  });
}
