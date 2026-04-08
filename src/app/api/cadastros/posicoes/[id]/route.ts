import { NextResponse } from "next/server";
import { atualizarPosicaoPossivelAction, excluirPosicaoPossivelAction } from "@/actions/cadastros.actions";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const fd = await req.formData();
  const result = await atualizarPosicaoPossivelAction(params.id, fd);
  return NextResponse.json(result);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const result = await excluirPosicaoPossivelAction(params.id);
  return NextResponse.json(result);
}
