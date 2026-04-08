import { NextResponse } from "next/server";
import { atualizarAtividadeAction } from "@/actions/cadastros.actions";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const fd = await req.formData();
  const result = await atualizarAtividadeAction(params.id, fd);
  return NextResponse.json(result);
}
