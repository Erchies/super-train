import { NextResponse } from "next/server";
import { listarCarros } from "@/repositories/cadastros.repository";

export async function GET() {
  const data = await listarCarros(true); // apenas ativos
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const fd = await req.formData();
  const { criarCarroAction } = await import("@/actions/cadastros.actions");
  const result = await criarCarroAction(fd);
  return NextResponse.json(result);
}
