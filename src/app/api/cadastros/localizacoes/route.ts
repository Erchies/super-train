import { NextResponse } from "next/server";
import { listarLocalizacoes } from "@/repositories/cadastros.repository";

export async function GET() {
  const data = await listarLocalizacoes();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const fd = await req.formData();
  const { criarLocalizacaoAction } = await import("@/actions/cadastros.actions");
  const result = await criarLocalizacaoAction(fd);
  return NextResponse.json(result);
}
