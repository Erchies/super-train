import { prisma } from "@/lib/prisma";

// ── Localizações ──────────────────────────────────────────────────────────────

export async function listarLocalizacoes(apenasAtivos = false) {
  return prisma.localizacao.findMany({
    where: apenasAtivos ? { ativo: true } : undefined,
    orderBy: { codigo: "asc" },
  });
}

export async function criarLocalizacao(data: { codigo: string; descricao: string }) {
  return prisma.localizacao.create({ data });
}

export async function atualizarLocalizacao(id: string, data: { codigo?: string; descricao?: string; ativo?: boolean }) {
  return prisma.localizacao.update({ where: { id }, data });
}

export async function excluirLocalizacao(id: string) {
  // Verificar dependências
  const [materiais, equipamentos] = await Promise.all([
    prisma.material.count({ where: { localizacaoId: id } }),
    prisma.equipamento.count({ where: { localizacaoId: id } }),
  ]);
  if (materiais > 0 || equipamentos > 0) {
    throw new Error(`Não é possível excluir: localização usada por ${materiais + equipamentos} registro(s)`);
  }
  return prisma.localizacao.delete({ where: { id } });
}

// ── TUEs ──────────────────────────────────────────────────────────────────────

export async function listarTUEs(apenasAtivos = false) {
  return prisma.tUE.findMany({
    where: apenasAtivos ? { ativo: true } : undefined,
    orderBy: { numero: "asc" },
  });
}

export async function buscarTUE(id: string) {
  return prisma.tUE.findUnique({ where: { id } });
}

export async function criarTUE(data: { numero: string; serie: "SERIE_100" | "SERIE_200"; descricao?: string }) {
  return prisma.tUE.create({ data });
}

export async function atualizarTUE(id: string, data: { numero?: string; serie?: "SERIE_100" | "SERIE_200"; descricao?: string; ativo?: boolean }) {
  return prisma.tUE.update({ where: { id }, data });
}

export async function excluirTUE(id: string) {
  const [equipamentos, movimentacoes] = await Promise.all([
    prisma.equipamento.count({ where: { tueId: id } }),
    prisma.movimentacaoEquipamento.count({ where: { tueId: id } }),
  ]);
  if (equipamentos > 0) {
    throw new Error(`Não é possível excluir: TUE possui ${equipamentos} equipamento(s) instalado(s) ou com histórico`);
  }
  if (movimentacoes > 0) {
    throw new Error(`Não é possível excluir: TUE possui ${movimentacoes} movimentação(ões) registrada(s)`);
  }
  return prisma.tUE.delete({ where: { id } });
}

// ── Carros (tabela posicoes) ───────────────────────────────────────────────────

export async function listarCarros(apenasAtivos = false) {
  return prisma.posicao.findMany({
    where: apenasAtivos ? { ativo: true } : undefined,
    orderBy: { codigo: "asc" },
  });
}

export async function criarCarro(data: { codigo: string; descricao: string }) {
  return prisma.posicao.create({ data });
}

export async function atualizarCarro(id: string, data: { codigo?: string; descricao?: string; ativo?: boolean }) {
  return prisma.posicao.update({ where: { id }, data });
}

export async function excluirCarro(id: string) {
  const [movimentacoes, materiais] = await Promise.all([
    prisma.movimentacaoEquipamento.count({ where: { posicaoId: id } }),
    prisma.materialPosicaoPossivel.count({ where: { posicaoId: id } }),
  ]);
  if (movimentacoes > 0 || materiais > 0) {
    throw new Error(`Não é possível excluir: carro referenciado em ${movimentacoes + materiais} registro(s) histórico(s)`);
  }
  return prisma.posicao.delete({ where: { id } });
}

// ── Posições Possíveis (Série + Carro + Nome do Equipamento + Posição) ──────────
// Posições vinculadas à SÉRIE (não ao TUE individual).
// O nome do equipamento agrupa por tipo — equipamentos do mesmo tipo compartilham posições.

export async function listarPosicoesPossiveis(filtros?: {
  serie?: string;
  carro?: string;
  nomeEquipamento?: string;
  apenasAtivos?: boolean;
}) {
  return prisma.posicaoPossivel.findMany({
    where: {
      ...(filtros?.apenasAtivos ? { ativo: true } : {}),
      ...(filtros?.serie ? { serie: filtros.serie } : {}),
      ...(filtros?.carro ? { carro: filtros.carro } : {}),
      ...(filtros?.nomeEquipamento ? { nomeEquipamento: filtros.nomeEquipamento } : {}),
    },
    orderBy: [{ nomeEquipamento: "asc" }, { serie: "asc" }, { carro: "asc" }, { posicao: "asc" }],
  });
}

export async function buscarPosicaoPossivel(id: string) {
  return prisma.posicaoPossivel.findUnique({ where: { id } });
}

export async function criarPosicaoPossivel(data: {
  nomeEquipamento: string;
  serie: string;
  carro: string;
  posicao: string;
}) {
  return prisma.posicaoPossivel.create({ data });
}

export async function atualizarPosicaoPossivel(
  id: string,
  data: { nomeEquipamento?: string; serie?: string; carro?: string; posicao?: string; ativo?: boolean }
) {
  return prisma.posicaoPossivel.update({ where: { id }, data });
}

export async function excluirPosicaoPossivel(id: string) {
  return prisma.posicaoPossivel.delete({ where: { id } });
}

// Retorna posições disponíveis para Série + Carro + Nome do Equipamento.
// Chamado nas movimentações para validar/sugerir posição.
export async function listarPosicoesDisponiveisPorContexto(
  nomeEquipamento: string,
  serie: string,
  carro: string
) {
  return prisma.posicaoPossivel.findMany({
    where: { nomeEquipamento, serie, carro, ativo: true },
    orderBy: { posicao: "asc" },
  });
}

// Retorna carros distintos configurados para um item+série (para dropdown de carros nas movimentações)
export async function listarCarrosDisponiveisPorContexto(nomeEquipamento: string, serie: string) {
  const rows = await prisma.posicaoPossivel.findMany({
    where: { nomeEquipamento, serie, ativo: true },
    select: { carro: true },
    distinct: ["carro"],
    orderBy: { carro: "asc" },
  });
  return rows.map((r) => r.carro);
}

// Retorna nomes únicos de equipamentos cadastrados em posições possíveis (para autocomplete)
export async function listarNomesEquipamentosEmPosicoes() {
  const rows = await prisma.posicaoPossivel.findMany({
    select: { nomeEquipamento: true },
    distinct: ["nomeEquipamento"],
    orderBy: { nomeEquipamento: "asc" },
  });
  return rows.map((r) => r.nomeEquipamento);
}

// ── Funções ───────────────────────────────────────────────────────────────────

export async function listarFuncoes(apenasAtivos = false) {
  return prisma.funcao.findMany({
    where: apenasAtivos ? { ativo: true } : undefined,
    orderBy: { codigo: "asc" },
  });
}

export async function criarFuncao(data: { codigo: string; descricao: string }) {
  return prisma.funcao.create({ data });
}

export async function atualizarFuncao(id: string, data: { codigo?: string; descricao?: string; ativo?: boolean }) {
  return prisma.funcao.update({ where: { id }, data });
}

// ── Oficinas ──────────────────────────────────────────────────────────────────

export async function listarOficinas(apenasAtivos = false) {
  return prisma.oficina.findMany({
    where: apenasAtivos ? { ativo: true } : undefined,
    orderBy: { nome: "asc" },
  });
}

export async function criarOficina(data: { nome: string; tipo: string; contato?: string }) {
  return prisma.oficina.create({ data });
}

export async function atualizarOficina(id: string, data: { nome?: string; tipo?: string; contato?: string; ativo?: boolean }) {
  return prisma.oficina.update({ where: { id }, data });
}

// ── Atividades ────────────────────────────────────────────────────────────────

export async function listarAtividades(apenasAtivos = false) {
  return prisma.atividade.findMany({
    where: apenasAtivos ? { ativo: true } : undefined,
    orderBy: { codigo: "asc" },
  });
}

export async function criarAtividade(data: { codigo: string; descricao: string }) {
  return prisma.atividade.create({ data });
}

export async function atualizarAtividade(id: string, data: { codigo?: string; descricao?: string; ativo?: boolean }) {
  return prisma.atividade.update({ where: { id }, data });
}

// ── Alias legado ──────────────────────────────────────────────────────────────
export const listarPosicoes = listarCarros;
export const criarPosicao = criarCarro;
export const atualizarPosicao = atualizarCarro;
