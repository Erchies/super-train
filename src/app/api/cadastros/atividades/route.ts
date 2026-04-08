import { NextResponse } from "next/server";
import { listarAtividades } from "@/repositories/cadastros.repository";

export async function GET() {
  const data = await listarAtividades();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const fd = await req.formData();
  const { criarAtividadeAction } = await import("@/actions/cadastros.actions");
  const result = await criarAtividadeAction(fd);
  return NextResponse.json(result);
}
