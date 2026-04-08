import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "NÃ£o autenticado" }, { status: 401 });
  const perfil = (session.user as { perfil?: string }).perfil ?? "OPERADOR";
  if (perfil !== "ADMIN") return NextResponse.json({ error: "Apenas ADMIN pode executar esta operaÃ§Ã£o" }, { status: 403 });

  // Agrupa materiais por descriÃ§Ã£o (case-insensitive), mantÃ©m o que tem maior quantidade
  const materiais = await prisma.material.findMany({ orderBy: { criadoEm: "asc" } });
  const gruposMat = new Map<string, typeof materiais>();
  for (const m of materiais) {
    const chave = m.descricao.trim().toLowerCase();
    if (!gruposMat.has(chave)) gruposMat.set(chave, []);
    gruposMat.get(chave)!.push(m);
  }

  const deletarMat: string[] = [];
  const atualizarMat: { id: string; quantidadeAtual: number }[] = [];

  for (const grupo of Array.from(gruposMat.values())) {
    if (grupo.length <= 1) continue;
    // MantÃ©m o mais antigo, pega a maior quantidade do grupo
    const maisAntigo = grupo.reduce((acc, m) => m.criadoEm < acc.criadoEm ? m : acc);
    const maiorQtd = Math.max(...grupo.map((m) => m.quantidadeAtual));
    if (maiorQtd !== maisAntigo.quantidadeAtual) {
      atualizarMat.push({ id: maisAntigo.id, quantidadeAtual: maiorQtd });
    }
    deletarMat.push(...grupo.filter((m) => m.id !== maisAntigo.id).map((m) => m.id));
  }

  // Agrupa equipamentos por descriÃ§Ã£o + numeroSerie (ambos case-insensitive)
  const equips = await prisma.equipamento.findMany({ orderBy: { criadoEm: "asc" } });
  const gruposEquip = new Map<string, typeof equips>();
  for (const e of equips) {
    const chave = `${e.descricao.trim().toLowerCase()}||${e.numeroSerie.trim().toLowerCase()}`;
    if (!gruposEquip.has(chave)) gruposEquip.set(chave, []);
    gruposEquip.get(chave)!.push(e);
  }

  const deletarEquip: string[] = [];
  for (const grupo of Array.from(gruposEquip.values())) {
    if (grupo.length <= 1) continue;
    // MantÃ©m o mais antigo, deleta os demais
    const [, ...remover] = grupo;
    deletarEquip.push(...remover.map((e) => e.id));
  }

  await prisma.$transaction(async (tx) => {
    // Atualiza quantidades antes de deletar
    for (const { id, quantidadeAtual } of atualizarMat) {
      await tx.material.update({ where: { id }, data: { quantidadeAtual } });
    }
    if (deletarMat.length > 0) {
      await tx.movimentacaoConsumivel.deleteMany({ where: { materialId: { in: deletarMat } } });
      await tx.material.deleteMany({ where: { id: { in: deletarMat } } });
    }
    if (deletarEquip.length > 0) {
      await tx.movimentacaoEquipamento.deleteMany({ where: { equipamentoId: { in: deletarEquip } } });
      await tx.equipamento.deleteMany({ where: { id: { in: deletarEquip } } });
    }
  });

  return NextResponse.json({
    materiaisRemovidos: deletarMat.length,
    equipamentosRemovidos: deletarEquip.length,
  });
}

