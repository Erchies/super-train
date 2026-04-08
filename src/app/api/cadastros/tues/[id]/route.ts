import { NextResponse } from "next/server";
import { atualizarTUEAction, excluirTUEAction } from "@/actions/cadastros.actions";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const fd = await req.formData();
  const result = await atualizarTUEAction(params.id, fd);
  return NextResponse.json(result);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const result = await excluirTUEAction(params.id);
  return NextResponse.json(result);
}
