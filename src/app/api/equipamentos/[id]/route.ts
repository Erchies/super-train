import { NextRequest, NextResponse } from "next/server";
import { buscarEquipamentoPorId } from "@/repositories/equipamento.repository";
import { atualizarEquipamentoAction } from "@/actions/equipamento.actions";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const equip = await buscarEquipamentoPorId(params.id);
  if (!equip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(equip);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const result = await atualizarEquipamentoAction(params.id, data);
  return NextResponse.json(result);
}
