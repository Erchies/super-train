import { NextResponse } from "next/server";
import { listarFuncoes } from "@/repositories/cadastros.repository";

export async function GET() {
  const data = await listarFuncoes();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const fd = await req.formData();
  const { criarFuncaoAction } = await import("@/actions/cadastros.actions");
  const result = await criarFuncaoAction(fd);
  return NextResponse.json(result);
}
