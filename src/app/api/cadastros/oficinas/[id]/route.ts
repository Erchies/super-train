import { NextResponse } from "next/server";
import { atualizarOficinaAction } from "@/actions/cadastros.actions";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const fd = await req.formData();
  const result = await atualizarOficinaAction(params.id, fd);
  return NextResponse.json(result);
}
