import { NextResponse } from "next/server";
import { atualizarCarroAction, excluirCarroAction } from "@/actions/cadastros.actions";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const fd = await req.formData();
  const result = await atualizarCarroAction(params.id, fd);
  return NextResponse.json(result);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const result = await excluirCarroAction(params.id);
  return NextResponse.json(result);
}
