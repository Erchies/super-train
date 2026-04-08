import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10));
  const pageSize = Math.min(100, parseInt(params.get("pageSize") ?? "50", 10));
  const apenasExcecoes = params.get("apenasExcecoes") === "1";
  const dataInicio = params.get("dataInicio");
  const dataFim = params.get("dataFim");

  const skip = (page - 1) * pageSize;

  const dateFilter = {
    ...(dataInicio ? { gte: new Date(`${dataInicio}T00:00:00`) } : {}),
    ...(dataFim ? { lte: new Date(`${dataFim}T23:59:59`) } : {}),
  };

  const excFilter = apenasExcecoes ? { ehExcecao: true } : {};
  const hasDates = Boolean(dataInicio || dataFim);

  const [consumiveis, equipamentos, totalCons, totalEquip, totalExcCons, totalExcEquip] =
    await Promise.all([
      prisma.movimentacaoConsumivel.findMany({
        where: { ...excFilter, ...(hasDates ? { realizadoEm: dateFilter } : {}) },
        include: {
          material: { select: { codigoTrensurb: true, descricao: true } },
          usuario: { select: { nome: true } },
          autorizador: { select: { nome: true } },
        },
        orderBy: { criadoEm: "desc" },
      }),
      prisma.movimentacaoEquipamento.findMany({
        where: { ...excFilter, ...(hasDates ? { realizadoEm: dateFilter } : {}) },
        include: {
          equipamento: { select: { numeroSerie: true, descricao: true } },
          usuario: { select: { nome: true } },
          autorizador: { select: { nome: true } },
        },
        orderBy: { criadoEm: "desc" },
      }),
      prisma.movimentacaoConsumivel.count(),
      prisma.movimentacaoEquipamento.count(),
      prisma.movimentacaoConsumivel.count({ where: { ehExcecao: true } }),
      prisma.movimentacaoEquipamento.count({ where: { ehExcecao: true } }),
    ]);

  const merged = [
    ...consumiveis.map((m) => ({
      id: m.id,
      origem: "CONSUMIVEL" as const,
      tipo: m.tipo,
      descricao: `${m.material.codigoTrensurb} - ${m.material.descricao} | Qtd: ${m.quantidade}${m.numeroOS ? ` | OS: ${m.numeroOS}` : ""}${m.numeroChamado ? ` | Cham: ${m.numeroChamado}` : ""}`,
      ehExcecao: m.ehExcecao,
      justificativa: m.justificativa,
      autorizadoPor: m.autorizador?.nome ?? null,
      realizadoPor: m.usuario.nome,
      realizadoEm: m.realizadoEm.toISOString(),
      criadoEm: m.criadoEm.toISOString(),
    })),
    ...equipamentos.map((m) => ({
      id: m.id,
      origem: "EQUIPAMENTO" as const,
      tipo: m.tipo,
      descricao: `${m.equipamento.numeroSerie} - ${m.equipamento.descricao} -> ${m.statusNovo}`,
      ehExcecao: m.ehExcecao,
      justificativa: m.justificativa,
      autorizadoPor: m.autorizador?.nome ?? null,
      realizadoPor: m.usuario.nome,
      realizadoEm: m.realizadoEm.toISOString(),
      criadoEm: m.criadoEm.toISOString(),
    })),
  ].sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

  const total = merged.length;
  const items = merged.slice(skip, skip + pageSize);

  return NextResponse.json({
    items,
    total,
    resumo: {
      totalConsumivel: totalCons,
      totalEquipamento: totalEquip,
      totalExcecoes: totalExcCons + totalExcEquip,
    },
  });
}
