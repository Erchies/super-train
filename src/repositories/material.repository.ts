import { prisma } from "@/lib/prisma";

export interface FiltrosMaterial {
  busca?: string;
  abaixoMinimo?: boolean;
  localizacaoId?: string;
  ativo?: boolean;
}

export async function listarMateriais(filtros: FiltrosMaterial = {}) {
  return prisma.material.findMany({
    where: {
      ativo: filtros.ativo ?? true,
      ...(filtros.busca && {
        OR: [
          { codigoTrensurb: { contains: filtros.busca } },
          { descricao: { contains: filtros.busca } },
        ],
      }),
      ...(filtros.localizacaoId && { localizacaoId: filtros.localizacaoId }),
    },
    include: { localizacao: true },
    orderBy: { codigoTrensurb: "asc" },
  });
}

export async function buscarMaterialPorId(id: string) {
  return prisma.material.findUnique({
    where: { id },
    include: {
      localizacao: true,
      posicoesPossiveis: {
        include: { posicao: true },
        orderBy: { posicao: { codigo: "asc" } },
      },
      movimentacoes: {
        include: {
          atividade: true,
          usuario: { select: { nome: true } },
        },
        orderBy: { realizadoEm: "desc" },
        take: 50,
      },
    },
  });
}

export async function buscarMaterialPorCodigo(codigoTrensurb: string) {
  return prisma.material.findUnique({ where: { codigoTrensurb } });
}

export async function listarMateriaisAbaixoMinimo() {
  const materiais = await prisma.material.findMany({
    where: { ativo: true },
    include: { localizacao: true },
    orderBy: { codigoTrensurb: "asc" },
  });
  return materiais.filter((m) => m.quantidadeAtual <= m.estoqueMinimo);
}

export async function criarMaterial(data: {
  codigoTrensurb: string;
  descricao: string;
  unidade: string;
  estoqueMinimo: number;
  localizacaoId?: string | null;
  posicoesPossiveisIds?: string[];
  observacao?: string | null;
}) {
  const { posicoesPossiveisIds, ...materialData } = data;
  const ids = Array.from(new Set((posicoesPossiveisIds ?? []).filter(Boolean)));
  return prisma.material.create({
    data: {
      ...materialData,
      ...(ids.length > 0 && {
        posicoesPossiveis: {
          create: ids.map((posicaoId) => ({ posicaoId })),
        },
      }),
    },
  });
}

export async function atualizarMaterial(
  id: string,
  data: {
    descricao?: string;
    unidade?: string;
    estoqueMinimo?: number;
    localizacaoId?: string | null;
    posicoesPossiveisIds?: string[];
    observacao?: string | null;
    ativo?: boolean;
  }
) {
  const { posicoesPossiveisIds, ...materialData } = data;

  if (typeof posicoesPossiveisIds === "undefined") {
    return prisma.material.update({ where: { id }, data: materialData });
  }

  const ids = Array.from(new Set((posicoesPossiveisIds ?? []).filter(Boolean)));
  return prisma.$transaction(async (tx) => {
    const material = await tx.material.update({ where: { id }, data: materialData });
    await tx.materialPosicaoPossivel.deleteMany({ where: { materialId: id } });
    if (ids.length > 0) {
      await tx.materialPosicaoPossivel.createMany({
        data: ids.map((posicaoId) => ({ materialId: id, posicaoId })),
      });
    }
    return material;
  });
}


