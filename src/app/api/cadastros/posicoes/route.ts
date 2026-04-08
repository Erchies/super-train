import { NextRequest, NextResponse } from "next/server";
import { listarPosicoesPossiveis } from "@/repositories/cadastros.repository";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const serie = searchParams.get("serie") ?? undefined;
  const carro = searchParams.get("carro") ?? undefined;
  // nomeEquipamento: nome do tipo/modelo do equipamento (agrupa por tipo, não por n° de série)
  const nomeEquipamento = searchParams.get("nomeEquipamento") ?? undefined;
  const apenasAtivos = searchParams.get("apenasAtivos") !== "false";

  const data = await listarPosicoesPossiveis({ serie, carro, nomeEquipamento, apenasAtivos });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const fd = await req.formData();
  const { criarPosicaoPossivelAction } = await import("@/actions/cadastros.actions");
  const result = await criarPosicaoPossivelAction(fd);
  return NextResponse.json(result);
}
