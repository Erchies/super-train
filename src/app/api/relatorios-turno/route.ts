import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Converter data do formulário
    const dataRelatorio = body.data ? new Date(body.data + "T12:00:00") : new Date();

    const relatorio = await prisma.$transaction(async (tx) => {
      // Criar o relatório principal
      const rel = await tx.relatorioTurno.create({
        data: {
          data: dataRelatorio,
          turno: body.turno || "—",
          responsavelId: session.id,
          responsavelNome: body.supervisorTurno || session.name,
          equipeTrensurb: body.equipe || null,
          condicoesGeraisTurno: body.condicoesGeraisTurno || null,
          observacoesGerais: body.outros || null,
          status: "ABERTO",
        },
      });

      // Criar atendimentos
      if (body.atendimentos && Array.isArray(body.atendimentos)) {
        for (const atend of body.atendimentos) {
          // Só criar se tem algum dado preenchido
          const temDados = atend.tueNumero || atend.ticket || atend.sintoma;
          if (!temDados) continue;

          // Buscar TUE se informado
          let tueId: string | null = null;
          let tueNumero: string | null = atend.tueNumero || null;
          if (tueNumero) {
            const tue = await tx.tUE.findUnique({ where: { numero: tueNumero } });
            if (tue) tueId = tue.id;
          }

          await tx.atendimentoTurno.create({
            data: {
              relatorioTurnoId: rel.id,
              tipoRegistro: atend.nivel ? `NIVEL_${atend.nivel}` : "TICKET",
              numeroRegistro: atend.ticket || "—",
              tueId,
              tueNumero,
              carro: null,
              sistema: null,
              equipamento: null,
              sintomaInformado: atend.sintoma || "—",
              diagnosticoEncontrado: atend.constatacao || null,
              servicoExecutado: atend.intervencao || null,
              materialUtilizado: null,
              equipeExecutante: null,
              situacaoFinal: atend.informacaoRepasse || "—",
              observacaoProximoTurno: null,
            },
          });
        }
      }

      return rel;
    });

    return NextResponse.json({ success: true, id: relatorio.id });
  } catch (e) {
    console.error("[API RelatorioTurno] Erro:", e);
    return NextResponse.json(
      { error: "Erro ao salvar relatório de turno" },
      { status: 500 }
    );
  }
}
