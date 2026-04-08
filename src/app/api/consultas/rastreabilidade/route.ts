import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const numeroOS = req.nextUrl.searchParams.get("numeroOS");
  const numeroChamado = req.nextUrl.searchParams.get("numeroChamado");

  if (!numeroOS && !numeroChamado) {
    return NextResponse.json({ consumiveis: [], equipamentos: [] });
  }

  const [consumiveis, equipamentos] = await Promise.all([
    prisma.movimentacaoConsumivel.findMany({
      where: {
        ...(numeroOS ? { numeroOS } : {}),
        ...(numeroChamado ? { numeroChamado } : {}),
      },
      include: {
        material: { select: { codigoTrensurb: true, descricao: true, unidade: true } },
        atividade: { select: { codigo: true, descricao: true } },
        usuario: { select: { nome: true } },
      },
      orderBy: { realizadoEm: "desc" },
    }),
    prisma.movimentacaoEquipamento.findMany({
      where: {
        ...(numeroOS ? { numeroOS } : {}),
      },
      include: {
        equipamento: { select: { numeroSerie: true, descricao: true } },
        tue: { select: { numero: true } },
        posicao: { select: { codigo: true } },
        usuario: { select: { nome: true } },
      },
      orderBy: { realizadoEm: "desc" },
    }),
  ]);

  return NextResponse.json({
    consumiveis: consumiveis.map((m) => ({ ...m, realizadoPor: m.usuario.nome })),
    equipamentos: equipamentos.map((m) => ({ ...m, realizadoPor: m.usuario.nome })),
  });
}

