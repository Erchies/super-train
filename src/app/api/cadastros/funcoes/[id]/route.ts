import { NextResponse } from "next/server";
import { atualizarFuncaoAction } from "@/actions/cadastros.actions";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const fd = await req.formData();
  const result = await atualizarFuncaoAction(params.id, fd);
  return NextResponse.json(result);
}
