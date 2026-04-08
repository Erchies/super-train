import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const numeroSerie = req.nextUrl.searchParams.get("numeroSerie");
  if (!numeroSerie) return NextResponse.json(null, { status: 400 });

  const equip = await prisma.equipamento.findFirst({
    where: { numeroSerie: { equals: numeroSerie } },
    include: {
      movimentacoes: {
        orderBy: { realizadoEm: "desc" },
        include: {
          tue: { select: { numero: true } },
          posicao: { select: { codigo: true } },
          funcao: { select: { codigo: true } },
          oficina: { select: { nome: true } },
          usuario: { select: { nome: true } },
        },
      },
    },
  });

  if (!equip) return NextResponse.json(null, { status: 404 });

  return NextResponse.json({
    ...equip,
    movimentacoes: equip.movimentacoes.map((m) => ({
      ...m,
      realizadoPor: m.usuario.nome,
    })),
  });
}
